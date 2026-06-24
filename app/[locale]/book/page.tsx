"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CarFront, Crown, Van } from "lucide-react";
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
  saveBookingFlowSnapshot,
  type BookingFlowSnapshotV1,
} from "@/lib/booking-flow-storage";
import type { TripVehicleType } from "@/types/trip";

const VEHICLES: { key: TripVehicleType; icon: typeof CarFront; labelIt: string; labelEn: string }[] = [
  { key: "sedan", icon: CarFront, labelIt: "Berlina", labelEn: "Sedan" },
  { key: "van", icon: Van, labelIt: "Van", labelEn: "Van" },
  { key: "luxury", icon: Crown, labelIt: "Luxury", labelEn: "Luxury" },
];

function formatDuration(totalMin: number, locale: string): string {
  const m = Math.max(0, Math.round(totalMin));
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h <= 0) {
    return locale === "en" ? `${min} min` : `${min} min`;
  }
  return locale === "en" ? `${h}h ${min}m` : `${h}h ${min}m`;
}

export default function BookPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "it";
  const isEn = locale === "en";

  const [snapshot, setSnapshot] = useState<BookingFlowSnapshotV1 | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => {
    const s = loadBookingFlowSnapshot();
    if (!s?.quotes?.sedan) {
      router.replace(`/${locale}#prenota`);
      return;
    }
    setSnapshot(s);
  }, [locale, router]);

  const selectedQuote = useMemo(() => {
    if (!snapshot?.selectedVehicle) {
      return null;
    }
    return snapshot.quotes[snapshot.selectedVehicle];
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        {isEn ? "Loading quote…" : "Caricamento preventivo…"}
      </div>
    );
  }

  function selectVehicle(vt: TripVehicleType) {
    if (!snapshot) return;
    const next = { ...snapshot, selectedVehicle: vt, updatedAt: new Date().toISOString() };
    saveBookingFlowSnapshot(next);
    setSnapshot(next);
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
      const vehicleMap: Record<TripVehicleType, "sedan" | "van" | "other"> = {
        sedan: "sedan",
        van: "van",
        luxury: "other",
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocation: snapshot.pickup,
          dropoffLocation: snapshot.destination,
          rideDate: snapshot.travelDate,
          rideTime: snapshot.pickupTime,
          passengers: String(snapshot.passengers),
          vehicleType: vehicleMap[snapshot.selectedVehicle],
          vehicleOtherDetails:
            snapshot.selectedVehicle === "luxury"
              ? `Luxury — preventivo €${selectedQuote.totalPrice}`
              : undefined,
          locale,
          inquiryType: "standard",
          quotedPrice: selectedQuote.totalPrice,
          quoteCurrency: snapshot.currency,
          distanceKm: snapshot.distanceKm,
          durationMinutes: snapshot.durationMinutesEstimate,
          quoteId: selectedQuote.quoteId,
          addReturn: snapshot.addReturn,
          returnDate: snapshot.addReturn ? snapshot.returnDate : undefined,
          returnTime: snapshot.addReturn ? snapshot.returnTime : undefined,
          bookingMode: snapshot.bookingMode,
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {isEn ? "Instant quote" : "Preventivo immediato"}
        </p>
        <h1 className="font-serif text-2xl font-semibold md:text-3xl">
          {isEn ? "Choose your vehicle" : "Scegli il veicolo"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {snapshot.pickup} → {snapshot.destination}
          {snapshot.addReturn ? (
            <>
              {" "}
              · {isEn ? "return" : "ritorno"} {snapshot.returnDate}
              {snapshot.returnTime ? ` ${snapshot.returnTime}` : ""}
            </>
          ) : null}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.travelDate} · {snapshot.pickupTime} · {snapshot.passengers}{" "}
          {isEn ? "passengers" : "passeggeri"} · ~
          {formatDuration(snapshot.durationMinutesEstimate, locale)} ·{" "}
          {snapshot.distanceKm.toFixed(0)} km
          {snapshot.provider === "simulated"
            ? isEn
              ? " (estimated route)"
              : " (percorso stimato)"
            : ""}
        </p>
      </div>

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
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold">€{row.totalPrice}</p>
            </button>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">
            {isEn ? "Contact details" : "Dati di contatto"}
          </CardTitle>
          <CardDescription>
            {isEn
              ? "We will confirm the final price and assign your chauffeur."
              : "Confermeremo il prezzo finale e l'autista assegnato."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
          <Button
            size="lg"
            className="w-full"
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
          <Button variant="outline" asChild>
            <Link href={`/${locale}#prenota`}>
              {isEn ? "Edit search" : "Modifica ricerca"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
