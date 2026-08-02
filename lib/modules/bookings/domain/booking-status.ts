/**
 * Step 5 BookingStatus subset (MC-OS-032 commercial lifecycle reduced).
 * Deferred (not implemented): QUOTED, PENDING_PAYMENT, PENDING_MANUAL_REVIEW,
 * READY_FOR_SERVICE_GENERATION, PARTIALLY_CANCELLED, COMPLETED, ARCHIVED.
 */

export const BOOKING_STATUSES = [
  "DRAFT",
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const TERMINAL_BOOKING_STATUSES = ["CANCELLED", "EXPIRED"] as const;

export type TerminalBookingStatus = (typeof TERMINAL_BOOKING_STATUSES)[number];

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export function isTerminalBookingStatus(
  status: BookingStatus
): status is TerminalBookingStatus {
  return (TERMINAL_BOOKING_STATUSES as readonly string[]).includes(status);
}
