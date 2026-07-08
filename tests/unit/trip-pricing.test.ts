import { describe, expect, it } from "vitest";
import {
  computeTripQuotesAllVehicles,
  FALLBACK_PRICING_RULE,
} from "@/lib/platform/trip-pricing";
import { VEHICLE_MULTIPLIERS } from "@/lib/platform/vehicle-pricing-multipliers";

describe("trip-pricing", () => {
  it("uses fallback pricing rule without Supabase", async () => {
    const result = await computeTripQuotesAllVehicles(null, {
      origin: "Roma Termini",
      destination: "Firenze SMN",
      pickupTime: "10:00",
      stops: [],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.currency).toBe(FALLBACK_PRICING_RULE.currency);
    expect(result.data.distanceKm).toBeGreaterThan(0);
    expect(result.data.provider).toBe("simulated");
  });

  it("returns quotes for all vehicle types with luxury highest", async () => {
    const result = await computeTripQuotesAllVehicles(null, {
      origin: "Milano",
      destination: "Como",
      pickupTime: "14:00",
      stops: [],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const { sedan, van, luxury } = result.data.byVehicle;
    expect(sedan.totalPrice).toBeGreaterThan(0);
    expect(van.totalPrice).toBeGreaterThan(sedan.totalPrice);
    expect(luxury.totalPrice).toBeGreaterThan(van.totalPrice);
    expect(sedan.vehicleMultiplier).toBe(VEHICLE_MULTIPLIERS.sedan);
    expect(luxury.vehicleMultiplier).toBe(VEHICLE_MULTIPLIERS.luxury);
  });

  it("adds catalog stop fees when POI stop is included", async () => {
    const withoutStop = await computeTripQuotesAllVehicles(null, {
      origin: "Roma",
      destination: "Firenze",
      pickupTime: "10:00",
      stops: [],
    });
    const withStop = await computeTripQuotesAllVehicles(null, {
      origin: "Roma",
      destination: "Firenze",
      pickupTime: "10:00",
      stops: [
        {
          kind: "catalog",
          id: "poi-orvieto",
          label: "Orvieto",
          durationMinutes: 90,
        },
      ],
    });

    expect(withoutStop.ok && withStop.ok).toBe(true);
    if (!withoutStop.ok || !withStop.ok) return;

    expect(withStop.data.byVehicle.sedan.totalPrice).toBeGreaterThan(
      withoutStop.data.byVehicle.sedan.totalPrice
    );
    expect(withStop.data.stopsSnapshot).toHaveLength(1);
  });

  it("rejects empty origin or destination", async () => {
    const result = await computeTripQuotesAllVehicles(null, {
      origin: "",
      destination: "Firenze",
      pickupTime: "10:00",
      stops: [],
    });
    expect(result.ok).toBe(false);
  });
});
