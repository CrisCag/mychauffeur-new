import { sendBookingEmail } from "@/lib/booking-email";
import { NextResponse } from "next/server";
import { saveBookingRequest, type BookingRequestInput } from "@/lib/booking-requests";

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayload(payload: BookingRequestInput): string | null {
  if (!payload.pickupLocation) return "pickupLocation is required";
  if (!payload.dropoffLocation) return "dropoffLocation is required";
  if (!payload.rideDate) return "rideDate is required";
  if (!payload.rideTime) return "rideTime is required";
  if (!payload.passengers) return "passengers is required";
  if (!payload.vehicleType) return "vehicleType is required";

  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const timeRe = /^\d{2}:\d{2}$/;
  const passengersNum = Number(payload.passengers);
  if (!dateRe.test(payload.rideDate)) return "rideDate format is invalid";
  if (!timeRe.test(payload.rideTime)) return "rideTime format is invalid";
  if (!Number.isFinite(passengersNum) || passengersNum < 1 || passengersNum > 7) {
    return "passengers must be between 1 and 7";
  }
  if (!["sedan", "van", "other"].includes(payload.vehicleType)) {
    return "vehicleType is invalid";
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<BookingRequestInput>;
    const payload: BookingRequestInput = {
      pickupLocation: toTrimmedString(body.pickupLocation),
      dropoffLocation: toTrimmedString(body.dropoffLocation),
      rideDate: toTrimmedString(body.rideDate),
      rideTime: toTrimmedString(body.rideTime),
      passengers: toTrimmedString(body.passengers),
      vehicleType:
        body.vehicleType === "van" || body.vehicleType === "other"
          ? body.vehicleType
          : "sedan",
      vehicleOtherDetails: toTrimmedString(body.vehicleOtherDetails) || undefined,
      locale: toTrimmedString(body.locale) || undefined,
      inquiryType: body.inquiryType === "b2b" ? "b2b" : "standard",
    };

    const error = validatePayload(payload);
    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    const destinationEmail =
      payload.inquiryType === "b2b"
        ? "bypartners@mychauffeur.it"
        : "info@mychauffeur.it";

    const saved = await saveBookingRequest({
      ...payload,
      destinationEmail,
    });
    const emailSent = await sendBookingEmail(saved);

    return NextResponse.json(
      { ok: true, requestId: saved.id, destinationEmail, emailSent },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unexpected error while creating booking request" },
      { status: 500 }
    );
  }
}
