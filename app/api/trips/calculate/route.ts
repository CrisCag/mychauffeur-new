import { insertQuotesBatch } from "@/lib/platform/quotes";
import { QUOTE_ERROR_OUT_OF_AREA } from "@/lib/platform/quote-errors";
import { tryGetSupabaseAdminClient } from "@/lib/platform/supabase-admin";
import { computeTripQuotesAllVehicles } from "@/lib/platform/trip-pricing";
import type { TripVehicleType } from "@/types/trip";
import { NextResponse } from "next/server";

type CalculatePayload = {
  origin: string;
  destination: string;
  stops?: string[];
};

const VEHICLE_ORDER: TripVehicleType[] = ["sedan", "van", "luxury"];

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message, success: false }, { status });
}

export async function POST(request: Request) {
  try {
    let body: CalculatePayload;
    try {
      body = (await request.json()) as CalculatePayload;
    } catch {
      return jsonError("Corpo della richiesta non valido.", 400);
    }

    const origin = body.origin?.trim() ?? "";
    const destination = body.destination?.trim() ?? "";
    const stopIds = Array.isArray(body.stops)
      ? body.stops.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [];

    if (!origin || !destination) {
      return jsonError("Partenza e destinazione sono obbligatorie.", 400);
    }

    const supabase = tryGetSupabaseAdminClient();
    const result = await computeTripQuotesAllVehicles(supabase, {
      origin,
      destination,
      stopIds,
    });

    if (!result.ok) {
      if (result.error === QUOTE_ERROR_OUT_OF_AREA) {
        return jsonError(QUOTE_ERROR_OUT_OF_AREA, 400);
      }
      return jsonError(result.error, 422);
    }

    const { data } = result;
    const durationSec = Math.round(data.durationMinutesEstimate * 60);

    let idsByVehicle: Record<TripVehicleType, string> | null = null;
    let persisted = false;

    if (supabase) {
      const batchPayload = VEHICLE_ORDER.map((vehicleType) => ({
        origin,
        destination,
        distance_km: data.distanceKm,
        duration_sec: durationSec,
        selected_pois: stopIds,
        total_price: data.byVehicle[vehicleType].totalPrice,
        vehicle_type: vehicleType,
        currency: data.currency,
      }));

      const inserted = await insertQuotesBatch(batchPayload);
      if (inserted.ok) {
        idsByVehicle = inserted.idsByVehicle;
        persisted = true;
      }
    }

    const quotes = Object.fromEntries(
      VEHICLE_ORDER.map((vt) => {
        const slice = data.byVehicle[vt];
        return [
          vt,
          {
            quoteId: idsByVehicle?.[vt] ?? null,
            totalPrice: slice.totalPrice,
            breakdown: slice.breakdown,
            vehicleMultiplier: slice.vehicleMultiplier,
            vehicleType: slice.vehicleType,
          },
        ] as const;
      })
    );

    return NextResponse.json(
      {
        success: true,
        currency: data.currency,
        provider: data.provider,
        distanceKm: data.distanceKm,
        durationMinutesEstimate: data.durationMinutesEstimate,
        pricingRule: data.pricingRule,
        quotes,
        persisted,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore imprevisto durante il calcolo.";
    return jsonError(message, 500);
  }
}
