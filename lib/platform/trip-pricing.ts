import type { SupabaseClient } from "@supabase/supabase-js";
import { getStaticPoiByIds } from "@/lib/platform/static-pois";
import { resolvePoiStopsByIds } from "@/lib/platform/poi-query";
import {
  isGeoFenceEnabled,
  isWithinItaly,
  resolveLatLngForPricing,
} from "@/lib/platform/pricing-engine";
import { QUOTE_ERROR_OUT_OF_AREA } from "@/lib/platform/quote-errors";
import {
  computeStopWaitCost,
  getWaitTimeBand,
  loadWaitTimeRatesConfig,
  type WaitTimeBand,
} from "@/lib/platform/wait-time-pricing";
import { VEHICLE_MULTIPLIERS } from "@/lib/platform/vehicle-pricing-multipliers";
import type { TripStopInput, TripVehicleType } from "@/types/trip";

export type TripStopSnapshot = {
  id: string;
  kind: "catalog" | "custom";
  name: string;
  address: string;
  lat: number;
  lng: number;
  base_stop_price: number;
  duration_minutes: number;
  wait_cost_by_vehicle: Record<TripVehicleType, number>;
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
  waitTimeBand: WaitTimeBand;
  breakdown: {
    costoBase: number;
    costoKm: number;
    costoSoste: number;
    costoAttesa: number;
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
  waitTimeBand: WaitTimeBand;
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
  pickupTime: string;
  stops: TripStopInput[];
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

type ResolvedStop = {
  id: string;
  kind: "catalog" | "custom";
  name: string;
  address: string;
  lat: number;
  lng: number;
  base_stop_price: number;
  duration_minutes: number;
};

async function resolveTripStops(
  supabase: SupabaseClient | null,
  stops: TripStopInput[],
  pricingRule: PricingRuleRow
): Promise<{ ok: true; data: ResolvedStop[] } | { ok: false; error: string }> {
  if (stops.length === 0) {
    return { ok: true, data: [] };
  }

  const catalogIds = stops.filter((s) => s.kind === "catalog").map((s) => s.id);
  const catalogById = new Map<string, PointOfInterestRow>();

  if (catalogIds.length > 0) {
    const { data: poiRows, error: poiError } = await resolvePoiStopsByIds(supabase, catalogIds);
    if (poiError) {
      return { ok: false, error: `Errore recupero fermate: ${poiError.message}` };
    }
    for (const row of poiRows as PointOfInterestRow[]) {
      catalogById.set(row.id, row);
    }
    const staticFallback = getStaticPoiByIds(
      catalogIds.filter((id) => !catalogById.has(id))
    );
    for (const row of staticFallback) {
      catalogById.set(row.id, row);
    }
  }

  const resolved: ResolvedStop[] = [];

  for (const stop of stops) {
    const duration = Math.max(15, Math.min(480, Math.round(stop.durationMinutes)));

    if (stop.kind === "catalog") {
      const poi = catalogById.get(stop.id);
      if (!poi) {
        return { ok: false, error: `Fermata «${stop.label || stop.id}» non valida.` };
      }
      resolved.push({
        id: poi.id,
        kind: "catalog",
        name: stop.label || poi.name,
        address: stop.address ?? poi.name,
        lat: poi.lat,
        lng: poi.lng,
        base_stop_price: Number(poi.base_stop_price ?? pricingRule.stop_fee),
        duration_minutes: duration,
      });
      continue;
    }

    const address = (stop.address ?? stop.label).trim();
    if (!address) {
      return { ok: false, error: "Indicate un indirizzo per la fermata personalizzata." };
    }

    let lat = stop.lat;
    let lng = stop.lng;
    if (lat == null || lng == null) {
      const coords = await resolveLatLngForPricing(address);
      if (!coords) {
        return {
          ok: false,
          error: `Impossibile geolocalizzare la fermata: «${address}». Verificate l'indirizzo.`,
        };
      }
      lat = coords.lat;
      lng = coords.lng;
    }

    if (isGeoFenceEnabled() && !isWithinItaly(lat, lng)) {
      return { ok: false, error: QUOTE_ERROR_OUT_OF_AREA };
    }

    resolved.push({
      id: stop.id,
      kind: "custom",
      name: stop.label.trim() || "Fermata personalizzata",
      address,
      lat,
      lng,
      base_stop_price: 0,
      duration_minutes: duration,
    });
  }

  return { ok: true, data: resolved };
}

/** Converte vecchio payload `stops: string[]` in TripStopInput[]. */
export function legacyStopIdsToInputs(
  stopIds: string[],
  catalogDefaults: Map<string, { label: string; durationMinutes: number }>
): TripStopInput[] {
  return stopIds.map((id) => {
    const defaults = catalogDefaults.get(id);
    return {
      kind: "catalog",
      id,
      label: defaults?.label ?? id,
      durationMinutes: defaults?.durationMinutes ?? 60,
    };
  });
}

export async function computeTripQuotesAllVehicles(
  supabase: SupabaseClient | null,
  input: ComputeTripQuotesAllInput
): Promise<ComputeTripQuotesAllResult> {
  const origin = input.origin.trim();
  const destination = input.destination.trim();
  const pickupTime = input.pickupTime.trim() || "10:00";
  const stopsInput = input.stops ?? [];

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

  const [pricingRule, waitConfig] = await Promise.all([
    loadPricingRule(supabase),
    loadWaitTimeRatesConfig(),
  ]);

  const resolvedStops = await resolveTripStops(supabase, stopsInput, pricingRule);
  if (!resolvedStops.ok) {
    return { ok: false, error: resolvedStops.error };
  }

  const selectedStops = resolvedStops.data;

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
  const catalogStopFees = selectedStops.reduce((total, stop) => total + stop.base_stop_price, 0);
  const transportSubtotal = basePrice + kmPrice + catalogStopFees;

  const waitTimeBand = getWaitTimeBand(pickupTime);

  const stopsSnapshot: TripStopSnapshot[] = selectedStops.map((stop) => {
    const wait_cost_by_vehicle = {} as Record<TripVehicleType, number>;
    for (const vt of ALL_VEHICLE_TYPES) {
      wait_cost_by_vehicle[vt] = computeStopWaitCost(
        waitConfig,
        vt,
        pickupTime,
        stop.duration_minutes
      ).cost;
    }
    return {
      id: stop.id,
      kind: stop.kind,
      name: stop.name,
      address: stop.address,
      lat: stop.lat,
      lng: stop.lng,
      base_stop_price: stop.base_stop_price,
      duration_minutes: stop.duration_minutes,
      wait_cost_by_vehicle,
    };
  });

  const totalStopDurationMinutes = stopsSnapshot.reduce(
    (sum, s) => sum + s.duration_minutes,
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
    const waitCost = stopsSnapshot.reduce(
      (sum, s) => sum + s.wait_cost_by_vehicle[vehicleType],
      0
    );
    const vehicleSurcharge = transportSubtotal * (vehicleMultiplier - 1);
    const finalPrice = transportSubtotal + waitCost + vehicleSurcharge;

    byVehicle[vehicleType] = {
      vehicleType,
      vehicleMultiplier,
      waitTimeBand,
      breakdown: {
        costoBase: roundCurrency(basePrice),
        costoKm: roundCurrency(kmPrice),
        costoSoste: roundCurrency(catalogStopFees),
        costoAttesa: roundCurrency(waitCost),
        costoDeviazione: 0,
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
      waitTimeBand,
      stopsSnapshot,
      totalStopDurationMinutes,
      byVehicle,
    },
  };
}
