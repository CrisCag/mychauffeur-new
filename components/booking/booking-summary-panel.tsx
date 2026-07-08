"use client";

import { ShieldCheck } from "lucide-react";
import { TripRouteMap } from "@/components/booking/trip-route-map";
import type { BookingFlowSnapshotV1 } from "@/lib/booking-flow-storage";
import type { TripStopInput, TripVehicleType } from "@/types/trip";

function formatDuration(totalMin: number, locale: string): string {
  const m = Math.max(0, Math.round(totalMin));
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h <= 0) return `${min} min`;
  return `${h}h ${min}m`;
}

const VEHICLE_LABELS: Record<TripVehicleType, { it: string; en: string }> = {
  sedan: { it: "Berlina", en: "Sedan" },
  van: { it: "Van", en: "Van" },
  luxury: { it: "Luxury", en: "Luxury" },
};

export function BookingSummaryPanel({
  snapshot,
  tripStops,
  locale,
  step,
  recalculating,
  mapHint,
  consentHint,
  trustCancelFree,
}: {
  snapshot: BookingFlowSnapshotV1;
  tripStops: TripStopInput[];
  locale: string;
  step: 1 | 2 | 3;
  recalculating?: boolean;
  mapHint: string;
  consentHint: string;
  trustCancelFree: string;
}) {
  const isEn = locale === "en";
  const selectedQuote = snapshot.selectedVehicle
    ? snapshot.quotes[snapshot.selectedVehicle]
    : null;
  const vehicleLabel = snapshot.selectedVehicle
    ? VEHICLE_LABELS[snapshot.selectedVehicle][isEn ? "en" : "it"]
    : null;

  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <div className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-lg">
        <TripRouteMap
          origin={snapshot.pickup}
          destination={snapshot.destination}
          tripStops={tripStops}
          locale={locale}
          mapHint={mapHint}
          consentHint={consentHint}
        />
      </div>

      <div className="rounded-xl border border-border bg-card/90 p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary">
          {isEn ? "Your trip" : "Il tuo viaggio"}
        </p>

        <div className="mt-3 space-y-2 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {isEn ? "From" : "Partenza"}
            </p>
            <p className="font-medium leading-snug">{snapshot.pickup}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {isEn ? "To" : "Destinazione"}
            </p>
            <p className="font-medium leading-snug">{snapshot.destination}</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs">
          <div>
            <dt className="text-muted-foreground">{isEn ? "Date" : "Data"}</dt>
            <dd className="font-medium">{snapshot.travelDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{isEn ? "Time" : "Ora"}</dt>
            <dd className="font-medium">{snapshot.pickupTime}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{isEn ? "Passengers" : "Passeggeri"}</dt>
            <dd className="font-medium">{snapshot.passengers}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{isEn ? "Distance" : "Distanza"}</dt>
            <dd className="font-medium">~{snapshot.distanceKm.toFixed(0)} km</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">{isEn ? "Drive time" : "Tempo di guida"}</dt>
            <dd className="font-medium">
              ~{formatDuration(snapshot.durationMinutesEstimate, locale)}
              {recalculating ? (isEn ? " · updating…" : " · aggiornamento…") : ""}
            </dd>
          </div>
        </dl>

        {tripStops.length > 0 ? (
          <div className="mt-3 border-t border-border/60 pt-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {isEn ? "Stops" : "Fermate"} ({tripStops.length})
            </p>
            <ul className="mt-1 space-y-1 text-xs">
              {tripStops.map((stop, i) => (
                <li key={stop.id} className="truncate text-foreground/90">
                  {i + 1}. {stop.label} · {formatDuration(stop.durationMinutes, locale)}
                </li>
              ))}
            </ul>
          </div>
        ) : step === 1 ? (
          <p className="mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            {isEn
              ? "No sightseeing stops yet — optional, like Daytrip."
              : "Nessuna fermata turistica — opzionale, come su Daytrip."}
          </p>
        ) : null}

        {snapshot.noRushVip ? (
          <p className="mt-3 text-xs font-medium text-primary">No Rush · VIP Max Comfort</p>
        ) : null}

        {selectedQuote && step >= 2 ? (
          <div className="mt-4 border-t border-border/60 pt-4">
            {vehicleLabel ? (
              <p className="text-xs text-muted-foreground">{vehicleLabel}</p>
            ) : null}
            <p className="text-2xl font-bold tabular-nums">
              €{selectedQuote.totalPrice}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {snapshot.currency}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isEn ? "Estimated all-inclusive price" : "Prezzo stimato tutto incluso"}
            </p>
          </div>
        ) : step >= 2 ? (
          <p className="mt-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            {isEn ? "Select a vehicle to see the total." : "Seleziona un veicolo per il totale."}
          </p>
        ) : null}
      </div>

      <p className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
        {trustCancelFree}
      </p>
    </aside>
  );
}
