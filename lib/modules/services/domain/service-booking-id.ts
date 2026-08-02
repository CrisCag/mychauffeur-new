import { DomainValidationError } from "./errors";

declare const serviceBookingIdBrand: unique symbol;

/**
 * Opaque local Booking reference inside services Domain.
 * Does not import bookings module.
 */
export type ServiceBookingId = string & {
  readonly [serviceBookingIdBrand]: "ServiceBookingId";
};

export function asServiceBookingId(value: string): ServiceBookingId {
  const normalized = value.trim();
  if (!normalized || normalized.length > 64) {
    throw new DomainValidationError("bookingId is invalid");
  }
  return normalized as ServiceBookingId;
}
