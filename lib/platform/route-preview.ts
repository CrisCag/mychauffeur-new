import { resolveLatLngForPricing } from "@/lib/platform/pricing-engine";
import { resolvePoiStopsByIds } from "@/lib/platform/poi-query";
import { getStaticPoiByIds } from "@/lib/platform/static-pois";
import { tryGetSupabaseAdminClient } from "@/lib/platform/supabase-admin";
import type { TripStopInput } from "@/types/trip";

export type RouteMapPoint = {
  id: string;
  type: "origin" | "stop" | "destination";
  label: string;
  lat: number;
  lng: number;
  stopIndex?: number;
};

export type RoutePreviewResult = {
  points: RouteMapPoint[];
  path: { lat: number; lng: number }[];
  provider: "google" | "simulated";
};

async function resolveStopCoordinates(
  stops: TripStopInput[]
): Promise<
  | { ok: true; data: { id: string; label: string; lat: number; lng: number }[] }
  | { ok: false; error: string }
> {
  if (stops.length === 0) {
    return { ok: true, data: [] };
  }

  const supabase = tryGetSupabaseAdminClient();
  const catalogIds = stops.filter((s) => s.kind === "catalog").map((s) => s.id);
  const catalogById = new Map<string, { name: string; lat: number; lng: number }>();

  if (catalogIds.length > 0) {
    const { data: poiRows } = await resolvePoiStopsByIds(supabase, catalogIds);
    for (const row of poiRows) {
      catalogById.set(row.id, { name: row.name, lat: row.lat, lng: row.lng });
    }
    for (const row of getStaticPoiByIds(catalogIds.filter((id) => !catalogById.has(id)))) {
      catalogById.set(row.id, { name: row.name, lat: row.lat, lng: row.lng });
    }
  }

  const resolved: { id: string; label: string; lat: number; lng: number }[] = [];

  for (const stop of stops) {
    if (stop.kind === "catalog") {
      const poi = catalogById.get(stop.id);
      if (!poi) {
        return { ok: false, error: `Fermata «${stop.label}» non trovata.` };
      }
      resolved.push({
        id: stop.id,
        label: stop.label || poi.name,
        lat: poi.lat,
        lng: poi.lng,
      });
      continue;
    }

    const address = (stop.address ?? stop.label).trim();
    if (!address) {
      return { ok: false, error: "Indirizzo fermata personalizzata mancante." };
    }

    let lat = stop.lat;
    let lng = stop.lng;
    if (lat == null || lng == null) {
      const coords = await resolveLatLngForPricing(address);
      if (!coords) {
        return { ok: false, error: `Impossibile geolocalizzare: ${address}` };
      }
      lat = coords.lat;
      lng = coords.lng;
    }

    resolved.push({
      id: stop.id,
      label: stop.label || address,
      lat,
      lng,
    });
  }

  return { ok: true, data: resolved };
}

function decodeGooglePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

async function fetchDirectionsPath(
  routePoints: RouteMapPoint[]
): Promise<{ path: { lat: number; lng: number }[]; provider: "google" | "simulated" }> {
  const googleApiKey =
    process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleApiKey || routePoints.length < 2) {
    return { path: routePoints.map((p) => ({ lat: p.lat, lng: p.lng })), provider: "simulated" };
  }

  const origin = routePoints[0];
  const destination = routePoints[routePoints.length - 1];
  const waypoints = routePoints.slice(1, -1);

  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    key: googleApiKey,
    mode: "driving",
  });

  if (waypoints.length > 0) {
    params.set(
      "waypoints",
      waypoints.map((w) => `${w.lat},${w.lng}`).join("|")
    );
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      throw new Error("directions failed");
    }
    const payload = (await res.json()) as {
      routes?: Array<{ overview_polyline?: { points?: string } }>;
    };
    const encoded = payload.routes?.[0]?.overview_polyline?.points;
    if (encoded) {
      return { path: decodeGooglePolyline(encoded), provider: "google" };
    }
  } catch {
    // fallback
  }

  return { path: routePoints.map((p) => ({ lat: p.lat, lng: p.lng })), provider: "simulated" };
}

export async function buildRoutePreview(input: {
  origin: string;
  destination: string;
  stops: TripStopInput[];
}): Promise<{ ok: true; data: RoutePreviewResult } | { ok: false; error: string }> {
  const originText = input.origin.trim();
  const destinationText = input.destination.trim();

  if (!originText || !destinationText) {
    return { ok: false, error: "Partenza e destinazione obbligatorie." };
  }

  const [originLL, destLL, stopsResolved] = await Promise.all([
    resolveLatLngForPricing(originText),
    resolveLatLngForPricing(destinationText),
    resolveStopCoordinates(input.stops),
  ]);

  if (!originLL) {
    return { ok: false, error: "Impossibile geolocalizzare la partenza." };
  }
  if (!destLL) {
    return { ok: false, error: "Impossibile geolocalizzare la destinazione." };
  }
  if (!stopsResolved.ok) {
    return { ok: false, error: stopsResolved.error };
  }

  const points: RouteMapPoint[] = [
    {
      id: "origin",
      type: "origin",
      label: originText,
      lat: originLL.lat,
      lng: originLL.lng,
    },
    ...stopsResolved.data.map((stop, index) => ({
      id: stop.id,
      type: "stop" as const,
      label: stop.label,
      lat: stop.lat,
      lng: stop.lng,
      stopIndex: index + 1,
    })),
    {
      id: "destination",
      type: "destination",
      label: destinationText,
      lat: destLL.lat,
      lng: destLL.lng,
    },
  ];

  const { path, provider } = await fetchDirectionsPath(points);

  return {
    ok: true,
    data: {
      points,
      path,
      provider,
    },
  };
}

/** Limite fermate per tratta (configurabile). */
export const MAX_TRIP_STOPS = 10;
