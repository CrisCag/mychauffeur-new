"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStatusLabel } from "@/lib/platform/trip-status-machine";
import type { StoredOperationalTrip } from "@/lib/platform/trip-ops-store";

export function DriverTripsListClient({ locale }: { locale: string }) {
  const isEn = locale === "en";
  const [trips, setTrips] = useState<StoredOperationalTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trip-ops");
      const data = (await res.json()) as { trips?: StoredOperationalTrip[] };
      setTrips(data.trips ?? []);
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {isEn ? "Loading…" : "Caricamento…"}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold">
        {isEn ? "Driver portal" : "Portale autista"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isEn ? "Demo driver · assigned trips" : "Autista demo · corse assegnate"}
      </p>

      {trips.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {isEn
            ? "No trips yet. Complete a booking on the site to create one."
            : "Nessuna corsa. Completa una prenotazione sul sito per crearne una."}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/${locale}/driver/trip/${trip.id}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <p className="text-xs text-primary">
                  {getStatusLabel(trip.lifecycleStatus, locale)}
                </p>
                <p className="font-medium">
                  {trip.pickupAddress} → {trip.destinationAddress}
                </p>
                <p className="text-xs text-muted-foreground">
                  {trip.scheduledPickupAt.slice(0, 16).replace("T", " ")}
                  {trip.quotedPriceEur != null ? ` · €${trip.quotedPriceEur}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
