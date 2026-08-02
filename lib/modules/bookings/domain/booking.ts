import type {
  ActorId,
  OrganizationId,
  TenantId,
} from "@/lib/modules/identity";
import type { BookingNumber } from "./booking-number";
import { asBookingNumber } from "./booking-number";
import type { BookingSource } from "./booking-source";
import { isBookingSource } from "./booking-source";
import type { BookingStatus } from "./booking-status";
import {
  isBookingStatus,
  isTerminalBookingStatus,
} from "./booking-status";
import type { BillingSnapshot } from "./billing-snapshot";
import type { ContactSnapshot } from "./contact-snapshot";
import {
  assertCommercialSnapshotInvariants,
  cloneCommercialFields,
  commercialFieldsFromBundle,
  createCommercialSnapshots,
  emptyCommercialSnapshotFields,
  type CommercialSnapshotFields,
  type CommercialSnapshotsInput,
} from "./commercial-snapshots";
import {
  CommercialSnapshotImmutableError,
  DomainValidationError,
  InvalidBookingIdError,
  InvalidBookingStateTransitionError,
  MissingBookingCustomerError,
  MissingCommercialSnapshotError,
} from "./errors";
import type { GuestCustomerSnapshot } from "./guest-customer-snapshot";
import { createGuestCustomerSnapshot } from "./guest-customer-snapshot";
import type { PolicySnapshot } from "./policy-snapshot";
import type { PriceSnapshot } from "./price-snapshot";

declare const bookingIdBrand: unique symbol;

export type BookingId = string & { readonly [bookingIdBrand]: "BookingId" };

export type CustomerId = string & { readonly __brand?: "CustomerId" };

export function asBookingId(value: string): BookingId {
  const normalized = value.trim();
  if (!normalized) {
    throw new InvalidBookingIdError();
  }
  if (normalized.length > 64) {
    throw new InvalidBookingIdError();
  }
  return normalized as BookingId;
}

export function asCustomerId(value: string): CustomerId {
  const normalized = value.trim();
  if (!normalized) {
    throw new DomainValidationError("customerId is required");
  }
  if (normalized.length > 64) {
    throw new DomainValidationError("customerId is invalid");
  }
  return normalized as CustomerId;
}

/**
 * Booking Aggregate Root — commercial foundation (Step 5–6 / MC-OS-032).
 * Pure Domain: no Infrastructure, Next.js, Supabase, Pricing Engine,
 * Payment provider, Service generation, Dispatch, GPS, or SupportCase.
 *
 * Commercial snapshots freeze at PENDING_CONFIRMATION → CONFIRMED.
 * Future commercial changes require append-only BookingRevision (not in Step 6).
 */
export type Booking = {
  readonly id: BookingId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly bookingNumber: BookingNumber;
  readonly bookedByActorId: ActorId;
  readonly customerId: CustomerId | null;
  readonly guestCustomerSnapshot: GuestCustomerSnapshot | null;
  readonly source: BookingSource;
  readonly status: BookingStatus;
  readonly requestedAt: Date;
  readonly confirmedAt: Date | null;
  readonly cancelledAt: Date | null;
  readonly expiredAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
  readonly priceSnapshot: PriceSnapshot | null;
  readonly policySnapshot: PolicySnapshot | null;
  readonly contactSnapshot: ContactSnapshot | null;
  readonly billingSnapshot: BillingSnapshot | null;
  /** 0 before commercial freeze; >=1 after confirmation (revision readiness). */
  readonly commercialRevision: number;
};

export type CreateBookingInput = {
  id: BookingId;
  tenantId: TenantId;
  organizationId: OrganizationId;
  bookingNumber: BookingNumber | string;
  bookedByActorId: ActorId;
  customerId?: CustomerId | string | null;
  guestCustomerSnapshot?: {
    displayName?: string;
    email?: string;
    phone?: string;
  } | null;
  source: BookingSource;
  requestedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
};

export type RehydrateBookingInput = {
  id: BookingId | string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  bookingNumber: BookingNumber | string;
  bookedByActorId: ActorId;
  customerId?: CustomerId | string | null;
  guestCustomerSnapshot?: GuestCustomerSnapshot | null;
  source: BookingSource | string;
  status: BookingStatus | string;
  requestedAt: Date;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
  expiredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  priceSnapshot?: PriceSnapshot | null;
  policySnapshot?: PolicySnapshot | null;
  contactSnapshot?: ContactSnapshot | null;
  billingSnapshot?: BillingSnapshot | null;
  commercialRevision?: number;
};

function assertNonEmptyId(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new DomainValidationError(`${field} is required`);
  }
  return normalized;
}

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 0) {
    throw new DomainValidationError(
      "Booking version must be a non-negative integer"
    );
  }
  return version;
}

function assertTimestamps(createdAt: Date, updatedAt: Date, requestedAt: Date) {
  if (!(createdAt instanceof Date) || Number.isNaN(createdAt.getTime())) {
    throw new DomainValidationError("createdAt is invalid");
  }
  if (!(updatedAt instanceof Date) || Number.isNaN(updatedAt.getTime())) {
    throw new DomainValidationError("updatedAt is invalid");
  }
  if (!(requestedAt instanceof Date) || Number.isNaN(requestedAt.getTime())) {
    throw new DomainValidationError("requestedAt is invalid");
  }
  if (createdAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }
}

function assertCustomerPresence(
  customerId: CustomerId | null,
  guest: GuestCustomerSnapshot | null
): void {
  if (!customerId && !guest) {
    throw new MissingBookingCustomerError();
  }
}

function assertStatusTimestamps(
  status: BookingStatus,
  confirmedAt: Date | null,
  cancelledAt: Date | null,
  expiredAt: Date | null
): void {
  if (status === "CONFIRMED") {
    if (!confirmedAt) {
      throw new DomainValidationError("confirmedAt is required when CONFIRMED");
    }
  } else if (confirmedAt) {
    throw new DomainValidationError("confirmedAt is only allowed when CONFIRMED");
  }

  if (status === "CANCELLED") {
    if (!cancelledAt) {
      throw new DomainValidationError("cancelledAt is required when CANCELLED");
    }
  } else if (cancelledAt) {
    throw new DomainValidationError("cancelledAt is only allowed when CANCELLED");
  }

  if (status === "EXPIRED") {
    if (!expiredAt) {
      throw new DomainValidationError("expiredAt is required when EXPIRED");
    }
  } else if (expiredAt) {
    throw new DomainValidationError("expiredAt is only allowed when EXPIRED");
  }
}

function copyDate(value: Date): Date {
  return new Date(value.getTime());
}

function commercialFromBooking(booking: Booking): CommercialSnapshotFields {
  return {
    priceSnapshot: booking.priceSnapshot,
    policySnapshot: booking.policySnapshot,
    contactSnapshot: booking.contactSnapshot,
    billingSnapshot: booking.billingSnapshot,
    commercialRevision: booking.commercialRevision,
  };
}

function freezeBooking(booking: Booking): Booking {
  const commercial = cloneCommercialFields(commercialFromBooking(booking));
  return Object.freeze({
    ...booking,
    requestedAt: copyDate(booking.requestedAt),
    confirmedAt: booking.confirmedAt ? copyDate(booking.confirmedAt) : null,
    cancelledAt: booking.cancelledAt ? copyDate(booking.cancelledAt) : null,
    expiredAt: booking.expiredAt ? copyDate(booking.expiredAt) : null,
    createdAt: copyDate(booking.createdAt),
    updatedAt: copyDate(booking.updatedAt),
    guestCustomerSnapshot: booking.guestCustomerSnapshot
      ? Object.freeze({ ...booking.guestCustomerSnapshot })
      : null,
    priceSnapshot: commercial.priceSnapshot,
    policySnapshot: commercial.policySnapshot,
    contactSnapshot: commercial.contactSnapshot,
    billingSnapshot: commercial.billingSnapshot,
    commercialRevision: commercial.commercialRevision,
  });
}

/**
 * Allowed transitions (Step 5 subset).
 * DRAFT → PENDING_CONFIRMATION | CANCELLED | EXPIRED
 * PENDING_CONFIRMATION → CONFIRMED | CANCELLED | EXPIRED
 * CONFIRMED → CANCELLED
 */
const ALLOWED_TRANSITIONS: Readonly<
  Record<BookingStatus, readonly BookingStatus[]>
> = {
  DRAFT: ["PENDING_CONFIRMATION", "CANCELLED", "EXPIRED"],
  PENDING_CONFIRMATION: ["CONFIRMED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
  EXPIRED: [],
};

function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (isTerminalBookingStatus(from)) {
    throw new InvalidBookingStateTransitionError();
  }
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new InvalidBookingStateTransitionError();
  }
}

export function createBooking(input: CreateBookingInput): Booking {
  const id = asBookingId(input.id);
  const tenantId = assertNonEmptyId(input.tenantId, "tenantId") as TenantId;
  const organizationId = assertNonEmptyId(
    input.organizationId,
    "organizationId"
  ) as OrganizationId;
  const bookedByActorId = assertNonEmptyId(
    input.bookedByActorId,
    "bookedByActorId"
  ) as ActorId;
  const bookingNumber = asBookingNumber(String(input.bookingNumber));

  if (!isBookingSource(input.source)) {
    throw new DomainValidationError("Invalid BookingSource");
  }

  const customerId =
    input.customerId === undefined || input.customerId === null
      ? null
      : asCustomerId(String(input.customerId));

  const guestCustomerSnapshot =
    input.guestCustomerSnapshot === undefined ||
    input.guestCustomerSnapshot === null
      ? null
      : createGuestCustomerSnapshot(input.guestCustomerSnapshot);

  assertCustomerPresence(customerId, guestCustomerSnapshot);

  const now = input.createdAt ?? new Date();
  const requestedAt = input.requestedAt ?? now;
  const updatedAt = input.updatedAt ?? now;
  assertTimestamps(now, updatedAt, requestedAt);

  const status: BookingStatus = "DRAFT";
  assertStatusTimestamps(status, null, null, null);

  if (input.version !== undefined && input.version !== 0) {
    throw new DomainValidationError("New Booking version must be 0");
  }

  const empty = emptyCommercialSnapshotFields();
  assertCommercialSnapshotInvariants(status, empty);

  return freezeBooking({
    id,
    tenantId,
    organizationId,
    bookingNumber,
    bookedByActorId,
    customerId,
    guestCustomerSnapshot,
    source: input.source,
    status,
    requestedAt,
    confirmedAt: null,
    cancelledAt: null,
    expiredAt: null,
    createdAt: now,
    updatedAt,
    version: 0,
    ...empty,
  });
}

export function rehydrateBooking(input: RehydrateBookingInput): Booking {
  const id = asBookingId(String(input.id));
  const tenantId = assertNonEmptyId(input.tenantId, "tenantId") as TenantId;
  const organizationId = assertNonEmptyId(
    input.organizationId,
    "organizationId"
  ) as OrganizationId;
  const bookedByActorId = assertNonEmptyId(
    input.bookedByActorId,
    "bookedByActorId"
  ) as ActorId;
  const bookingNumber = asBookingNumber(String(input.bookingNumber));

  if (!isBookingSource(String(input.source))) {
    throw new DomainValidationError("Invalid BookingSource");
  }
  if (!isBookingStatus(String(input.status))) {
    throw new DomainValidationError("Invalid BookingStatus");
  }

  const customerId =
    input.customerId === undefined || input.customerId === null
      ? null
      : asCustomerId(String(input.customerId));

  const guestCustomerSnapshot =
    input.guestCustomerSnapshot === undefined ||
    input.guestCustomerSnapshot === null
      ? null
      : createGuestCustomerSnapshot(input.guestCustomerSnapshot);

  assertCustomerPresence(customerId, guestCustomerSnapshot);
  assertTimestamps(input.createdAt, input.updatedAt, input.requestedAt);

  const status = input.status as BookingStatus;
  const confirmedAt = input.confirmedAt ?? null;
  const cancelledAt = input.cancelledAt ?? null;
  const expiredAt = input.expiredAt ?? null;
  assertStatusTimestamps(status, confirmedAt, cancelledAt, expiredAt);

  const commercial: CommercialSnapshotFields = {
    priceSnapshot: input.priceSnapshot ?? null,
    policySnapshot: input.policySnapshot ?? null,
    contactSnapshot: input.contactSnapshot ?? null,
    billingSnapshot: input.billingSnapshot ?? null,
    commercialRevision: input.commercialRevision ?? 0,
  };
  assertCommercialSnapshotInvariants(status, commercial);

  return freezeBooking({
    id,
    tenantId,
    organizationId,
    bookingNumber,
    bookedByActorId,
    customerId,
    guestCustomerSnapshot,
    source: input.source as BookingSource,
    status,
    requestedAt: copyDate(input.requestedAt),
    confirmedAt: confirmedAt ? copyDate(confirmedAt) : null,
    cancelledAt: cancelledAt ? copyDate(cancelledAt) : null,
    expiredAt: expiredAt ? copyDate(expiredAt) : null,
    createdAt: copyDate(input.createdAt),
    updatedAt: copyDate(input.updatedAt),
    version: assertVersion(input.version),
    ...cloneCommercialFields(commercial),
  });
}

function transition(
  booking: Booking,
  to: BookingStatus,
  at: Date,
  timestamps: {
    confirmedAt?: Date | null;
    cancelledAt?: Date | null;
    expiredAt?: Date | null;
  },
  commercial: CommercialSnapshotFields
): Booking {
  assertTransition(booking.status, to);
  const updatedAt = at;
  if (booking.createdAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }

  assertCommercialSnapshotInvariants(to, commercial);

  const next = freezeBooking({
    ...booking,
    status: to,
    confirmedAt:
      timestamps.confirmedAt !== undefined
        ? timestamps.confirmedAt
        : booking.confirmedAt,
    cancelledAt:
      timestamps.cancelledAt !== undefined
        ? timestamps.cancelledAt
        : booking.cancelledAt,
    expiredAt:
      timestamps.expiredAt !== undefined
        ? timestamps.expiredAt
        : booking.expiredAt,
    updatedAt,
    version: assertVersion(booking.version + 1),
    ...cloneCommercialFields(commercial),
  });

  assertStatusTimestamps(
    next.status,
    next.confirmedAt,
    next.cancelledAt,
    next.expiredAt
  );
  return next;
}

export function requestBookingConfirmation(
  booking: Booking,
  at: Date = new Date()
): Booking {
  return transition(
    booking,
    "PENDING_CONFIRMATION",
    at,
    {},
    commercialFromBooking(booking)
  );
}

/**
 * PENDING_CONFIRMATION → CONFIRMED.
 * Requires all four commercial snapshots; freezes them; version +1 once.
 */
export function confirmBooking(
  booking: Booking,
  commercial: CommercialSnapshotsInput,
  at: Date = new Date()
): Booking {
  if (booking.status !== "PENDING_CONFIRMATION") {
    throw new InvalidBookingStateTransitionError();
  }
  if (
    booking.priceSnapshot ||
    booking.policySnapshot ||
    booking.contactSnapshot ||
    booking.billingSnapshot ||
    booking.commercialRevision !== 0
  ) {
    throw new CommercialSnapshotImmutableError();
  }

  let snapshots;
  try {
    snapshots = createCommercialSnapshots(commercial);
  } catch (error) {
    if (error instanceof DomainValidationError) {
      throw error;
    }
    throw new MissingCommercialSnapshotError();
  }

  if (
    !snapshots.priceSnapshot ||
    !snapshots.policySnapshot ||
    !snapshots.contactSnapshot ||
    !snapshots.billingSnapshot
  ) {
    throw new MissingCommercialSnapshotError();
  }

  return transition(
    booking,
    "CONFIRMED",
    at,
    {
      confirmedAt: at,
      cancelledAt: null,
      expiredAt: null,
    },
    commercialFieldsFromBundle(snapshots, 1)
  );
}

export function cancelBooking(
  booking: Booking,
  at: Date = new Date()
): Booking {
  // Preserve commercial snapshots if already confirmed (append-only history readiness).
  return transition(
    booking,
    "CANCELLED",
    at,
    {
      cancelledAt: at,
      confirmedAt: null,
      expiredAt: null,
    },
    commercialFromBooking(booking)
  );
}

export function expireBooking(
  booking: Booking,
  at: Date = new Date()
): Booking {
  return transition(
    booking,
    "EXPIRED",
    at,
    {
      expiredAt: at,
      confirmedAt: null,
      cancelledAt: null,
    },
    commercialFromBooking(booking)
  );
}

/** Source is immutable after create — any change attempt is rejected. */
export function assertBookingSourceUnchanged(
  booking: Booking,
  source: BookingSource
): void {
  if (booking.source !== source) {
    throw new DomainValidationError("BookingSource is immutable");
  }
}

/**
 * Commercial snapshots cannot be replaced on a confirmed (or post-confirm) Booking.
 * Future changes require append-only BookingRevision (not implemented in Step 6).
 */
export function replaceBookingCommercialSnapshots(
  booking: Booking,
  commercial: CommercialSnapshotsInput
): Booking {
  void commercial;
  if (
    booking.commercialRevision >= 1 ||
    booking.status === "CONFIRMED" ||
    (booking.status === "CANCELLED" && booking.priceSnapshot !== null)
  ) {
    throw new CommercialSnapshotImmutableError();
  }
  throw new DomainValidationError(
    "Commercial snapshots can only be set during confirmation"
  );
}
