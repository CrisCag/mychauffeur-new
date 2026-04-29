"use client";

import { useEffect } from "react";
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
import { cn } from "@/lib/utils";

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

export function BookingWidget({ className }: { className?: string }) {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

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
  }, []);

  const showMapsHint =
    process.env.NODE_ENV === "development" &&
    !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <Card
      className={cn(
        "border-border/90 bg-card/95 shadow-2xl shadow-black/40 backdrop-blur-md",
        className
      )}
    >
      <CardHeader>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Prenota ora
        </p>
        <CardTitle className="text-xl md:text-2xl">
          Partenza, destinazione, orario
        </CardTitle>
        <CardDescription>
          Inserisci i dettagli del viaggio per verificare disponibilità.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pickup-location">Partenza</Label>
          <Input
            id="pickup-location"
            placeholder="Indirizzo o aeroporto"
            className="h-10 md:h-11"
            autoComplete="street-address"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dropoff-location">Destinazione</Label>
          <Input
            id="dropoff-location"
            placeholder="Indirizzo o aeroporto"
            className="h-10 md:h-11"
            autoComplete="street-address"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="ride-date">Data</Label>
            <Input
              id="ride-date"
              type="date"
              className="h-10 md:h-11 min-w-0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ride-time">Ora</Label>
            <Input
              id="ride-time"
              type="time"
              className="h-10 md:h-11 min-w-0"
            />
          </div>
        </div>
        <Button className="mt-1 w-full" size="lg">
          Verifica disponibilità
        </Button>
      </CardContent>
      {showMapsHint ? (
        <CardFooter className="border-t border-border text-xs text-muted-foreground">
          In sviluppo: imposta{" "}
          <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          per l&apos;autocomplete indirizzi.
        </CardFooter>
      ) : null}
    </Card>
  );
}
