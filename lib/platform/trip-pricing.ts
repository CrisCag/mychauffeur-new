import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchPoiStopsByIds } from "@/lib/platform/poi-query";
import {
  isGeoFenceEnabled,
  isWithinItaly,
  resolveLatLngForPricing,
} from "@/lib/platform/pricing-engine";
import { QUOTE_ERROR_OUT_OF_AREA } from "@/lib/platform/quote-errors";
import { VEHICLE_MULTIPLIERS } from "@/lib/platform/vehicle-pricing-multipliers";
import type { TripVehicleType } from "@/types/trip";

export type TripStopSnapshot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  base_stop_price: number;
  deviation_time_minutes: number;
  suggested_duration_minutes: number;
};

type PricingRuleRow = {
  id: string;
  name: string;
  currency: string;
  base_fare: number;
  price_per_km: number;
  stop_fee: number;
  wait_fee_per_minute: number;
  active: boolean;
};

export const FALLBACK_PRICING_RULE: PricingRuleRow = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Standard Italia (fallback)",
  currency: "EUR",
  base_fare: 35,
  price_per_km: 1.8,
  stop_fee: 40,
  wait_fee_per_minute: 0.6,
  active: true,
};

type PointOfInterestRow = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  base_stop_price: number;
  deviation_time_minutes?: number;
  suggested_duration_minutes?: number;
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

type MatrixLeg = { distanceKm: number; durationSeconds: number };

async function getMatrixLeg(
  origin: string,
  destination: string,
  googleApiKey: string
): Promise<MatrixLeg | null> {
  const query = new URLSearchParams({
    origins: origin,
    destinations: destination,
    key: googleApiKey,
    departure_time: "now",
    traffic_model: "best_guess",
  });

  let response: Response;
  try {
    response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${query.toString()}`,
      { method: "GET", cache: "no-store" }
    );
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  let payload: {
    rows?: Array<{
      elements?: Array<{
        status?: string;
        distance?: { value?: number };
        duration?: { value?: number };
        duration_in_traffic?: { value?: number };
      }>;
    }>;
  };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    return null;
  }

  const el = payload.rows?.[0]?.elements?.[0];
  const status = el?.status;
  const meters = el?.distance?.value;
  const durationSeconds =
    typeof el?.duration_in_traffic?.value === "number"
      ? el.duration_in_traffic.value
      : el?.duration?.value;

  if (typeof meters !== "number" || typeof durationSeconds !== "number" || status !== "OK") {
    return null;
  }

  return { distanceKm: meters / 1000, durationSeconds };
}

function simulatedDriveMinutesFromKm(distanceKm: number): number {
  const avgSpeedKmh = Number(process.env.PRICING_SIMULATED_AVG_SPEED_KMH ?? 70);
  const speed = Number.isFinite(avgSpeedKmh) && avgSpeedKmh > 5 ? avgSpeedKmh : 70;
  return Math.max(1, Math.round((distanceKm / speed) * 60));
}

async function getRouteMetrics(
  routePoints: string[],
  fallbackDistanceKm: number
): Promise<{
  distanceKm: number;
  driveDurationMinutes: number;
  provider: "google" | "simulated";
}> {
  const googleApiKey =
    process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!googleApiKey) {
    const distanceKm = fallbackDistanceKm;
    return {
      distanceKm,
      driveDurationMinutes: simulatedDriveMinutesFromKm(distanceKm),
      provider: "simulated",
    };
  }

  try {
    let totalKm = 0;
    let totalSeconds = 0;
    for (let index = 0; index < routePoints.length - 1; index += 1) {
      const leg = await getMatrixLeg(routePoints[index], routePoints[index + 1], googleApiKey);
      if (leg === null) {
        const distanceKm = fallbackDistanceKm;
        return {
          distanceKm,
          driveDurationMinutes: simulatedDriveMinutesFromKm(distanceKm),
          provider: "simulated",
        };
      }
      totalKm += leg.distanceKm;
      totalSeconds += leg.durationSeconds;
    }

    return {
      distanceKm: totalKm,
      driveDurationMinutes: Math.max(1, Math.round(totalSeconds / 60)),
      provider: "google",
    };
  } catch {
    const distanceKm = fallbackDistanceKm;
    return {
      distanceKm,
      driveDurationMinutes: simulatedDriveMinutesFromKm(distanceKm),
      provider: "simulated",
    };
  }
}

export type PerVehicleQuoteSlice = {
  vehicleType: TripVehicleType;
  vehicleMultiplier: number;
  breakdown: {
    costoBase: number;
    costoKm: number;
    costoSoste: number;
    costoDeviazione: number;
    extraVeicolo: number;
    totalPrice: number;
  };
  totalPrice: number;
};

export type ComputeTripQuotesAllSuccess = {
  currency: string;
  provider: "google" | "simulated";
  distanceKm: number;
  durationMinutesEstimate: number;
  pricingRule: { id: string; name: string };
  stopsSnapshot: TripStopSnapshot[];
  totalStopDurationMinutes: number;
  byVehicle: Record<TripVehicleType, PerVehicleQuoteSlice>;
};

export type ComputeTripQuotesAllResult =
  | { ok: true; data: ComputeTripQuotesAllSuccess }
  | { ok: false; error: string };

export type ComputeTripQuotesAllInput = {
  origin: string;
  destination: string;
  stopIds: string[];
};

const ALL_VEHICLE_TYPES: TripVehicleType[] = ["sedan", "van", "luxury"];

async function loadPricingRule(
  supabase: SupabaseClient | null
): Promise<PricingRuleRow> {
  if (!supabase) {
    return FALLBACK_PRICING_RULE;
  }

  const { data: pricingRuleRow, error: ruleError } = await supabase
    .from("pricing_rules")
    .select("id,name,currency,base_fare,price_per_km,stop_fee,wait_fee_per_minute,active")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<PricingRuleRow>();

  if (ruleError || !pricingRuleRow) {
    return FALLBACK_PRICING_RULE;
  }

  return pricingRuleRow;
}

export async function computeTripQuotesAllVehicles(
  supabase: SupabaseClient | null,
  input: ComputeTripQuotesAllInput
): Promise<ComputeTripQuotesAllResult> {
  const origin = input.origin.trim();
  const destination = input.destination.trim();
  const stopIds = input.stopIds.filter((id) => id.trim().length > 0);

  if (!origin || !destination) {
    return { ok: false, error: "Indicate partenza e arrivo per continuare." };
  }

  if (isGeoFenceEnabled()) {
    const originLL = await resolveLatLngForPricing(origin);
    const destLL = await resolveLatLngForPricing(destination);
    if (
      originLL &&
      destLL &&
      !isWithinItaly(originLL.lat, originLL.lng) &&
      !isWithinItaly(destLL.lat, destLL.lng)
    ) {
      return { ok: false, error: QUOTE_ERROR_OUT_OF_AREA };
    }
  }

  const pricingRule = await loadPricingRule(supabase);

  let selectedStops: PointOfInterestRow[] = [];
  if (stopIds.length > 0) {
    if (!supabase) {
      return {
        ok: false,
        error: "Fermate turistiche disponibili dopo attivazione database.",
      };
    }

    const { data: poiRows, error: poiError } = await fetchPoiStopsByIds(supabase, stopIds);
    if (poiError) {
      return { ok: false, error: `Errore recupero fermate: ${poiError.message}` };
    }

    selectedStops = poiRows as PointOfInterestRow[];
    if (selectedStops.length !== stopIds.length) {
      return { ok: false, error: "Una o più fermate selezionate non sono valide." };
    }
  }

  const routePoints = [
    origin,
    ...selectedStops.map((stop) => `${stop.lat},${stop.lng}`),
    destination,
  ];
  const fallbackDistanceKm =
    Number(process.env.SIMULATED_DISTANCE_KM ?? 120) + selectedStops.length * 12;

  const metrics = await getRouteMetrics(routePoints, fallbackDistanceKm);
  const distanceKm = metrics.distanceKm;
  const provider = metrics.provider;
  const driveDurationMinutes = metrics.driveDurationMinutes;

  const basePrice = Number(pricingRule.base_fare);
  const kmPrice = distanceKm * Number(pricingRule.price_per_km);
  const stopPrice =
    selectedStops.length > 0
      ? selectedStops.reduce(
          (total, stop) => total + Number(stop.base_stop_price ?? pricingRule.stop_fee),
          0
        )
      : 0;
  const totalDeviationMinutes = selectedStops.reduce(
    (total, stop) => total + Number(stop.deviation_time_minutes ?? 0),
    0
  );
  const deviationExtra = totalDeviationMinutes * Number(pricingRule.wait_fee_per_minute);
  const subtotal = basePrice + kmPrice + stopPrice + deviationExtra;

  const stopsSnapshot: TripStopSnapshot[] = selectedStops.map((stop) => ({
    id: stop.id,
    name: stop.name,
    lat: stop.lat,
    lng: stop.lng,
    base_stop_price: Number(stop.base_stop_price ?? 0),
    deviation_time_minutes: Number(stop.deviation_time_minutes ?? 0),
    suggested_duration_minutes: Number(stop.suggested_duration_minutes ?? 0),
  }));

  const totalStopDurationMinutes = stopsSnapshot.reduce(
    (sum, s) => sum + s.suggested_duration_minutes,
    0
  );

  const durationMinutesEstimate = Math.max(
    1,
    driveDurationMinutes + totalStopDurationMinutes
  );

  const roundedDistanceKm = roundCurrency(distanceKm);
  const byVehicle = {} as Record<TripVehicleType, PerVehicleQuoteSlice>;

  for (const vehicleType of ALL_VEHICLE_TYPES) {
    const vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType];
    const vehicleSurcharge = subtotal * (vehicleMultiplier - 1);
    const finalPrice = subtotal + vehicleSurcharge;
    byVehicle[vehicleType] = {
      vehicleType,
      vehicleMultiplier,
      breakdown: {
        costoBase: roundCurrency(basePrice),
        costoKm: roundCurrency(kmPrice),
        costoSoste: roundCurrency(stopPrice),
        costoDeviazione: roundCurrency(deviationExtra),
        extraVeicolo: roundCurrency(vehicleSurcharge),
        totalPrice: roundCurrency(finalPrice),
      },
      totalPrice: roundCurrency(finalPrice),
    };
  }

  return {
    ok: true,
    data: {
      currency: pricingRule.currency,
      provider,
      distanceKm: roundedDistanceKm,
      durationMinutesEstimate,
      pricingRule: {
        id: pricingRule.id,
        name: pricingRule.name,
      },
      stopsSnapshot,
      totalStopDurationMinutes,
      byVehicle,
    },
  };
}
