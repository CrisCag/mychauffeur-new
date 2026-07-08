"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, MapPin, Navigation } from "lucide-react";
import { useCookieConsent } from "@/components/gdpr/cookie-consent-context";
import { canLoadThirdPartyMaps } from "@/lib/cookie-consent";
import {
  getGoogleMapsApiKey,
  loadGoogleMapsPlacesScript,
  type GoogleMapsApi,
} from "@/lib/google-maps";
import type { RouteMapPoint } from "@/lib/platform/route-preview";
import type { TripStopInput } from "@/types/trip";

type RoutePreviewResponse = {
  success: boolean;
  error?: string;
  points?: RouteMapPoint[];
  path?: { lat: number; lng: number }[];
  provider?: "google" | "simulated";
};

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return loadGoogleMapsPlacesScript(apiKey);
}

function markerColor(type: RouteMapPoint["type"]): string {
  if (type === "origin") return "#16a34a";
  if (type === "destination") return "#dc2626";
  return "#2563eb";
}

function markerLabel(point: RouteMapPoint): string {
  if (point.type === "origin") return "A";
  if (point.type === "destination") return "B";
  return String(point.stopIndex ?? "•");
}

function SchematicRouteMap({
  points,
  path,
  locale,
}: {
  points: RouteMapPoint[];
  path: { lat: number; lng: number }[];
  locale: string;
}) {
  const isEn = locale === "en";
  const routePath = path.length >= 2 ? path : points;

  const bounds = useMemo(() => {
    const lats = routePath.map((p) => p.lat);
    const lngs = routePath.map((p) => p.lng);
    const pad = 0.08;
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = Math.max(maxLat - minLat, 0.05);
    const lngSpan = Math.max(maxLng - minLng, 0.05);
    return {
      minLat: minLat - latSpan * pad,
      maxLat: maxLat + latSpan * pad,
      minLng: minLng - lngSpan * pad,
      maxLng: maxLng + lngSpan * pad,
    };
  }, [routePath]);

  const project = (lat: number, lng: number) => {
    const x =
      bounds.maxLng === bounds.minLng
        ? 50
        : ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y =
      bounds.maxLat === bounds.minLat
        ? 50
        : (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  };

  const polyline = routePath
    .map((p) => {
      const { x, y } = project(p.lat, p.lng);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
      <svg viewBox="0 0 100 56" className="h-52 w-full md:h-64" role="img">
        <title>{isEn ? "Trip route preview" : "Anteprima percorso"}</title>
        <polyline
          points={polyline}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="2 1.5"
          className="text-primary/70"
        />
        {points.map((point) => {
          const { x, y } = project(point.lat, point.lng);
          const color = markerColor(point.type);
          return (
            <g key={point.id}>
              <circle cx={x} cy={y} r="2.8" fill={color} stroke="#fff" strokeWidth="0.5" />
              <text
                x={x}
                y={y + 0.8}
                textAnchor="middle"
                fontSize="2.2"
                fill="#fff"
                fontWeight="700"
              >
                {markerLabel(point)}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="grid gap-1 border-t border-border/60 px-3 py-2 text-xs text-muted-foreground md:grid-cols-2">
        {points.map((point) => (
          <li key={point.id} className="flex items-start gap-2 truncate">
            <span
              className="mt-1 size-2 shrink-0 rounded-full"
              style={{ backgroundColor: markerColor(point.type) }}
            />
            <span className="truncate">
              {point.type === "origin"
                ? isEn
                  ? "From"
                  : "Partenza"
                : point.type === "destination"
                  ? isEn
                    ? "To"
                    : "Destinazione"
                  : `${isEn ? "Stop" : "Fermata"} ${point.stopIndex}`}
              : {point.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GoogleRouteMap({
  points,
  path,
  apiKey,
}: {
  points: RouteMapPoint[];
  path: { lat: number; lng: number }[];
  apiKey: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<Array<{ setMap: (m: unknown) => void }>>([]);
  const polylineRef = useRef<{ setMap: (m: unknown) => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;
      try {
        await loadGoogleMapsScript(apiKey);
        const googleMaps = window.google?.maps as GoogleMapsApi | undefined;
        if (cancelled || !containerRef.current || !googleMaps) return;

        const bounds = new googleMaps.LatLngBounds();
        for (const point of points) {
          bounds.extend({ lat: point.lat, lng: point.lng });
        }

        if (!mapRef.current) {
          mapRef.current = new googleMaps.Map(containerRef.current, {
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              { elementType: "geometry", stylers: [{ color: "#1d1d1f" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#a1a1aa" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a2e" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
            ],
          });
        }

        const map = mapRef.current as { fitBounds: (b: unknown, padding?: number) => void };
        map.fitBounds(bounds, 48);

        for (const marker of markersRef.current) {
          marker.setMap(null);
        }
        markersRef.current = [];

        for (const point of points) {
          const marker = new googleMaps.Marker({
            map: mapRef.current,
            position: { lat: point.lat, lng: point.lng },
            title: point.label,
            label: {
              text: markerLabel(point),
              color: "#ffffff",
              fontWeight: "700",
            },
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              scale: 11,
              fillColor: markerColor(point.type),
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });
          markersRef.current.push(marker);
        }

        polylineRef.current?.setMap(null);
        if (path.length >= 2) {
          polylineRef.current = new googleMaps.Polyline({
            map: mapRef.current,
            path,
            geodesic: true,
            strokeColor: "#c9a962",
            strokeOpacity: 0.9,
            strokeWeight: 4,
          });
        }
      } catch {
        // schematic fallback handled by parent
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [apiKey, path, points]);

  return (
    <div
      ref={containerRef}
      className="h-52 w-full overflow-hidden rounded-xl border border-border md:h-64"
    />
  );
}

export function TripRouteMap({
  origin,
  destination,
  tripStops,
  locale,
  mapHint,
  consentHint,
}: {
  origin: string;
  destination: string;
  tripStops: TripStopInput[];
  locale: string;
  mapHint: string;
  consentHint: string;
}) {
  const { ready, consent } = useCookieConsent();
  const mapsAllowed = ready && canLoadThirdPartyMaps(consent);
  const apiKey = getGoogleMapsApiKey();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<RoutePreviewResponse | null>(null);

  const stopsKey = useMemo(
    () => JSON.stringify(tripStops.map((s) => ({ id: s.id, kind: s.kind, address: s.address }))),
    [tripStops]
  );

  useEffect(() => {
    let cancelled = false;
    async function loadPreview() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/route-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin, destination, stops: tripStops }),
        });
        const data = (await res.json()) as RoutePreviewResponse;
        if (!cancelled) {
          if (!res.ok || !data.success || !data.points) {
            setError(data.error ?? "Route preview failed");
            setPreview(null);
          } else {
            setPreview(data);
          }
        }
      } catch {
        if (!cancelled) {
          setError(locale === "en" ? "Could not load map." : "Impossibile caricare la mappa.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPreview();
    return () => {
      cancelled = true;
    };
  }, [origin, destination, stopsKey, tripStops, locale]);

  const isEn = locale === "en";
  const useGoogle = mapsAllowed && Boolean(apiKey) && preview?.points;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Navigation className="size-3.5 text-primary" aria-hidden />
        {isEn ? "Route preview" : "Anteprima percorso"}
        {preview?.points && preview.points.length > 2 ? (
          <span className="normal-case tracking-normal text-primary/80">
            · {preview.points.length - 2} {isEn ? "stops" : "fermate"}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex h-52 items-center justify-center rounded-xl border border-border bg-muted/20 text-sm text-muted-foreground md:h-64">
          {isEn ? "Loading map…" : "Caricamento mappa…"}
        </div>
      ) : error || !preview?.points ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
          {error || mapHint}
        </div>
      ) : useGoogle ? (
        <GoogleRouteMap
          points={preview.points}
          path={preview.path ?? preview.points}
          apiKey={apiKey}
        />
      ) : (
        <SchematicRouteMap
          points={preview.points}
          path={preview.path ?? preview.points}
          locale={locale}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-green-600" />
          {isEn ? "Departure" : "Partenza"}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3 text-blue-600" />
          {isEn ? "Stops" : "Fermate"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Flag className="size-3 text-red-600" />
          {isEn ? "Destination" : "Destinazione"}
        </span>
        {!mapsAllowed && apiKey ? (
          <span className="text-primary/70">{consentHint}</span>
        ) : null}
      </div>
    </div>
  );
}
