import { InvalidBookingNumberError } from "./errors";

declare const bookingNumberBrand: unique symbol;

/**
 * Public booking reference — distinct from BookingId.
 * Not a predictable sequential integer. Contains no PII.
 * Format: BK- + 8..32 uppercase alphanumeric characters.
 */
export type BookingNumber = string & {
  readonly [bookingNumberBrand]: "BookingNumber";
};

const BOOKING_NUMBER_PATTERN = /^BK-[A-Z0-9]{8,32}$/;

export function normalizeBookingNumber(value: string): string {
  return value.trim().toUpperCase();
}

export function asBookingNumber(value: string): BookingNumber {
  const normalized = normalizeBookingNumber(value);
  if (!BOOKING_NUMBER_PATTERN.test(normalized)) {
    throw new InvalidBookingNumberError();
  }
  return normalized as BookingNumber;
}

/**
 * Collision-resistant readiness helper (not a distributed ID service).
 * Uses a provided random token (e.g. UUID) compacted into BK-XXXXXXXX…
 */
export function createBookingNumberFromToken(token: string): BookingNumber {
  const compact = token.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (compact.length < 8) {
    throw new InvalidBookingNumberError();
  }
  return asBookingNumber(`BK-${compact.slice(0, 16)}`);
}
