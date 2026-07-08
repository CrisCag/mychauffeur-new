import { describe, expect, it } from "vitest";
import {
  computeStopWaitCost,
  computeTotalWaitCost,
  getWaitRatePerMinute,
  getWaitTimeBand,
  getWaitTimeRatesConfigSync,
  normalizeStopDurationMinutes,
  parsePickupTimeMinutes,
} from "@/lib/platform/wait-time-pricing";

const config = getWaitTimeRatesConfigSync();

describe("wait-time-pricing", () => {
  it("parses valid pickup times", () => {
    expect(parsePickupTimeMinutes("10:00")).toBe(600);
    expect(parsePickupTimeMinutes("22:30")).toBe(1350);
  });

  it("rejects invalid pickup times", () => {
    expect(parsePickupTimeMinutes("25:00")).toBeNull();
    expect(parsePickupTimeMinutes("bad")).toBeNull();
  });

  it("maps pickup time to wait band", () => {
    expect(getWaitTimeBand("10:00")).toBe("day");
    expect(getWaitTimeBand("21:00")).toBe("evening");
    expect(getWaitTimeBand("23:00")).toBe("night");
  });

  it("clamps stop duration to configured min/max", () => {
    expect(normalizeStopDurationMinutes(config, 5)).toBe(config.minDurationMinutes);
    expect(normalizeStopDurationMinutes(config, 999)).toBe(config.maxDurationMinutes);
    expect(normalizeStopDurationMinutes(config, 60)).toBe(60);
  });

  it("computes stop wait cost by vehicle and band", () => {
    const sedanDay = computeStopWaitCost(config, "sedan", "10:00", 60);
    expect(sedanDay.band).toBe("day");
    expect(sedanDay.ratePerMinute).toBe(getWaitRatePerMinute(config, "sedan", "day"));
    expect(sedanDay.cost).toBe(48);

    const luxuryNight = computeStopWaitCost(config, "luxury", "23:00", 30);
    expect(luxuryNight.band).toBe("night");
    expect(luxuryNight.cost).toBe(66);
  });

  it("sums total wait cost across stops", () => {
    const total = computeTotalWaitCost(config, "van", "10:00", [30, 30]);
    expect(total).toBe(60);
  });
});
