import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/trips/calculate/route";

function calculateRequest(body: unknown, ip = "test-calculate-1") {
  return POST(
    new Request("http://localhost/api/trips/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/trips/calculate", () => {
  it("returns 400 when origin or destination is missing", async () => {
    const res = await calculateRequest({ origin: "", destination: "Firenze" });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { success: boolean; error?: string };
    expect(json.success).toBe(false);
    expect(json.error).toBeTruthy();
  });

  it("returns quotes for a valid one-way trip", async () => {
    const res = await calculateRequest({
      origin: "Roma Termini",
      destination: "Firenze SMN",
      pickupTime: "10:00",
      stops: [],
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      quotes?: { sedan?: { totalPrice: number } };
      distanceKm?: number;
    };
    expect(json.success).toBe(true);
    expect(json.distanceKm).toBeGreaterThan(0);
    expect(json.quotes?.sedan?.totalPrice).toBeGreaterThan(0);
  });

  it("applies no-rush markup when requested", async () => {
    const baseRes = await calculateRequest({
      origin: "Perugia",
      destination: "Spoleto",
      pickupTime: "11:00",
      stops: [],
    });
    const vipRes = await calculateRequest(
      {
        origin: "Perugia",
        destination: "Spoleto",
        pickupTime: "11:00",
        stops: [],
        noRushVip: true,
      },
      "test-calculate-2"
    );

    const base = (await baseRes.json()) as {
      quotes?: { sedan?: { totalPrice: number } };
    };
    const vip = (await vipRes.json()) as {
      quotes?: { sedan?: { totalPrice: number } };
      noRushVip?: boolean;
    };

    expect(vip.noRushVip).toBe(true);
    expect(vip.quotes?.sedan?.totalPrice).toBeGreaterThan(
      base.quotes?.sedan?.totalPrice ?? 0
    );
  });
});
