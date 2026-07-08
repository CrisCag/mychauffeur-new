import { describe, expect, it } from "vitest";
import {
  getStaticPoiByIds,
  suggestStaticPois,
  STATIC_POIS,
} from "@/lib/platform/static-pois";
import { resolvePoiStopsByIds } from "@/lib/platform/poi-query";

describe("static-pois", () => {
  it("has a non-empty catalog", () => {
    expect(STATIC_POIS.length).toBeGreaterThan(3);
  });

  it("suggests POIs for Roma–Firenze route", () => {
    const pois = suggestStaticPois("Roma", "Firenze");
    expect(pois.length).toBeGreaterThan(0);
    expect(pois.some((p) => p.routeKeys.includes("roma-firenze"))).toBe(true);
  });

  it("resolves static POI ids without Supabase", async () => {
    const ids = ["poi-orvieto"];
    const resolved = await resolvePoiStopsByIds(null, ids);
    expect(resolved.error).toBeNull();
    expect(resolved.data).toHaveLength(1);
    expect(resolved.data[0]?.name).toBe("Orvieto");
  });

  it("returns error for unknown POI ids", async () => {
    const resolved = await resolvePoiStopsByIds(null, ["poi-does-not-exist"]);
    expect(resolved.data).toHaveLength(0);
    expect(resolved.error).toBeTruthy();
  });

  it("getStaticPoiByIds returns matching rows only", () => {
    const rows = getStaticPoiByIds(["poi-orvieto", "poi-assisi", "missing"]);
    expect(rows).toHaveLength(2);
  });
});
