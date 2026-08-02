/**
 * BookingSource channel catalog (MC-OS-032).
 * Source is required, validated, and immutable after Booking creation.
 * Channel does not change Booking semantics.
 */

export const BOOKING_SOURCES = [
  "B2C_WEB",
  "B2C_APP",
  "B2B_PORTAL",
  "HOTEL_PORTAL",
  "AGENCY_PORTAL",
  "CORPORATE_PORTAL",
  "API",
  "SUPPORT_CREATED",
  "OWNER_CREATED",
  "IMPORTED",
  "PARTNER_REFERRAL",
] as const;

export type BookingSource = (typeof BOOKING_SOURCES)[number];

export function isBookingSource(value: string): value is BookingSource {
  return (BOOKING_SOURCES as readonly string[]).includes(value);
}
