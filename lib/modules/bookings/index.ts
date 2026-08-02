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
  replaceBookingCommercialSnapshots,
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

export type { PriceSnapshot, PriceSnapshotInput } from "./domain/price-snapshot";
export {
  createPriceSnapshot,
  clonePriceSnapshot,
  serializePriceSnapshot,
} from "./domain/price-snapshot";

export type {
  PolicySnapshot,
  PolicySnapshotInput,
  RefundReadiness,
} from "./domain/policy-snapshot";
export {
  createPolicySnapshot,
  clonePolicySnapshot,
  serializePolicySnapshot,
} from "./domain/policy-snapshot";

export type {
  ContactSnapshot,
  ContactSnapshotInput,
} from "./domain/contact-snapshot";
export {
  createContactSnapshot,
  cloneContactSnapshot,
  serializeContactSnapshot,
} from "./domain/contact-snapshot";

export type {
  BillingSnapshot,
  BillingSnapshotInput,
  BillingPartyType,
} from "./domain/billing-snapshot";
export {
  createBillingSnapshot,
  cloneBillingSnapshot,
  serializeBillingSnapshot,
} from "./domain/billing-snapshot";

export type {
  CommercialSnapshots,
  CommercialSnapshotsInput,
  CommercialSnapshotFields,
} from "./domain/commercial-snapshots";
export {
  createCommercialSnapshots,
  cloneCommercialSnapshots,
  assertCommercialSnapshotInvariants,
} from "./domain/commercial-snapshots";

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
  MissingCommercialSnapshotError,
  CommercialSnapshotImmutableError,
} from "./domain/errors";

export type { BookingRepository } from "./application/booking-repository";
