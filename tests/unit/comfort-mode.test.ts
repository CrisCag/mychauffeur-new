import { describe, expect, it } from "vitest";
import { applyNoRushMarkup, getComfortModeConfigSync } from "@/lib/platform/comfort-mode";

describe("comfort-mode", () => {
  it("exposes default VIP markup percent", () => {
    const config = getComfortModeConfigSync();
    expect(config.noRushVip.markupPercent).toBeGreaterThan(0);
    expect(config.standard.gracePercentOnBookedOnly).toBe(20);
  });

  it("applies no-rush markup with rounding", () => {
    expect(applyNoRushMarkup(100, 18)).toBe(118);
    expect(applyNoRushMarkup(502, 18)).toBe(592.36);
  });

  it("ignores negative markup", () => {
    expect(applyNoRushMarkup(100, -5)).toBe(100);
  });
});
