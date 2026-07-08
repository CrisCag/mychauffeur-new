import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/booking/route";

vi.mock("@/lib/booking-requests", () => ({
  saveBookingRequest: vi.fn(async (input) => ({
    ...input,
    id: "test-booking-request-id",
    createdAt: "2026-01-01T00:00:00.000Z",
  })),
}));

vi.mock("@/lib/platform/trip-ops-store", () => ({
  createOperationalTripFromBooking: vi.fn(async () => ({
    id: "test-operational-trip-id",
  })),
}));

vi.mock("@/lib/booking-email", () => ({
  sendBookingEmail: vi.fn(async () => false),
}));

function bookingRequest(body: unknown, ip = "test-booking-1") {
  return POST(
    new Request("http://localhost/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(body),
    })
  );
}

const validB2B = {
  pickupLocation: "FCO Airport",
  dropoffLocation: "Via Example 1, Roma",
  rideDate: "2026-09-15",
  rideTime: "09:30",
  passengers: "2",
  vehicleType: "sedan",
  inquiryType: "b2b",
};

describe("POST /api/booking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await bookingRequest({
      ...validB2B,
      pickupLocation: "",
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { ok: boolean; error?: string };
    expect(json.ok).toBe(false);
  });

  it("rejects honeypot submissions", async () => {
    const res = await bookingRequest({
      ...validB2B,
      _hpWebsite: "https://spam.example",
    });
    expect(res.status).toBe(400);
  });

  it("requires guest contact fields for standard inquiries", async () => {
    const res = await bookingRequest({
      ...validB2B,
      inquiryType: "standard",
      guestName: "",
      guestEmail: "not-an-email",
      guestPhone: "12",
    });
    expect(res.status).toBe(400);
  });

  it("accepts valid B2B booking without writing real runtime files", async () => {
    const { saveBookingRequest } = await import("@/lib/booking-requests");
    const res = await bookingRequest(validB2B, "test-booking-2");
    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      ok: boolean;
      requestId?: string;
      tripId?: string;
    };
    expect(json.ok).toBe(true);
    expect(json.requestId).toBe("test-booking-request-id");
    expect(json.tripId).toBe("test-operational-trip-id");
    expect(saveBookingRequest).toHaveBeenCalledOnce();
  });

  it("rejects manipulated quotedPrice on standard booking", async () => {
    const res = await bookingRequest(
      {
        pickupLocation: "Roma",
        dropoffLocation: "Firenze",
        rideDate: "2026-09-01",
        rideTime: "10:00",
        passengers: "2",
        vehicleType: "sedan",
        inquiryType: "standard",
        guestName: "Test User",
        guestEmail: "test@example.com",
        guestPhone: "+390612345678",
        quotedPrice: 1,
      },
      "test-booking-3"
    );
    expect(res.status).toBe(400);
  });
});
