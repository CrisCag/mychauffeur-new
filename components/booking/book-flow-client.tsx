"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CarFront, Check, Crown, MapPin, Plus, Trash2, Van } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  clearBookingFlowSnapshot,
  loadBookingFlowSnapshot,
  mergeRoundTripQuotes,
  saveBookingFlowSnapshot,
  type BookingFlowSnapshotV1,
  type CalculateApiResponse,
} from "@/lib/booking-flow-storage";
import type { Locale } from "@/lib/i18n-config";
import type { Messages } from "@/messages/types";
import type { TripStopInput, TripVehicleType } from "@/types/trip";

import { BookingSummaryPanel } from "@/components/booking/booking-summary-panel";
import { AddressAutocomplete } from "@/components/booking/address-autocomplete";
import { useCookieConsent } from "@/components/gdpr/cookie-consent-context";
import { Label } from "@/components/ui/label";
import { getGoogleMapsApiKey } from "@/lib/google-maps";
import { MAX_TRIP_STOPS } from "@/lib/platform/route-preview";

type PoiCard = {
  id: string;
  name: string;
  description: string;
  base_stop_price: number;
  suggested_duration_minutes: number;
  tags?: string[];
};

type WaitRatesConfig = {
  durationOptionsMinutes: number[];
  bands: Record<string, { labelIt: string; labelEn: string }>;
};

const VEHICLES: {
  key: TripVehicleType;
  icon: typeof CarFront;
  labelIt: string;
  labelEn: string;
}[] = [
  { key: "sedan", icon: CarFront, labelIt: "Berlina", labelEn: "Sedan" },
  { key: "van", icon: Van, labelIt: "Van", labelEn: "Van" },
  { key: "luxury", icon: Crown, labelIt: "Luxury", labelEn: "Luxury" },
];

function formatDuration(totalMin: number, locale: string): string {
  const m = Math.max(0, Math.round(totalMin));
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h <= 0) {
    return `${min} min`;
  }
  return locale === "en" ? `${h}h ${min}m` : `${h}h ${min}m`;
}

function formatStopDurationOption(minutes: number, locale: string): string {
  return formatDuration(minutes, locale);
}

function normalizeSnapshot(raw: BookingFlowSnapshotV1): BookingFlowSnapshotV1 {
  let tripStops = raw.tripStops ?? [];
  if (tripStops.length === 0 && raw.selectedPoiIds?.length) {
    tripStops = raw.selectedPoiIds.map((id) => ({
      kind: "catalog" as const,
      id,
      label: id,
      durationMinutes: 60,
    }));
  }
  return {
    ...raw,
    bookStep: raw.bookStep ?? 1,
    noRushVip: raw.noRushVip ?? false,
    tripStops,
    selectedVehicle: raw.selectedVehicle ?? null,
  };
}

function stopSummary(stops: TripStopInput[]): string {
  return stops.map((s) => `${s.label} (${s.durationMinutes} min)`).join("; ");
}

function loadInitialBookingState(): {
  snapshot: BookingFlowSnapshotV1 | null;
  routePickup: string;
  routeDestination: string;
} {
  const raw = loadBookingFlowSnapshot();
  if (!raw?.quotes?.sedan) {
    return { snapshot: null, routePickup: "", routeDestination: "" };
  }
  const snapshot = normalizeSnapshot(raw);
  return {
    snapshot,
    routePickup: snapshot.pickup,
    routeDestination: snapshot.destination,
  };
}

export function BookFlowClient({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Messages;
}) {
  const router = useRouter();
  const isEn = locale === "en";
  const bf = dict.bookFlow;
  const b = dict.booking;
  const { ready, consent } = useCookieConsent();
  const hasMapsKey = Boolean(getGoogleMapsApiKey());
  const showMapsConsentHint = ready && consent === "essential" && hasMapsKey;

  const [initialState] = useState(loadInitialBookingState);
  const [snapshot, setSnapshot] = useState<BookingFlowSnapshotV1 | null>(
    initialState.snapshot
  );
  const [pois, setPois] = useState<PoiCard[]>([]);
  const [waitConfig, setWaitConfig] = useState<WaitRatesConfig | null>(null);
  const [waitBand, setWaitBand] = useState<string>("day");
  const [poisLoading, setPoisLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [recalcError, setRecalcError] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customLat, setCustomLat] = useState<number | undefined>();
  const [customLng, setCustomLng] = useState<number | undefined>();
  const [routePickup, setRoutePickup] = useState(initialState.routePickup);
  const [routeDestination, setRouteDestination] = useState(
    initialState.routeDestination
  );
  const [customDuration, setCustomDuration] = useState(60);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [honeypotWebsite, setHoneypotWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitOk, setSubmitOk] = useState(false);

  const step = snapshot?.bookStep ?? 1;
  const durationOptions = waitConfig?.durationOptionsMinutes ?? [
    15, 30, 45, 60, 90, 120, 180, 240, 360, 480,
  ];

  useEffect(() => {
    if (snapshot === null) {
      router.replace(`/${locale}#prenota`);
    }
  }, [snapshot, locale, router]);

  useEffect(() => {
    void fetch("/api/wait-time-rates")
      .then((r) => r.json())
      .then((data: WaitRatesConfig) => setWaitConfig(data))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!snapshot || step !== 1) {
      return;
    }

    const { pickup, destination } = snapshot;
    let cancelled = false;
    async function loadPois() {
      setPoisLoading(true);
      try {
        const params = new URLSearchParams({ origin: pickup, destination });
        const res = await fetch(`/api/points-of-interest?${params.toString()}`);
        const data = (await res.json()) as { pointsOfInterest?: PoiCard[] };
        if (!cancelled) {
          setPois(data.pointsOfInterest ?? []);
        }
      } catch {
        if (!cancelled) {
          setPois([]);
        }
      } finally {
        if (!cancelled) {
          setPoisLoading(false);
        }
      }
    }

    void loadPois();
    return () => {
      cancelled = true;
    };
  }, [snapshot, step]);

  const persist = useCallback((next: BookingFlowSnapshotV1) => {
    const normalized = normalizeSnapshot(next);
    saveBookingFlowSnapshot(normalized);
    setSnapshot((prev) => {
      if (
        !prev ||
        prev.pickup !== normalized.pickup ||
        prev.destination !== normalized.destination
      ) {
        setRoutePickup(normalized.pickup);
        setRouteDestination(normalized.destination);
      }
      return normalized;
    });
  }, []);

  const recalculateWithStops = useCallback(
    async (tripStops: TripStopInput[], base: BookingFlowSnapshotV1) => {
      setRecalculating(true);
      setRecalcError("");
      try {
        const outboundRes = await fetch("/api/trips/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: base.pickup,
            destination: base.destination,
            pickupTime: base.pickupTime,
            stops: tripStops,
            noRushVip: base.noRushVip,
          }),
        });
        const outbound = (await outboundRes.json()) as CalculateApiResponse & {
          waitTimeBand?: string;
        };
        if (!outbound.success || !outbound.quotes) {
          throw new Error(outbound.error ?? "calculate failed");
        }

        if (outbound.waitTimeBand) {
          setWaitBand(outbound.waitTimeBand);
        }

        let quotes = outbound.quotes;
        let distanceKm = outbound.distanceKm ?? base.distanceKm;
        let durationMinutesEstimate =
          outbound.durationMinutesEstimate ?? base.durationMinutesEstimate;
        const provider = outbound.provider ?? base.provider;

        if (base.addReturn) {
          const returnRes = await fetch("/api/trips/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              origin: base.destination,
              destination: base.pickup,
              pickupTime: base.returnTime || base.pickupTime,
              stops: [],
              noRushVip: base.noRushVip,
            }),
          });
          const returnLeg = (await returnRes.json()) as CalculateApiResponse;
          if (!returnLeg.success || !returnLeg.quotes) {
            throw new Error(returnLeg.error ?? "return calculate failed");
          }
          quotes = mergeRoundTripQuotes(quotes, returnLeg.quotes);
          distanceKm += returnLeg.distanceKm ?? 0;
          durationMinutesEstimate += returnLeg.durationMinutesEstimate ?? 0;
        }

        persist({
          ...base,
          tripStops,
          selectedVehicle: null,
          quotes,
          distanceKm,
          durationMinutesEstimate,
          provider,
          currency: outbound.currency ?? base.currency,
          pricingRule: outbound.pricingRule ?? base.pricingRule,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        setRecalcError(
          err instanceof Error && err.message
            ? err.message
            : isEn
              ? "Could not update the price. Try again."
              : "Impossibile aggiornare il prezzo. Riprova."
        );
      } finally {
        setRecalculating(false);
      }
    },
    [isEn, persist]
  );

  const selectedQuote = useMemo(() => {
    if (!snapshot?.selectedVehicle) {
      return null;
    }
    return snapshot.quotes[snapshot.selectedVehicle];
  }, [snapshot]);

  const bandLabel = useMemo(() => {
    const band = waitConfig?.bands?.[waitBand];
    if (!band) {
      return waitBand;
    }
    return isEn ? band.labelEn : band.labelIt;
  }, [isEn, waitBand, waitConfig?.bands]);

  if (!snapshot) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        {isEn ? "Loading quote…" : "Caricamento preventivo…"}
      </div>
    );
  }

  const tripStops = snapshot.tripStops;

  function goToStep(nextStep: 1 | 2 | 3) {
    if (!snapshot) return;
    persist({ ...snapshot, bookStep: nextStep, updatedAt: new Date().toISOString() });
  }

  function selectVehicle(vt: TripVehicleType) {
    if (!snapshot) return;
    persist({
      ...snapshot,
      selectedVehicle: vt,
      updatedAt: new Date().toISOString(),
    });
  }

  function isCatalogSelected(poiId: string): boolean {
    return tripStops.some((s) => s.kind === "catalog" && s.id === poiId);
  }

  function getCatalogDuration(poiId: string, fallback: number): number {
    const stop = tripStops.find((s) => s.kind === "catalog" && s.id === poiId);
    return stop?.durationMinutes ?? fallback;
  }

  async function toggleCatalogPoi(poi: PoiCard) {
    if (!snapshot) return;
    const selected = isCatalogSelected(poi.id);
    let next: TripStopInput[];
    if (selected) {
      next = tripStops.filter((s) => !(s.kind === "catalog" && s.id === poi.id));
    } else {
      if (tripStops.length >= MAX_TRIP_STOPS) {
        setRecalcError(bf.maxStopsError);
        return;
      }
      next = [
        ...tripStops,
        {
          kind: "catalog",
          id: poi.id,
          label: poi.name,
          durationMinutes: poi.suggested_duration_minutes || 60,
        },
      ];
    }
    await recalculateWithStops(next, snapshot);
  }

  async function updateCatalogDuration(poi: PoiCard, durationMinutes: number) {
    if (!snapshot) return;
    const next = tripStops.map((s) =>
      s.kind === "catalog" && s.id === poi.id ? { ...s, durationMinutes } : s
    );
    await recalculateWithStops(next, snapshot);
  }

  async function removeStop(stopId: string) {
    if (!snapshot) return;
    const next = tripStops.filter((s) => s.id !== stopId);
    await recalculateWithStops(next, snapshot);
  }

  async function addCustomStop() {
    if (!snapshot) return;
    const address = customAddress.trim();
    if (!address) {
      setRecalcError(
        isEn ? "Enter an address for the custom stop." : "Inserite un indirizzo per la fermata."
      );
      return;
    }
    if (tripStops.length >= MAX_TRIP_STOPS) {
      setRecalcError(bf.maxStopsError);
      return;
    }
    const next: TripStopInput[] = [
      ...tripStops,
      {
        kind: "custom",
        id: crypto.randomUUID(),
        label: customLabel.trim() || (isEn ? "Custom stop" : "Fermata personalizzata"),
        address,
        lat: customLat,
        lng: customLng,
        durationMinutes: customDuration,
      },
    ];
    setCustomLabel("");
    setCustomAddress("");
    setCustomLat(undefined);
    setCustomLng(undefined);
    setCustomDuration(60);
    await recalculateWithStops(next, snapshot);
  }

  async function applyRouteUpdate() {
    if (!snapshot) return;
    const pickup = routePickup.trim();
    const destination = routeDestination.trim();
    if (!pickup || !destination) {
      setRecalcError(
        isEn
          ? "Enter both pickup and destination."
          : "Inserite partenza e destinazione."
      );
      return;
    }
    if (pickup === snapshot.pickup && destination === snapshot.destination) {
      return;
    }
    await recalculateWithStops(tripStops, {
      ...snapshot,
      pickup,
      destination,
    });
  }

  async function confirmBooking() {
    if (!snapshot) return;
    if (!snapshot.selectedVehicle || !selectedQuote) {
      setSubmitError(isEn ? "Select a vehicle class." : "Seleziona una classe veicolo.");
      return;
    }
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setSubmitError(isEn ? "Fill in all contact fields." : "Compila tutti i campi contatto.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocation: snapshot.pickup,
          dropoffLocation: snapshot.destination,
          rideDate: snapshot.travelDate,
          rideTime: snapshot.pickupTime,
          passengers: String(snapshot.passengers),
          vehicleType: snapshot.selectedVehicle,
          locale,
          inquiryType: "standard",
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          quotedPrice: selectedQuote.totalPrice,
          quoteCurrency: snapshot.currency,
          distanceKm: snapshot.distanceKm,
          durationMinutes: snapshot.durationMinutesEstimate,
          quoteId: selectedQuote.quoteId,
          addReturn: snapshot.addReturn,
          returnDate: snapshot.addReturn ? snapshot.returnDate : undefined,
          returnTime: snapshot.addReturn ? snapshot.returnTime : undefined,
          bookingMode: snapshot.bookingMode,
          noRushVip: snapshot.noRushVip,
          tripStops: snapshot.tripStops,
          stopsSummary: stopSummary(snapshot.tripStops),
          _hpWebsite: honeypotWebsite,
        }),
      });

      if (!res.ok) {
        throw new Error("booking failed");
      }

      clearBookingFlowSnapshot();
      setSubmitOk(true);
    } catch {
      setSubmitError(
        isEn
          ? "Could not send the request. Try again or call us."
          : "Invio non riuscito. Riprova o contattaci telefonicamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitOk) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle>{isEn ? "Request sent" : "Richiesta inviata"}</CardTitle>
            <CardDescription>
              {isEn
                ? "We received your trip details and quoted price. We will confirm availability shortly."
                : "Abbiamo ricevuto itinerario e prezzo indicativo. Ti confermiamo disponibilità a breve."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/${locale}`}>{isEn ? "Back to home" : "Torna alla home"}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps: { n: 1 | 2 | 3; label: string }[] = [
    { n: 1, label: bf.stepStops },
    { n: 2, label: bf.stepVehicle },
    { n: 3, label: bf.stepContact },
  ];

  const customStops = tripStops.filter((s) => s.kind === "custom");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-8 flex gap-2">
        {steps.map(({ n, label }) => (
          <div
            key={n}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-medium sm:text-sm ${
              step === n
                ? "border-primary bg-primary/10 text-foreground"
                : step > n
                  ? "border-primary/40 text-muted-foreground"
                  : "border-border text-muted-foreground"
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                step >= n ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {step > n ? <Check className="size-3.5" /> : n}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
        <div className="min-w-0 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              {isEn ? "Instant quote" : "Preventivo immediato"}
            </p>
            <h1 className="font-serif text-2xl font-semibold md:text-3xl">
              {step === 1
                ? bf.stopsTitle
                : step === 2
                  ? bf.vehicleTitle
                  : isEn
                    ? "Contact details"
                    : "Dati di contatto"}
            </h1>
            {step === 1 ? (
              <p className="text-sm text-muted-foreground">{bf.stopsLead}</p>
            ) : null}
            {step === 1 && bandLabel ? (
              <p className="text-xs text-primary/80">
                {bf.waitBandNote.replace("{band}", bandLabel)}
              </p>
            ) : null}
          </div>

          {step === 1 ? (
            <>
          <Card className="border-dashed border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {isEn ? "Optional sightseeing stops" : "Fermate turistiche opzionali"}
              </CardTitle>
              <CardDescription>
                {isEn
                  ? "Stretch your legs. See something beautiful. Still arrive relaxed — just like Daytrip."
                  : "Fate una pausa, visitate un luogo suggestivo e arrivate comunque in totale relax — come su Daytrip."}
              </CardDescription>
            </CardHeader>
          </Card>

          <details className="rounded-xl border border-border bg-card">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
              {bf.routeEditTitle}
            </summary>
            <div className="grid gap-3 border-t border-border px-4 pb-4 pt-3">
              {showMapsConsentHint ? (
                <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                  {b.mapsBlockedHint}
                </p>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor="book-route-pickup">{b.labelFrom}</Label>
                <AddressAutocomplete
                  id="book-route-pickup"
                  value={routePickup}
                  onChange={setRoutePickup}
                  placeholder={b.placeholderFrom}
                  disabled={recalculating}
                  locale={locale}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-route-destination">{b.labelTo}</Label>
                <AddressAutocomplete
                  id="book-route-destination"
                  value={routeDestination}
                  onChange={setRouteDestination}
                  placeholder={b.placeholderTo}
                  disabled={recalculating}
                  locale={locale}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={
                  recalculating ||
                  !routePickup.trim() ||
                  !routeDestination.trim() ||
                  (routePickup.trim() === snapshot.pickup &&
                    routeDestination.trim() === snapshot.destination)
                }
                onClick={() => void applyRouteUpdate()}
              >
                {bf.updateRoute}
              </Button>
            </div>
          </details>

          {poisLoading ? (
            <p className="text-sm text-muted-foreground">
              {isEn ? "Loading suggested stops…" : "Caricamento fermate suggerite…"}
            </p>
          ) : pois.length === 0 ? (
            <p className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              {bf.noPois}
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isEn ? "Suggested stops" : "Fermate suggerite"}
              </p>
              {pois.map((poi) => {
                const selected = isCatalogSelected(poi.id);
                const duration = getCatalogDuration(
                  poi.id,
                  poi.suggested_duration_minutes || 60
                );
                return (
                  <div
                    key={poi.id}
                    className={`rounded-xl border-2 transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={recalculating}
                      onClick={() => void toggleCatalogPoi(poi)}
                      className="flex w-full items-start gap-3 px-4 py-4 text-left"
                    >
                      <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold">{poi.name}</p>
                          <p className="text-xs text-muted-foreground">
                            +€{poi.base_stop_price} · ~
                            {formatDuration(poi.suggested_duration_minutes, locale)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{poi.description}</p>
                      </div>
                      {selected ? (
                        <Check className="size-5 shrink-0 text-primary" aria-hidden />
                      ) : null}
                    </button>
                    {selected ? (
                      <div className="border-t border-border/60 px-4 pb-4">
                        <label className="text-xs text-muted-foreground">
                          {bf.customStopDuration}
                        </label>
                        <select
                          className="mt-1 h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                          value={duration}
                          disabled={recalculating}
                          onChange={(e) =>
                            void updateCatalogDuration(poi, Number(e.target.value))
                          }
                        >
                          {durationOptions.map((min) => (
                            <option key={min} value={min}>
                              {formatStopDurationOption(min, locale)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{bf.customStopTitle}</CardTitle>
              <CardDescription>{bf.customStopLead}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <input
                className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
                placeholder={bf.customStopLabelPlaceholder}
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                aria-label={bf.customStopLabel}
              />
              <AddressAutocomplete
                value={customAddress}
                onChange={(value) => {
                  setCustomAddress(value);
                  setCustomLat(undefined);
                  setCustomLng(undefined);
                }}
                onPlaceSelect={(place) => {
                  setCustomLat(place.lat);
                  setCustomLng(place.lng);
                }}
                placeholder={bf.customStopAddressPlaceholder}
                aria-label={bf.customStopAddress}
                disabled={recalculating}
                locale={locale}
                required
              />
              <div>
                <label className="text-xs text-muted-foreground">{bf.customStopDuration}</label>
                <select
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                >
                  {durationOptions.map((min) => (
                    <option key={min} value={min}>
                      {formatStopDurationOption(min, locale)}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={recalculating || !customAddress.trim()}
                onClick={() => void addCustomStop()}
              >
                <Plus className="size-4" aria-hidden />
                {bf.addCustomStop}
              </Button>
            </CardContent>
          </Card>

          {customStops.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isEn ? "Your custom stops" : "Fermate personalizzate aggiunte"}
              </p>
              {customStops.map((stop) => (
                <div
                  key={stop.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{stop.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{stop.address}</p>
                    <p className="text-xs text-primary/80">
                      {formatDuration(stop.durationMinutes, locale)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={recalculating}
                    onClick={() => void removeStop(stop.id)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    {bf.removeStop}
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          {recalcError ? (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {recalcError}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              disabled={recalculating}
              onClick={() => goToStep(2)}
            >
              {tripStops.length === 0 ? bf.skipStops : bf.continue}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}#prenota`}>
                {isEn ? "Edit search" : "Modifica ricerca"}
              </Link>
            </Button>
          </div>
            </>
          ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          {tripStops.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {isEn ? "Stops:" : "Fermate:"} {stopSummary(tripStops)}
            </p>
          ) : null}
          <div className="space-y-3">
            {VEHICLES.map(({ key, icon: Icon, labelIt, labelEn }) => {
              const row = snapshot.quotes[key];
              const selected = snapshot.selectedVehicle === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectVehicle(key)}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border-2 px-4 py-4 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-5 text-primary" aria-hidden />
                    <div>
                      <p className="font-semibold">{isEn ? labelEn : labelIt}</p>
                      <p className="text-xs text-muted-foreground">
                        {isEn ? "All-inclusive estimate" : "Stima tutto incluso"}
                        {row.breakdown.costoAttesa != null && row.breakdown.costoAttesa > 0
                          ? isEn
                            ? ` · incl. waiting €${row.breakdown.costoAttesa}`
                            : ` · incl. attesa €${row.breakdown.costoAttesa}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold">€{row.totalPrice}</p>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => goToStep(1)}>
              {bf.back}
            </Button>
            <Button
              size="lg"
              className="flex-1"
              disabled={!snapshot.selectedVehicle}
              onClick={() => goToStep(3)}
            >
              {bf.continue}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isEn ? "Contact details" : "Dati di contatto"}
            </CardTitle>
            <CardDescription>
              {selectedQuote
                ? isEn
                  ? `Estimated total: €${selectedQuote.totalPrice}`
                  : `Totale stimato: €${selectedQuote.totalPrice}`
                : isEn
                  ? "We will confirm the final price and assign your chauffeur."
                  : "Confermeremo il prezzo finale e l'autista assegnato."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="book-hp-website">Website</label>
              <input
                id="book-hp-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypotWebsite}
                onChange={(e) => setHoneypotWebsite(e.target.value)}
              />
            </div>
            <input
              className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
              placeholder={isEn ? "Full name" : "Nome e cognome"}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoComplete="name"
            />
            <input
              type="email"
              className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
              placeholder="Email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              type="tel"
              className="h-11 rounded-lg border border-input bg-transparent px-3 text-sm"
              placeholder={isEn ? "Phone" : "Telefono"}
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              autoComplete="tel"
            />
            {submitError ? (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                {submitError}
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => goToStep(2)}>
                {bf.back}
              </Button>
              <Button
                size="lg"
                className="flex-1"
                disabled={submitting || !snapshot.selectedVehicle}
                onClick={() => void confirmBooking()}
              >
                {submitting
                  ? isEn
                    ? "Sending…"
                    : "Invio…"
                  : selectedQuote
                    ? isEn
                      ? `Confirm request — €${selectedQuote.totalPrice}`
                      : `Conferma richiesta — €${selectedQuote.totalPrice}`
                    : isEn
                      ? "Select a vehicle"
                      : "Seleziona veicolo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
        </div>

        <BookingSummaryPanel
          snapshot={snapshot}
          tripStops={tripStops}
          locale={locale}
          step={step}
          recalculating={recalculating}
          mapHint={bf.mapHint}
          consentHint={bf.mapConsentHint}
          trustCancelFree={b.trustCancelFree}
        />
      </div>
    </div>
  );
}
