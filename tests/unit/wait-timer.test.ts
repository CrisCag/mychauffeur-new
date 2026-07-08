import { describe, expect, it } from "vitest";
import { calcWaitTimerLimits } from "@/lib/platform/wait-timer";

describe("wait-timer", () => {
  it("standard mode grants grace only on booked time without app extra", () => {
    const limits = calcWaitTimerLimits({
      comfortMode: "standard",
      kind: "stop",
      bookedMinutes: 60,
      extraAppMinutes: 0,
    });
    expect(limits.coveredMinutes).toBe(60);
    expect(limits.graceMinutes).toBe(12);
    expect(limits.redStartOffsetMinutes).toBe(72);
  });

  it("standard mode removes grace when extra minutes purchased in app", () => {
    const limits = calcWaitTimerLimits({
      comfortMode: "standard",
      kind: "stop",
      bookedMinutes: 60,
      extraAppMinutes: 15,
    });
    expect(limits.graceMinutes).toBe(0);
    expect(limits.redStartOffsetMinutes).toBe(75);
  });

  it("VIP mode applies grace on covered time including app extra", () => {
    const limits = calcWaitTimerLimits({
      comfortMode: "no_rush_vip",
      kind: "pickup",
      bookedMinutes: 30,
      extraAppMinutes: 15,
    });
    expect(limits.coveredMinutes).toBe(45);
    expect(limits.graceMinutes).toBe(9);
    expect(limits.redStartOffsetMinutes).toBe(54);
  });
});
