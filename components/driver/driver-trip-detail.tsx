"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WaitTimerDisplay } from "@/components/driver/wait-timer-display";
import { getStatusLabel, type DriverAction } from "@/lib/platform/trip-status-machine";
import type { WaitTimerSnapshot } from "@/lib/platform/wait-timer";
import type { StoredOperationalTrip } from "@/lib/platform/trip-ops-store";

type TripPayload = {
  success: boolean;
  trip: StoredOperationalTrip;
  timer: (WaitTimerSnapshot & { penaltyAmountEur?: number }) | null;
  actions: Array<{
    action: DriverAction;
    labelIt: string;
    labelEn: string;
  }>;
  lastPing: { lat: number; lng: number; recordedAt: string } | null;
};

async function fetchTripPayload(tripId: string): Promise<TripPayload | null> {
  const res = await fetch(`/api/trip-ops/${tripId}`);
  const json = (await res.json()) as TripPayload;
  return json.success ? json : null;
}

export function DriverTripDetailClient({
  tripId,
  locale,
}: {
  tripId: string;
  locale: string;
}) {
  const isEn = locale === "en";
  const [data, setData] = useState<TripPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [gpsOn, setGpsOn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      const payload = await fetchTripPayload(tripId);
      if (cancelled) {
        return;
      }
      if (payload) {
        setData(payload);
      }
      setLoading(false);
    }

    void tick();
    const interval = setInterval(() => void tick(), 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tripId]);

  useEffect(() => {
    if (!gpsOn || !data?.trip) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        void fetch(`/api/trip-ops/${tripId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        });
      },
      () => null,
      { enableHighAccuracy: true, maximumAge: 8000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [gpsOn, data?.trip, tripId]);

  async function runAction(action: DriverAction) {
    setActing(true);
    try {
      await fetch(`/api/trip-ops/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await fetchTripPayload(tripId);
      if (payload) {
        setData(payload);
      }
    } finally {
      setActing(false);
    }
  }

  if (loading || !data?.trip) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {isEn ? "Loading trip…" : "Caricamento corsa…"}
      </p>
    );
  }

  const { trip, timer, actions, lastPing } = data;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <Link href={`/${locale}/driver`} className="text-sm text-primary hover:underline">
        ← {isEn ? "All trips" : "Tutte le corse"}
      </Link>

      <div>
        <p className="text-xs uppercase tracking-wider text-primary">
          {getStatusLabel(trip.lifecycleStatus, locale)}
        </p>
        <h1 className="font-serif text-xl font-semibold">
          {trip.pickupAddress} → {trip.destinationAddress}
        </h1>
        <p className="text-sm text-muted-foreground">
          {trip.scheduledPickupAt.slice(0, 16).replace("T", " ")}
          {trip.passengerName ? ` · ${trip.passengerName}` : ""}
        </p>
        {trip.comfortMode === "no_rush_vip" ? (
          <p className="mt-1 text-xs font-medium text-primary">VIP Max Comfort</p>
        ) : null}
      </div>

      {timer ? <WaitTimerDisplay timer={timer} locale={locale} /> : null}

      <div className="space-y-2">
        {actions.map((a) => (
          <Button
            key={a.action}
            className="w-full"
            size="lg"
            disabled={acting}
            variant={a.action === "report_no_show" ? "destructive" : "default"}
            onClick={() => void runAction(a.action)}
          >
            {isEn ? a.labelEn : a.labelIt}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border border-border p-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={gpsOn}
            onChange={(e) => setGpsOn(e.target.checked)}
          />
          {isEn ? "Send GPS location (tracking)" : "Invia posizione GPS (tracking)"}
        </label>
        {lastPing ? (
          <p className="mt-2 text-xs text-muted-foreground">
            GPS: {lastPing.lat.toFixed(5)}, {lastPing.lng.toFixed(5)}
          </p>
        ) : null}
      </div>

      {trip.stops.length > 0 ? (
        <div className="text-sm">
          <p className="font-medium">{isEn ? "Stops" : "Fermate"}</p>
          <ul className="mt-1 space-y-1 text-muted-foreground">
            {trip.stops.map((s, i) => (
              <li key={s.id}>
                {i + 1}. {s.label} ({s.bookedDurationMinutes} min)
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
