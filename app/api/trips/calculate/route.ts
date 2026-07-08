import { applyNoRushMarkup, loadComfortModeConfig } from "@/lib/platform/comfort-mode";
import { enforceApiRateLimit } from "@/lib/api/enforce-rate-limit";
import { clientFacingMessage } from "@/lib/api/production-errors";
import { insertQuotesBatch } from "@/lib/platform/quotes";
import { QUOTE_ERROR_OUT_OF_AREA } from "@/lib/platform/quote-errors";
import { tryGetSupabaseAdminClient } from "@/lib/platform/supabase-admin";
import { computeTripQuotesAllVehicles } from "@/lib/platform/trip-pricing";
import type { TripStopInput, TripVehicleType } from "@/types/trip";
import { NextResponse } from "next/server";

type StopPayload = {
  kind?: "catalog" | "custom";
  id?: string;
  poiId?: string;
  label?: string;
  address?: string;
  durationMinutes?: number;
  lat?: number;
  lng?: number;
};

type CalculatePayload = {
  origin: string;
  destination: string;
  pickupTime?: string;
  /** Nuovo formato */
  stops?: StopPayload[];
  /** Retrocompatibilità */
  stopIds?: string[];
  noRushVip?: boolean;
};

const VEHICLE_ORDER: TripVehicleType[] = ["sedan", "van", "luxury"];

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      error: clientFacingMessage(message, "Unable to calculate trip quote."),
      success: false,
    },
    { status }
  );
}

function scaleQuoteForNoRush<T extends { totalPrice: number; breakdown: { totalPrice: number; costoBase: number; costoKm: number; costoSoste: number; costoAttesa: number; costoDeviazione: number; extraVeicolo: number } }>(
  slice: T,
  markupPercent: number
): T {
  if (markupPercent <= 0) return slice;
  const newTotal = applyNoRushMarkup(slice.totalPrice, markupPercent);
  const factor = newTotal / slice.totalPrice;
  const b = slice.breakdown;
  const round = (n: number) => Math.round(n * factor * 100) / 100;
  return {
    ...slice,
    totalPrice: newTotal,
    breakdown: {
      costoBase: round(b.costoBase),
      costoKm: round(b.costoKm),
      costoSoste: round(b.costoSoste),
      costoAttesa: round(b.costoAttesa ?? 0),
      costoDeviazione: round(b.costoDeviazione),
      extraVeicolo: round(b.extraVeicolo),
      totalPrice: newTotal,
    },
  };
}

function normalizeStops(body: CalculatePayload): TripStopInput[] {
  if (Array.isArray(body.stops) && body.stops.length > 0) {
    const normalized: TripStopInput[] = [];
    for (const raw of body.stops) {
      const kind = raw.kind === "custom" ? "custom" : "catalog";
      const id = (raw.id ?? raw.poiId ?? "").trim();
      if (!id) {
        continue;
      }
      normalized.push({
        kind,
        id,
        label: (raw.label ?? "").trim() || id,
        address: raw.address?.trim(),
        durationMinutes: Math.max(15, Math.min(480, Number(raw.durationMinutes) || 60)),
        lat: typeof raw.lat === "number" ? raw.lat : undefined,
        lng: typeof raw.lng === "number" ? raw.lng : undefined,
      });
    }
    return normalized;
  }

  if (Array.isArray(body.stopIds)) {
    return body.stopIds
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      .map((id) => ({
        kind: "catalog" as const,
        id,
        label: id,
        durationMinutes: 60,
      }));
  }

  return [];
}

export async function POST(request: Request) {
  const rateLimited = enforceApiRateLimit(request, "calculate", "success");
  if (rateLimited) {
    return rateLimited;
  }

  try {
    let body: CalculatePayload;
    try {
      body = (await request.json()) as CalculatePayload;
    } catch {
      return jsonError("Corpo della richiesta non valido.", 400);
    }

    const origin = body.origin?.trim() ?? "";
    const destination = body.destination?.trim() ?? "";
    const pickupTime = body.pickupTime?.trim() ?? "10:00";
    const stops = normalizeStops(body);

    if (!origin || !destination) {
      return jsonError("Partenza e destinazione sono obbligatorie.", 400);
    }

    const supabase = tryGetSupabaseAdminClient();
    const result = await computeTripQuotesAllVehicles(supabase, {
      origin,
      destination,
      pickupTime,
      stops,
    });

    if (!result.ok) {
      if (result.error === QUOTE_ERROR_OUT_OF_AREA) {
        return jsonError(QUOTE_ERROR_OUT_OF_AREA, 400);
      }
      return jsonError(result.error, 422);
    }

    const { data } = result;
    const noRushVip = body.noRushVip === true;
    const comfortConfig = await loadComfortModeConfig();
    const markupPercent = noRushVip ? comfortConfig.noRushVip.markupPercent : 0;

    let byVehicle = data.byVehicle;
    if (markupPercent > 0) {
      byVehicle = Object.fromEntries(
        VEHICLE_ORDER.map((vt) => [
          vt,
          scaleQuoteForNoRush(byVehicle[vt], markupPercent),
        ])
      ) as typeof byVehicle;
    }

    const durationSec = Math.round(data.durationMinutesEstimate * 60);
    const stopIds = stops.filter((s) => s.kind === "catalog").map((s) => s.id);

    let idsByVehicle: Record<TripVehicleType, string> | null = null;
    let persisted = false;

    if (supabase) {
      const batchPayload = VEHICLE_ORDER.map((vehicleType) => ({
        origin,
        destination,
        distance_km: data.distanceKm,
        duration_sec: durationSec,
        selected_pois: stopIds,
        total_price: byVehicle[vehicleType].totalPrice,
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
        const slice = byVehicle[vt];
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
        waitTimeBand: data.waitTimeBand,
        stopsSnapshot: data.stopsSnapshot,
        totalStopDurationMinutes: data.totalStopDurationMinutes,
        noRushVip,
        noRushMarkupPercent: markupPercent > 0 ? markupPercent : undefined,
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
