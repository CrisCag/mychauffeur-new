export type {
  Booking,
  BookingId,
  CustomerId,
  CreateBookingInput,
  RehydrateBookingInput,
} from "./domain/booking";
export {
  asBookingId,
  asCustomerId,
  createBooking,
  rehydrateBooking,
  requestBookingConfirmation,
  confirmBooking,
  cancelBooking,
  expireBooking,
  assertBookingSourceUnchanged,
} from "./domain/booking";

export type { BookingNumber } from "./domain/booking-number";
export {
  asBookingNumber,
  normalizeBookingNumber,
  createBookingNumberFromToken,
} from "./domain/booking-number";

export type { BookingSource } from "./domain/booking-source";
export { BOOKING_SOURCES, isBookingSource } from "./domain/booking-source";

export type { BookingStatus, TerminalBookingStatus } from "./domain/booking-status";
export {
  BOOKING_STATUSES,
  TERMINAL_BOOKING_STATUSES,
  isBookingStatus,
  isTerminalBookingStatus,
} from "./domain/booking-status";

export type { GuestCustomerSnapshot } from "./domain/guest-customer-snapshot";
export { createGuestCustomerSnapshot } from "./domain/guest-customer-snapshot";

export {
  DomainValidationError,
  InvalidBookingIdError,
  InvalidBookingNumberError,
  InvalidBookingStateTransitionError,
  MissingBookingCustomerError,
  BookingTenantMismatchError,
  BookingOrganizationMismatchError,
  BookingVersionConflictError,
  BookingNotFoundError,
  DuplicateBookingNumberError,
} from "./domain/errors";

export type { BookingRepository } from "./application/booking-repository";
