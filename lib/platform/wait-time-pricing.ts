import { readFile } from "node:fs/promises";
import path from "node:path";
import type { TripVehicleType } from "@/types/trip";

export type WaitTimeBand = "day" | "evening" | "night";

export type WaitTimeRatesConfig = {
  version: number;
  currency: string;
  durationOptionsMinutes: number[];
  maxDurationMinutes: number;
  minDurationMinutes: number;
  bands: Record<
    WaitTimeBand,
    { labelIt: string; labelEn: string; startHour: number; endHour: number }
  >;
  ratesPerMinute: Record<
    WaitTimeBand,
    Record<TripVehicleType, number>
  >;
};

const DEFAULT_CONFIG: WaitTimeRatesConfig = {
  version: 1,
  currency: "EUR",
  durationOptionsMinutes: [15, 30, 45, 60, 90, 120, 180, 240, 360, 480],
  maxDurationMinutes: 480,
  minDurationMinutes: 15,
  bands: {
    day: { labelIt: "06:00 – 20:00", labelEn: "6:00 AM – 8:00 PM", startHour: 6, endHour: 20 },
    evening: {
      labelIt: "20:00 – 22:00",
      labelEn: "8:00 PM – 10:00 PM",
      startHour: 20,
      endHour: 22,
    },
    night: { labelIt: "22:00 – 06:00", labelEn: "10:00 PM – 6:00 AM", startHour: 22, endHour: 6 },
  },
  ratesPerMinute: {
    day: { sedan: 0.8, van: 1.0, luxury: 1.5 },
    evening: { sedan: 1.0, van: 1.2, luxury: 1.8 },
    night: { sedan: 1.2, van: 1.5, luxury: 2.2 },
  },
};

let cachedConfig: WaitTimeRatesConfig | null = null;

export async function loadWaitTimeRatesConfig(): Promise<WaitTimeRatesConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const filePath = path.join(process.cwd(), "data", "wait-time-rates.json");
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as WaitTimeRatesConfig;
    if (parsed?.ratesPerMinute?.day?.sedan != null) {
      cachedConfig = parsed;
      return parsed;
    }
  } catch {
    // fallback
  }

  cachedConfig = DEFAULT_CONFIG;
  return DEFAULT_CONFIG;
}

export function getWaitTimeRatesConfigSync(): WaitTimeRatesConfig {
  return cachedConfig ?? DEFAULT_CONFIG;
}

export function parsePickupTimeMinutes(pickupTime: string): number | null {
  const match = pickupTime.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

/** Fascia oraria basata sull'orario di partenza del transfer. */
export function getWaitTimeBand(pickupTime: string): WaitTimeBand {
  const totalMinutes = parsePickupTimeMinutes(pickupTime);
  if (totalMinutes == null) {
    return "day";
  }

  const hour = Math.floor(totalMinutes / 60);
  if (hour >= 6 && hour < 20) {
    return "day";
  }
  if (hour >= 20 && hour < 22) {
    return "evening";
  }
  return "night";
}

export function getWaitRatePerMinute(
  config: WaitTimeRatesConfig,
  vehicleType: TripVehicleType,
  band: WaitTimeBand
): number {
  return config.ratesPerMinute[band][vehicleType];
}

export function normalizeStopDurationMinutes(
  config: WaitTimeRatesConfig,
  minutes: number
): number {
  const min = config.minDurationMinutes;
  const max = config.maxDurationMinutes;
  const rounded = Math.round(minutes);
  if (!Number.isFinite(rounded)) {
    return min;
  }
  return Math.min(max, Math.max(min, rounded));
}

export function computeStopWaitCost(
  config: WaitTimeRatesConfig,
  vehicleType: TripVehicleType,
  pickupTime: string,
  durationMinutes: number
): { band: WaitTimeBand; cost: number; ratePerMinute: number } {
  const band = getWaitTimeBand(pickupTime);
  const normalized = normalizeStopDurationMinutes(config, durationMinutes);
  const ratePerMinute = getWaitRatePerMinute(config, vehicleType, band);
  const cost = Math.round(normalized * ratePerMinute * 100) / 100;
  return { band, cost, ratePerMinute };
}

export function computeTotalWaitCost(
  config: WaitTimeRatesConfig,
  vehicleType: TripVehicleType,
  pickupTime: string,
  stopDurationsMinutes: number[]
): number {
  return stopDurationsMinutes.reduce((sum, minutes) => {
    const { cost } = computeStopWaitCost(config, vehicleType, pickupTime, minutes);
    return sum + cost;
  }, 0);
}

export function formatDurationLabel(minutes: number, locale: string): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) {
    return locale === "en" ? `${m} min` : `${m} min`;
  }
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (rest === 0) {
    return locale === "en" ? `${h} h` : `${h} h`;
  }
  return locale === "en" ? `${h} h ${rest} min` : `${h} h ${rest} min`;
}
