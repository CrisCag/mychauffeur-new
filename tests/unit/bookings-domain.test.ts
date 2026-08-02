import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import {
  asBookingId,
  asBookingNumber,
  asCustomerId,
  assertBookingSourceUnchanged,
  BOOKING_SOURCES,
  cancelBooking,
  confirmBooking,
  createBooking,
  createBookingNumberFromToken,
  DomainValidationError,
  expireBooking,
  InvalidBookingIdError,
  InvalidBookingNumberError,
  InvalidBookingStateTransitionError,
  MissingBookingCustomerError,
  rehydrateBooking,
  requestBookingConfirmation,
} from "@/lib/modules/bookings";

function ids() {
  return {
    id: asBookingId(randomUUID()),
    tenantId: asTenantId(randomUUID()),
    organizationId: asOrganizationId(randomUUID()),
    bookedByActorId: asActorId(randomUUID()),
    bookingNumber: createBookingNumberFromToken(randomUUID()),
  };
}

describe("bookings domain — Step 5", () => {
  it("creates a Booking with customerId in DRAFT at version 0", () => {
    const base = ids();
    const booking = createBooking({
      ...base,
      customerId: asCustomerId(randomUUID()),
      source: "B2C_WEB",
    });

    expect(booking.status).toBe("DRAFT");
    expect(booking.source).toBe("B2C_WEB");
    expect(booking.version).toBe(0);
    expect(booking.confirmedAt).toBeNull();
    expect(booking.customerId).toBeTruthy();
    expect(booking.guestCustomerSnapshot).toBeNull();
    expect(booking.createdAt.getTime()).toBeLessThanOrEqual(
      booking.updatedAt.getTime()
    );
  });

  it("creates a Guest Booking with normalized email", () => {
    const base = ids();
    const booking = createBooking({
      ...base,
      guestCustomerSnapshot: {
        displayName: " Guest User ",
        email: "Guest.User@Example.COM",
      },
      source: "B2C_APP",
    });

    expect(booking.customerId).toBeNull();
    expect(booking.guestCustomerSnapshot?.email).toBe("guest.user@example.com");
    expect(booking.guestCustomerSnapshot?.displayName).toBe("Guest User");
  });

  it("rejects Booking without customerId and guest snapshot", () => {
    const base = ids();
    expect(() =>
      createBooking({
        ...base,
        source: "API",
      })
    ).toThrow(MissingBookingCustomerError);
  });

  it("rejects empty BookingId and invalid BookingSource", () => {
    expect(() => asBookingId("   ")).toThrow(InvalidBookingIdError);
    const base = ids();
    expect(() =>
      createBooking({
        ...base,
        customerId: asCustomerId(randomUUID()),
        // @ts-expect-error intentional invalid source
        source: "UNKNOWN_CHANNEL",
      })
    ).toThrow(DomainValidationError);
  });

  it("accepts exactly the 11 BookingSource catalog values", () => {
    expect(BOOKING_SOURCES).toHaveLength(11);
    for (const source of BOOKING_SOURCES) {
      const booking = createBooking({
        ...ids(),
        customerId: asCustomerId(randomUUID()),
        source,
      });
      expect(booking.source).toBe(source);
    }
  });

  it("treats BookingSource as immutable after create", () => {
    const booking = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "HOTEL_PORTAL",
    });
    expect(() =>
      assertBookingSourceUnchanged(booking, "AGENCY_PORTAL")
    ).toThrow(DomainValidationError);
    expect(() =>
      assertBookingSourceUnchanged(booking, "HOTEL_PORTAL")
    ).not.toThrow();
  });

  it("normalizes BookingNumber and rejects sequential-looking invalid forms", () => {
    expect(asBookingNumber(" bk-abcdef12 ")).toBe("BK-ABCDEF12");
    expect(() => asBookingNumber("1")).toThrow(InvalidBookingNumberError);
    expect(() => asBookingNumber("BK-1")).toThrow(InvalidBookingNumberError);
  });

  it("rejects non-zero version on create; rehydrate preserves version", () => {
    expect(() =>
      createBooking({
        ...ids(),
        customerId: asCustomerId(randomUUID()),
        source: "B2C_WEB",
        version: 2,
      })
    ).toThrow(DomainValidationError);

    const created = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "B2C_WEB",
      version: 0,
    });
    const pending = requestBookingConfirmation(created);
    const rehydrated = rehydrateBooking({
      ...pending,
      version: pending.version,
    });
    expect(rehydrated.version).toBe(1);
    expect(rehydrated.status).toBe("PENDING_CONFIRMATION");
  });

  it("transitions DRAFT → PENDING_CONFIRMATION → CONFIRMED", () => {
    let booking = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "CORPORATE_PORTAL",
    });
    expect(booking.status).toBe("DRAFT");

    booking = requestBookingConfirmation(booking);
    expect(booking.status).toBe("PENDING_CONFIRMATION");
    expect(booking.version).toBe(1);

    booking = confirmBooking(booking);
    expect(booking.status).toBe("CONFIRMED");
    expect(booking.confirmedAt).toBeInstanceOf(Date);
    expect(booking.version).toBe(2);
  });

  it("allows cancellation from DRAFT, PENDING_CONFIRMATION, and CONFIRMED", () => {
    const draft = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "SUPPORT_CREATED",
    });
    const cancelledDraft = cancelBooking(draft);
    expect(cancelledDraft.status).toBe("CANCELLED");
    expect(cancelledDraft.cancelledAt).toBeInstanceOf(Date);

    let pending = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "B2B_PORTAL",
    });
    pending = requestBookingConfirmation(pending);
    expect(cancelBooking(pending).status).toBe("CANCELLED");

    let confirmed = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "OWNER_CREATED",
    });
    confirmed = requestBookingConfirmation(confirmed);
    confirmed = confirmBooking(confirmed);
    const cancelledConfirmed = cancelBooking(confirmed);
    expect(cancelledConfirmed.status).toBe("CANCELLED");
    expect(cancelledConfirmed.confirmedAt).toBeNull();
  });

  it("allows expiration from DRAFT and PENDING_CONFIRMATION", () => {
    const draft = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "IMPORTED",
    });
    expect(expireBooking(draft).status).toBe("EXPIRED");

    let pending = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "PARTNER_REFERRAL",
    });
    pending = requestBookingConfirmation(pending);
    const expired = expireBooking(pending);
    expect(expired.status).toBe("EXPIRED");
    expect(expired.expiredAt).toBeInstanceOf(Date);
  });

  it("rejects illegal transitions including same-state and reverse paths", () => {
    const draft = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "B2B_PORTAL",
    });
    expect(() => confirmBooking(draft)).toThrow(
      InvalidBookingStateTransitionError
    );

    const pending = requestBookingConfirmation(draft);
    // PENDING_CONFIRMATION → DRAFT is not exposed; confirm then try cancel→confirm
    const confirmed = confirmBooking(pending);
    expect(() => requestBookingConfirmation(confirmed)).toThrow(
      InvalidBookingStateTransitionError
    );
    expect(() => expireBooking(confirmed)).toThrow(
      InvalidBookingStateTransitionError
    );

    const cancelled = cancelBooking(draft);
    expect(() => requestBookingConfirmation(cancelled)).toThrow(
      InvalidBookingStateTransitionError
    );
    expect(() => confirmBooking(cancelled)).toThrow(
      InvalidBookingStateTransitionError
    );
    expect(() => expireBooking(cancelled)).toThrow(
      InvalidBookingStateTransitionError
    );
    expect(() => cancelBooking(cancelled)).toThrow(
      InvalidBookingStateTransitionError
    );

    const expired = expireBooking(
      createBooking({
        ...ids(),
        customerId: asCustomerId(randomUUID()),
        source: "API",
      })
    );
    expect(() => confirmBooking(expired)).toThrow(
      InvalidBookingStateTransitionError
    );
    expect(() => requestBookingConfirmation(expired)).toThrow(
      InvalidBookingStateTransitionError
    );
  });

  it("does not mutate the previous Aggregate instance on transition", () => {
    const draft = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "B2C_WEB",
    });
    const originalStatus = draft.status;
    const originalVersion = draft.version;
    const originalUpdatedAt = draft.updatedAt.getTime();

    const pending = requestBookingConfirmation(
      draft,
      new Date("2026-08-02T12:00:00.000Z")
    );

    expect(draft.status).toBe(originalStatus);
    expect(draft.version).toBe(originalVersion);
    expect(draft.updatedAt.getTime()).toBe(originalUpdatedAt);
    expect(pending.status).toBe("PENDING_CONFIRMATION");
    expect(pending.version).toBe(1);
    expect(pending).not.toBe(draft);
  });

  it("protects nested guest snapshot and does not share Date references across instances", () => {
    const createdAt = new Date("2026-08-02T10:00:00.000Z");
    const booking = createBooking({
      ...ids(),
      guestCustomerSnapshot: {
        displayName: "Guest",
        email: "guest@example.com",
      },
      source: "B2C_APP",
      createdAt,
      requestedAt: createdAt,
      updatedAt: createdAt,
    });

    expect(() => {
      // @ts-expect-error intentional mutation attempt
      booking.status = "CONFIRMED";
    }).toThrow();

    expect(() => {
      // @ts-expect-error intentional nested mutation
      booking.guestCustomerSnapshot.email = "mutated@example.com";
    }).toThrow();

    const pending = requestBookingConfirmation(
      booking,
      new Date("2026-08-02T11:00:00.000Z")
    );
    expect(pending.requestedAt).not.toBe(booking.requestedAt);
    expect(pending.createdAt).not.toBe(booking.createdAt);
    expect(pending.guestCustomerSnapshot).not.toBe(
      booking.guestCustomerSnapshot
    );

    pending.requestedAt.setTime(0);
    expect(booking.requestedAt.getTime()).toBe(createdAt.getTime());
    expect(pending.guestCustomerSnapshot?.email).toBe("guest@example.com");
  });

  it("keeps timestamps coherent across transitions", () => {
    const createdAt = new Date("2026-08-02T10:00:00.000Z");
    let booking = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "B2C_WEB",
      createdAt,
      requestedAt: createdAt,
      updatedAt: createdAt,
    });
    const later = new Date("2026-08-02T11:00:00.000Z");
    booking = requestBookingConfirmation(booking, later);
    expect(booking.createdAt.getTime()).toBeLessThanOrEqual(
      booking.updatedAt.getTime()
    );
    expect(booking.updatedAt.toISOString()).toBe(later.toISOString());
  });
});
