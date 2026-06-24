import type { QuoteBreakdown, TripVehicleType, VehicleQuote } from "@/types/trip";

export type BookingFlowSnapshotV1 = {
  version: 1;
  pickup: string;
  destination: string;
  travelDate: string;
  pickupTime: string;
  passengers: number;
  luggageCount: number;
  bookingMode: "one_way" | "round_trip";
  addReturn: boolean;
  returnDate: string;
  returnTime: string;
  selectedPoiIds: string[];
  selectedVehicle: TripVehicleType | null;
  currency: string;
  provider: "google" | "simulated";
  distanceKm: number;
  durationMinutesEstimate: number;
  pricingRule: { id: string; name: string } | null;
  quotes: Record<TripVehicleType, VehicleQuote>;
  updatedAt: string;
};

const STORAGE_KEY = "mychauffeur-booking-flow-v1";

export function saveBookingFlowSnapshot(snapshot: BookingFlowSnapshotV1): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function loadBookingFlowSnapshot(): BookingFlowSnapshotV1 | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as BookingFlowSnapshotV1;
    if (parsed?.version !== 1 || !parsed.pickup || !parsed.destination) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearBookingFlowSnapshot(): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(STORAGE_KEY);
}

export type CalculateApiResponse = {
  success: boolean;
  error?: string;
  currency?: string;
  provider?: "google" | "simulated";
  distanceKm?: number;
  durationMinutesEstimate?: number;
  pricingRule?: { id: string; name: string };
  quotes?: Record<
    TripVehicleType,
    {
      quoteId: string | null;
      totalPrice: number;
      breakdown: QuoteBreakdown;
      vehicleMultiplier: number;
      vehicleType: TripVehicleType;
    }
  >;
  persisted?: boolean;
};

export function mapVehicleTypeFromWidget(
  value: "sedan" | "van" | "other"
): TripVehicleType {
  if (value === "van") {
    return "van";
  }
  if (value === "other") {
    return "luxury";
  }
  return "sedan";
}

const ALL_VEHICLES: TripVehicleType[] = ["sedan", "van", "luxury"];

export function mergeRoundTripQuotes(
  outbound: Record<TripVehicleType, VehicleQuote>,
  returnLeg: Record<TripVehicleType, VehicleQuote>
): Record<TripVehicleType, VehicleQuote> {
  const merged = {} as Record<TripVehicleType, VehicleQuote>;
  for (const vt of ALL_VEHICLES) {
    const o = outbound[vt];
    const r = returnLeg[vt];
    merged[vt] = {
      quoteId: o.quoteId,
      vehicleType: vt,
      vehicleMultiplier: o.vehicleMultiplier,
      totalPrice: Math.round((o.totalPrice + r.totalPrice) * 100) / 100,
      breakdown: {
        costoBase: o.breakdown.costoBase + r.breakdown.costoBase,
        costoKm: o.breakdown.costoKm + r.breakdown.costoKm,
        costoSoste: o.breakdown.costoSoste + r.breakdown.costoSoste,
        costoDeviazione: o.breakdown.costoDeviazione + r.breakdown.costoDeviazione,
        extraVeicolo: o.breakdown.extraVeicolo + r.breakdown.extraVeicolo,
        totalPrice: Math.round((o.totalPrice + r.totalPrice) * 100) / 100,
      },
    };
  }
  return merged;
}
