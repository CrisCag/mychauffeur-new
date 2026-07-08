import { applyNoRushMarkup, loadComfortModeConfig } from "@/lib/platform/comfort-mode";
import { mapVehicleTypeFromWidget } from "@/lib/booking-flow-storage";
import { tryGetSupabaseAdminClient } from "@/lib/platform/supabase-admin";
import { computeTripQuotesAllVehicles } from "@/lib/platform/trip-pricing";
import type { BookingRequestInput } from "@/lib/booking-requests";
import type { TripStopInput, TripVehicleType } from "@/types/trip";

const PRICE_TOLERANCE_EUR = 2;
const PRICE_TOLERANCE_RATIO = 0.02;

export function bookingVehicleToQuoteVehicle(
  vehicleType: BookingRequestInput["vehicleType"]
): TripVehicleType {
  if (vehicleType === "luxury") {
    return "luxury";
  }
  return mapVehicleTypeFromWidget(vehicleType);
}

function pricesRoughlyMatch(expected: number, quoted: number): boolean {
  const delta = Math.abs(expected - quoted);
  const allowed = Math.max(PRICE_TOLERANCE_EUR, expected * PRICE_TOLERANCE_RATIO);
  return delta <= allowed;
}

function normalizeTripStops(
  tripStops: BookingRequestInput["tripStops"]
): TripStopInput[] {
  if (!Array.isArray(tripStops)) {
    return [];
  }
  const normalized: TripStopInput[] = [];
  for (const raw of tripStops) {
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const kind = raw.kind === "custom" ? "custom" : "catalog";
    const id = typeof raw.id === "string" ? raw.id.trim() : "";
    if (!id) {
      continue;
    }
    normalized.push({
      kind,
      id,
      label: typeof raw.label === "string" ? raw.label.trim() || id : id,
      address: typeof raw.address === "string" ? raw.address.trim() : undefined,
      durationMinutes: Math.max(
        15,
        Math.min(480, Number(raw.durationMinutes) || 60)
      ),
    });
  }
  return normalized;
}

async function quoteLegTotalEur(params: {
  origin: string;
  destination: string;
  pickupTime: string;
  stops: TripStopInput[];
  vehicleType: TripVehicleType;
  noRushVip: boolean;
}): Promise<{ ok: true; total: number } | { ok: false; error: string }> {
  const supabase = tryGetSupabaseAdminClient();
  const result = await computeTripQuotesAllVehicles(supabase, {
    origin: params.origin,
    destination: params.destination,
    pickupTime: params.pickupTime,
    stops: params.stops,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  let total = result.data.byVehicle[params.vehicleType].totalPrice;
  if (params.noRushVip) {
    const comfort = await loadComfortModeConfig();
    total = applyNoRushMarkup(total, comfort.noRushVip.markupPercent);
  }

  return { ok: true, total };
}

async function verifyStoredQuotePrice(
  quoteId: string,
  vehicleType: TripVehicleType,
  quotedPrice: number
): Promise<boolean | null> {
  const supabase = tryGetSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("quotes")
    .select("total_price,expires_at,vehicle_type")
    .eq("id", quoteId)
    .maybeSingle<{
      total_price: number;
      expires_at: string;
      vehicle_type: TripVehicleType;
    }>();

  if (error || !data) {
    return false;
  }

  if (data.vehicle_type !== vehicleType) {
    return false;
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return false;
  }

  return pricesRoughlyMatch(Number(data.total_price), quotedPrice);
}

/**
 * Rejects manipulated client prices when quotedPrice is supplied.
 * B2B inquiries without quotedPrice skip validation.
 */
export async function validateQuotedPrice(
  payload: BookingRequestInput
): Promise<string | null> {
  if (payload.quotedPrice == null || !Number.isFinite(payload.quotedPrice)) {
    return null;
  }

  const vehicleType = bookingVehicleToQuoteVehicle(payload.vehicleType);
  const quotedPrice = payload.quotedPrice;

  if (
    payload.quoteId &&
    !payload.addReturn &&
    payload.bookingMode !== "round_trip"
  ) {
    const fromDb = await verifyStoredQuotePrice(
      payload.quoteId,
      vehicleType,
      quotedPrice
    );
    if (fromDb === true) {
      return null;
    }
    if (fromDb === false) {
      return "quotedPrice does not match stored quote";
    }
  }

  const stops = normalizeTripStops(payload.tripStops);
  const outbound = await quoteLegTotalEur({
    origin: payload.pickupLocation,
    destination: payload.dropoffLocation,
    pickupTime: payload.rideTime,
    stops,
    vehicleType,
    noRushVip: payload.noRushVip === true,
  });

  if (!outbound.ok) {
    return "unable to verify quoted price";
  }

  let expected = outbound.total;

  if (payload.addReturn || payload.bookingMode === "round_trip") {
    if (!payload.returnTime?.trim()) {
      // TODO(fase-1): round-trip price validation requires returnTime; see booking-quote-validation.
      return "returnTime is required to verify round-trip quoted price";
    }

    const returnLeg = await quoteLegTotalEur({
      origin: payload.dropoffLocation,
      destination: payload.pickupLocation,
      pickupTime: payload.returnTime.trim(),
      stops: [],
      vehicleType,
      noRushVip: payload.noRushVip === true,
    });

    if (!returnLeg.ok) {
      return "unable to verify round-trip quoted price";
    }

    expected = Math.round((expected + returnLeg.total) * 100) / 100;
  }

  if (!pricesRoughlyMatch(expected, quotedPrice)) {
    return "quotedPrice does not match server calculation";
  }

  return null;
}
