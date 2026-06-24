"use client";

import { type FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CarFront, Sparkles, Van } from "lucide-react";
import { useCookieConsent } from "@/components/gdpr/cookie-consent-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canLoadThirdPartyMaps } from "@/lib/cookie-consent";
import { cn } from "@/lib/utils";
import type { Messages } from "@/messages/types";

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (input: HTMLInputElement) => unknown;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = "google-maps-places-script";

export function BookingWidget({
  className,
  dict,
}: {
  className?: string;
  dict: Messages;
}) {
  const b = dict.booking;
  const pathname = usePathname();
  const { ready, consent } = useCookieConsent();
  const mapsAllowed = ready && canLoadThirdPartyMaps(consent);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [rideTime, setRideTime] = useState("");
  const [passengers, setPassengers] = useState("");
  const [vehicleType, setVehicleType] = useState<"sedan" | "van" | "other">(
    "sedan"
  );
  const [vehicleOtherDetails, setVehicleOtherDetails] = useState("");
  const [isB2B, setIsB2B] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const vehicleOptions = [
    {
      key: "sedan" as const,
      label: b.optionVehicleSedan,
      icon: CarFront,
    },
    {
      key: "van" as const,
      label: b.optionVehicleVan,
      icon: Van,
    },
    {
      key: "other" as const,
      label: b.optionVehicleOther,
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapsAllowed) return;

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      document.body.appendChild(script);
    }

    const setupAutocomplete = () => {
      const fromInput = document.getElementById("pickup-location");
      const toInput = document.getElementById("dropoff-location");
      if (
        fromInput instanceof HTMLInputElement &&
        toInput instanceof HTMLInputElement &&
        window.google?.maps?.places?.Autocomplete
      ) {
        new window.google.maps.places.Autocomplete(fromInput);
        new window.google.maps.places.Autocomplete(toInput);
      }
    };

    const timeout = setTimeout(setupAutocomplete, 800);
    return () => clearTimeout(timeout);
  }, [mapsAllowed]);

  const showDevKeyHint =
    process.env.NODE_ENV === "development" &&
    !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const showConsentMapsHint =
    ready &&
    consent === "essential" &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const locale = pathname?.split("/")[1] ?? "it";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitState("idle");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocation,
          dropoffLocation,
          rideDate,
          rideTime,
          passengers,
          vehicleType,
          vehicleOtherDetails:
            vehicleType === "other" ? vehicleOtherDetails.trim() : undefined,
          locale,
          inquiryType: isB2B ? "b2b" : "standard",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed booking request");
      }

      setSubmitState("success");
      setPickupLocation("");
      setDropoffLocation("");
      setRideDate("");
      setRideTime("");
      setPassengers("");
      setVehicleType("sedan");
      setVehicleOtherDetails("");
      setIsB2B(false);
    } catch {
      setSubmitState("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card
      className={cn(
        "border-border/90 bg-card/95 shadow-2xl shadow-black/40 backdrop-blur-md",
        className
      )}
    >
      <CardHeader>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          {b.eyebrow}
        </p>
        <CardTitle className="text-xl md:text-2xl">{b.title}</CardTitle>
        <CardDescription>{b.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
        {showConsentMapsHint ? (
          <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            {b.mapsBlockedHint}
          </p>
        ) : null}
        <div className="grid gap-2">
          <Label htmlFor="pickup-location">{b.labelFrom}</Label>
          <Input
            id="pickup-location"
            placeholder={b.placeholderFrom}
            className="h-10 md:h-11"
            autoComplete="street-address"
            required
            value={pickupLocation}
            onChange={(event) => setPickupLocation(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dropoff-location">{b.labelTo}</Label>
          <Input
            id="dropoff-location"
            placeholder={b.placeholderTo}
            className="h-10 md:h-11"
            autoComplete="street-address"
            required
            value={dropoffLocation}
            onChange={(event) => setDropoffLocation(event.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="ride-date">{b.labelDate}</Label>
            <Input
              id="ride-date"
              type="date"
              className="h-10 md:h-11 min-w-0"
              required
              value={rideDate}
              onChange={(event) => setRideDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ride-time">{b.labelTime}</Label>
            <Input
              id="ride-time"
              type="time"
              className="h-10 md:h-11 min-w-0"
              required
              value={rideTime}
              onChange={(event) => setRideTime(event.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ride-passengers">{b.labelPassengers}</Label>
          <Input
            id="ride-passengers"
            type="number"
            min={1}
            max={7}
            inputMode="numeric"
            placeholder={b.placeholderPassengers}
            className="h-10 md:h-11"
            required
            value={passengers}
            onChange={(event) => setPassengers(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>{b.labelVehicle}</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {vehicleOptions.map((option) => {
              const Icon = option.icon;
              const active = vehicleType === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setVehicleType(option.key)}
                  className={cn(
                    "flex h-11 items-center justify-center gap-2 rounded-lg border text-sm transition-colors",
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-input bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                  aria-pressed={active}
                >
                  <Icon className="size-4" aria-hidden />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        {vehicleType === "other" ? (
          <div className="grid gap-2">
            <Label htmlFor="vehicle-other-details">{b.labelVehicleOtherDetails}</Label>
            <Input
              id="vehicle-other-details"
              placeholder={b.placeholderVehicleOtherDetails}
              className="h-10 md:h-11"
              value={vehicleOtherDetails}
              onChange={(event) => setVehicleOtherDetails(event.target.value)}
              required
            />
          </div>
        ) : null}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={isB2B}
              onChange={(event) => setIsB2B(event.target.checked)}
            />
            <span>
              <span className="text-foreground">{b.labelB2B}</span> {b.b2bHint}
            </span>
          </label>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {b.policyNote}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {b.paymentNote}
        </p>
        {submitState === "success" ? (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {b.success}
          </p>
        ) : null}
        {submitState === "error" ? (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {b.error}
          </p>
        ) : null}
        <Button className="mt-1 w-full" size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? b.sending : b.submit}
        </Button>
        </form>
      </CardContent>
      {showDevKeyHint ? (
        <CardFooter className="border-t border-border text-xs text-muted-foreground">
          {b.devHintBefore}{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          {b.devHintAfter}
        </CardFooter>
      ) : null}
    </Card>
  );
}
