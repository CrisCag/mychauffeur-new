import { describe, expect, it } from "vitest";
import {
  bookingVehicleToQuoteVehicle,
  validateQuotedPrice,
} from "@/lib/api/booking-quote-validation";
import type { BookingRequestInput } from "@/lib/booking-requests";

function basePayload(
  overrides: Partial<BookingRequestInput> = {}
): BookingRequestInput {
  return {
    pickupLocation: "Roma Termini",
    dropoffLocation: "Firenze SMN",
    rideDate: "2026-09-01",
    rideTime: "10:00",
    passengers: "2",
    vehicleType: "sedan",
    ...overrides,
  };
}

describe("booking-quote-validation", () => {
  it("maps booking vehicle types to quote vehicle types", () => {
    expect(bookingVehicleToQuoteVehicle("sedan")).toBe("sedan");
    expect(bookingVehicleToQuoteVehicle("van")).toBe("van");
    expect(bookingVehicleToQuoteVehicle("luxury")).toBe("luxury");
    expect(bookingVehicleToQuoteVehicle("other")).toBe("luxury");
  });

  it("skips validation when quotedPrice is omitted", async () => {
    const error = await validateQuotedPrice(basePayload());
    expect(error).toBeNull();
  });

  it("accepts quotedPrice matching server calculation", async () => {
    const { computeTripQuotesAllVehicles } = await import("@/lib/platform/trip-pricing");
    const quote = await computeTripQuotesAllVehicles(null, {
      origin: "Roma Termini",
      destination: "Firenze SMN",
      pickupTime: "10:00",
      stops: [],
    });
    expect(quote.ok).toBe(true);
    if (!quote.ok) return;

    const error = await validateQuotedPrice(
      basePayload({
        quotedPrice: quote.data.byVehicle.sedan.totalPrice,
        vehicleType: "sedan",
      })
    );
    expect(error).toBeNull();
  });

  it("rejects manipulated quotedPrice", async () => {
    const error = await validateQuotedPrice(
      basePayload({
        quotedPrice: 1,
        vehicleType: "sedan",
      })
    );
    expect(error).toBe("quotedPrice does not match server calculation");
  });
});
