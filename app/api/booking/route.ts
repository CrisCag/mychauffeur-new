import { validateQuotedPrice } from "@/lib/api/booking-quote-validation";
import { enforceApiRateLimit } from "@/lib/api/enforce-rate-limit";
import { clientFacingMessage } from "@/lib/api/production-errors";
import { sendBookingEmail } from "@/lib/booking-email";
import { NextResponse } from "next/server";
import { saveBookingRequest, type BookingRequestInput } from "@/lib/booking-requests";
import { createOperationalTripFromBooking } from "@/lib/platform/trip-ops-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type BookingApiBody = Partial<BookingRequestInput> & {
  /** Honeypot — must stay empty; bots often fill hidden fields. */
  _hpWebsite?: string;
};

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeVehicleType(value: unknown): BookingRequestInput["vehicleType"] {
  if (value === "van" || value === "luxury" || value === "other") {
    return value;
  }
  return "sedan";
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
  if (!["sedan", "van", "luxury", "other"].includes(payload.vehicleType)) {
    return "vehicleType is invalid";
  }

  if (payload.inquiryType !== "b2b") {
    if (!payload.guestName?.trim()) return "guestName is required";
    if (!payload.guestEmail?.trim() || !EMAIL_RE.test(payload.guestEmail)) {
      return "guestEmail is invalid";
    }
    if (!payload.guestPhone?.trim() || payload.guestPhone.trim().length < 6) {
      return "guestPhone is invalid";
    }
  }

  if (payload.addReturn || payload.bookingMode === "round_trip") {
    if (!payload.returnDate?.trim() || !dateRe.test(payload.returnDate)) {
      return "returnDate is required for round trip";
    }
    if (!payload.returnTime?.trim() || !timeRe.test(payload.returnTime)) {
      return "returnTime is required for round trip";
    }
    if (payload.returnDate < payload.rideDate) {
      return "returnDate must be on or after rideDate";
    }
  }

  if (
    payload.quotedPrice != null &&
    (!Number.isFinite(payload.quotedPrice) || payload.quotedPrice < 0)
  ) {
    return "quotedPrice is invalid";
  }

  return null;
}

function bookingError(message: string, status: number) {
  return NextResponse.json(
    {
      ok: false,
      error: clientFacingMessage(message, "Invalid booking request."),
    },
    { status }
  );
}

export async function POST(req: Request) {
  const rateLimited = enforceApiRateLimit(req, "booking", "ok");
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const body = (await req.json()) as BookingApiBody;

    if (toTrimmedString(body._hpWebsite)) {
      return bookingError("Honeypot triggered", 400);
    }

    const payload: BookingRequestInput = {
      pickupLocation: toTrimmedString(body.pickupLocation),
      dropoffLocation: toTrimmedString(body.dropoffLocation),
      rideDate: toTrimmedString(body.rideDate),
      rideTime: toTrimmedString(body.rideTime),
      passengers: toTrimmedString(body.passengers),
      vehicleType: normalizeVehicleType(body.vehicleType),
      vehicleOtherDetails: toTrimmedString(body.vehicleOtherDetails) || undefined,
      locale: toTrimmedString(body.locale) || undefined,
      inquiryType: body.inquiryType === "b2b" ? "b2b" : "standard",
      quotedPrice:
        typeof body.quotedPrice === "number" && Number.isFinite(body.quotedPrice)
          ? body.quotedPrice
          : undefined,
      quoteCurrency: toTrimmedString(body.quoteCurrency) || undefined,
      distanceKm:
        typeof body.distanceKm === "number" && Number.isFinite(body.distanceKm)
          ? body.distanceKm
          : undefined,
      durationMinutes:
        typeof body.durationMinutes === "number" && Number.isFinite(body.durationMinutes)
          ? body.durationMinutes
          : undefined,
      quoteId:
        typeof body.quoteId === "string" && body.quoteId.trim()
          ? body.quoteId.trim()
          : body.quoteId === null
            ? null
            : undefined,
      addReturn: body.addReturn === true,
      returnDate: toTrimmedString(body.returnDate) || undefined,
      returnTime: toTrimmedString(body.returnTime) || undefined,
      bookingMode:
        body.bookingMode === "round_trip" ? "round_trip" : "one_way",
      noRushVip: body.noRushVip === true,
      selectedPoiIds: Array.isArray(body.selectedPoiIds)
        ? body.selectedPoiIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
        : undefined,
      selectedStopNames: Array.isArray(body.selectedStopNames)
        ? body.selectedStopNames.filter((n): n is string => typeof n === "string" && n.trim().length > 0)
        : undefined,
      guestName: toTrimmedString(body.guestName) || undefined,
      guestEmail: toTrimmedString(body.guestEmail) || undefined,
      guestPhone: toTrimmedString(body.guestPhone) || undefined,
      tripStops: Array.isArray(body.tripStops) ? body.tripStops : undefined,
      stopsSummary: toTrimmedString(body.stopsSummary) || undefined,
    };

    const error = validatePayload(payload);
    if (error) {
      return bookingError(error, 400);
    }

    const priceError = await validateQuotedPrice(payload);
    if (priceError) {
      return bookingError(priceError, 400);
    }

    const destinationEmail =
      payload.inquiryType === "b2b"
        ? "bypartners@mychauffeur.it"
        : "info@mychauffeur.it";

    const saved = await saveBookingRequest({
      ...payload,
      destinationEmail,
    });
    const operationalTrip = await createOperationalTripFromBooking(saved);
    const emailSent = await sendBookingEmail(saved);

    return NextResponse.json(
      { ok: true, requestId: saved.id, tripId: operationalTrip.id, destinationEmail, emailSent },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: clientFacingMessage(
          "Unexpected error while creating booking request",
          "Unable to submit booking request."
        ),
      },
      { status: 500 }
    );
  }
}
