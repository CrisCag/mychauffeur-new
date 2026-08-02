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
  CommercialSnapshotImmutableError,
  confirmBooking,
  createBillingSnapshot,
  createBooking,
  createBookingNumberFromToken,
  createContactSnapshot,
  createPolicySnapshot,
  createPriceSnapshot,
  DomainValidationError,
  expireBooking,
  InvalidBookingIdError,
  InvalidBookingNumberError,
  InvalidBookingStateTransitionError,
  MissingBookingCustomerError,
  MissingCommercialSnapshotError,
  rehydrateBooking,
  replaceBookingCommercialSnapshots,
  requestBookingConfirmation,
  serializePriceSnapshot,
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

export function sampleCommercialInput() {
  return {
    priceSnapshot: {
      currency: "eur",
      pricingVersion: " pv-1 ",
      baseAmountMinor: 10000,
      taxAmountMinor: 0,
      vatAmountMinor: 2200,
      supplementsAmountMinor: 500,
      discountsAmountMinor: 200,
      totalCustomerAmountMinor: 12500,
    },
    policySnapshot: {
      cancellationPolicyCode: " cancel.std ",
      waitingPolicyCode: "wait.15",
      noShowPolicyCode: "noshow.std",
      modificationPolicyCode: "mod.std",
      paymentTermsCode: "prepaid",
      refundReadiness: "policy_ref",
      nightSupplementApplicable: true,
      holidaySupplementApplicable: false,
    },
    contactSnapshot: {
      bookerDisplayName: " Booker Name ",
      bookerEmail: "Booker@Example.COM",
      primaryPassengerDisplayName: "Passenger",
    },
    billingSnapshot: {
      billingPartyType: "individual",
      billingPartyName: " Booker Name ",
      billingCountryCode: "it",
      taxId: "it123",
      billingCity: "Roma",
      billingPostalCode: "00100",
    },
  };
}

function pendingBooking() {
  const draft = createBooking({
    ...ids(),
    customerId: asCustomerId(randomUUID()),
    source: "B2C_WEB",
  });
  return requestBookingConfirmation(draft);
}

describe("bookings domain — Step 5", () => {
  it("creates a Booking with customerId in DRAFT at version 0 without commercial snapshots", () => {
    const booking = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "B2C_WEB",
    });

    expect(booking.status).toBe("DRAFT");
    expect(booking.version).toBe(0);
    expect(booking.priceSnapshot).toBeNull();
    expect(booking.policySnapshot).toBeNull();
    expect(booking.contactSnapshot).toBeNull();
    expect(booking.billingSnapshot).toBeNull();
    expect(booking.commercialRevision).toBe(0);
  });

  it("creates a Guest Booking with normalized email", () => {
    const booking = createBooking({
      ...ids(),
      guestCustomerSnapshot: {
        displayName: " Guest User ",
        email: "Guest.User@Example.COM",
      },
      source: "B2C_APP",
    });

    expect(booking.customerId).toBeNull();
    expect(booking.guestCustomerSnapshot?.email).toBe("guest.user@example.com");
  });

  it("rejects Booking without customerId and guest snapshot", () => {
    expect(() =>
      createBooking({
        ...ids(),
        source: "API",
      })
    ).toThrow(MissingBookingCustomerError);
  });

  it("rejects empty BookingId and invalid BookingSource", () => {
    expect(() => asBookingId("   ")).toThrow(InvalidBookingIdError);
    expect(() =>
      createBooking({
        ...ids(),
        customerId: asCustomerId(randomUUID()),
        // @ts-expect-error intentional invalid source
        source: "UNKNOWN_CHANNEL",
      })
    ).toThrow(DomainValidationError);
  });

  it("accepts exactly the 11 BookingSource catalog values", () => {
    expect(BOOKING_SOURCES).toHaveLength(11);
    for (const source of BOOKING_SOURCES) {
      expect(
        createBooking({
          ...ids(),
          customerId: asCustomerId(randomUUID()),
          source,
        }).source
      ).toBe(source);
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
  });

  it("normalizes BookingNumber and rejects sequential-looking invalid forms", () => {
    expect(asBookingNumber(" bk-abcdef12 ")).toBe("BK-ABCDEF12");
    expect(() => asBookingNumber("1")).toThrow(InvalidBookingNumberError);
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
    });
    const pending = requestBookingConfirmation(created);
    const rehydrated = rehydrateBooking({ ...pending, version: pending.version });
    expect(rehydrated.version).toBe(1);
  });

  it("transitions DRAFT → PENDING_CONFIRMATION → CONFIRMED with snapshots", () => {
    let booking = pendingBooking();
    expect(booking.status).toBe("PENDING_CONFIRMATION");
    expect(booking.version).toBe(1);

    booking = confirmBooking(booking, sampleCommercialInput());
    expect(booking.status).toBe("CONFIRMED");
    expect(booking.confirmedAt).toBeInstanceOf(Date);
    expect(booking.version).toBe(2);
    expect(booking.commercialRevision).toBe(1);
    expect(booking.priceSnapshot?.currency).toBe("EUR");
    expect(booking.priceSnapshot?.totalCustomerAmountMinor).toBe(12500);
  });

  it("allows cancellation from DRAFT, PENDING_CONFIRMATION, and CONFIRMED", () => {
    const draft = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "SUPPORT_CREATED",
    });
    expect(cancelBooking(draft).status).toBe("CANCELLED");

    const pending = pendingBooking();
    expect(cancelBooking(pending).priceSnapshot).toBeNull();

    const confirmed = confirmBooking(pendingBooking(), sampleCommercialInput());
    const cancelled = cancelBooking(confirmed);
    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.confirmedAt).toBeNull();
    expect(cancelled.priceSnapshot).not.toBeNull();
    expect(cancelled.policySnapshot).not.toBeNull();
    expect(cancelled.contactSnapshot).not.toBeNull();
    expect(cancelled.billingSnapshot).not.toBeNull();
    expect(cancelled.commercialRevision).toBe(1);
  });

  it("allows expiration from DRAFT and PENDING_CONFIRMATION", () => {
    const draft = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "IMPORTED",
    });
    expect(expireBooking(draft).status).toBe("EXPIRED");
    expect(expireBooking(pendingBooking()).status).toBe("EXPIRED");
  });

  it("rejects illegal transitions including same-state and reverse paths", () => {
    const draft = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "B2B_PORTAL",
    });
    expect(() =>
      confirmBooking(draft, sampleCommercialInput())
    ).toThrow(InvalidBookingStateTransitionError);

    const confirmed = confirmBooking(pendingBooking(), sampleCommercialInput());
    expect(() => requestBookingConfirmation(confirmed)).toThrow(
      InvalidBookingStateTransitionError
    );
    expect(() => expireBooking(confirmed)).toThrow(
      InvalidBookingStateTransitionError
    );

    const cancelled = cancelBooking(draft);
    expect(() => cancelBooking(cancelled)).toThrow(
      InvalidBookingStateTransitionError
    );
  });

  it("does not mutate the previous Aggregate instance on transition", () => {
    const draft = createBooking({
      ...ids(),
      customerId: asCustomerId(randomUUID()),
      source: "B2C_WEB",
    });
    const pending = requestBookingConfirmation(
      draft,
      new Date("2026-08-02T12:00:00.000Z")
    );
    expect(draft.status).toBe("DRAFT");
    expect(draft.version).toBe(0);
    expect(pending.status).toBe("PENDING_CONFIRMATION");
  });

  it("protects nested guest snapshot and does not share Date references", () => {
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
    const pending = requestBookingConfirmation(
      booking,
      new Date("2026-08-02T11:00:00.000Z")
    );
    expect(pending.requestedAt).not.toBe(booking.requestedAt);
    pending.requestedAt.setTime(0);
    expect(booking.requestedAt.getTime()).toBe(createdAt.getTime());
  });
});

describe("commercial snapshots — Step 6", () => {
  it("validates and normalizes PriceSnapshot", () => {
    const price = createPriceSnapshot(sampleCommercialInput().priceSnapshot);
    expect(price.currency).toBe("EUR");
    expect(price.pricingVersion).toBe("pv-1");
    expect(() =>
      createPriceSnapshot({
        ...sampleCommercialInput().priceSnapshot,
        totalCustomerAmountMinor: 1,
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      createPriceSnapshot({
        ...sampleCommercialInput().priceSnapshot,
        currency: "EURO",
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      createPriceSnapshot({
        ...sampleCommercialInput().priceSnapshot,
        baseAmountMinor: Number.NaN,
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      createPriceSnapshot({
        ...sampleCommercialInput().priceSnapshot,
        baseAmountMinor: Number.POSITIVE_INFINITY,
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      createPriceSnapshot({
        ...sampleCommercialInput().priceSnapshot,
        baseAmountMinor: 10.5,
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      createPriceSnapshot({
        ...sampleCommercialInput().priceSnapshot,
        discountsAmountMinor: 999999,
        totalCustomerAmountMinor: 0,
      })
    ).toThrow(DomainValidationError);
    const serialized = serializePriceSnapshot(price);
    expect(serialized.currency).toBe("EUR");
    expect(() => {
      // @ts-expect-error intentional mutation of serializer output
      serialized.currency = "USD";
    }).toThrow();
    expect(price.currency).toBe("EUR");
  });

  it("validates and normalizes PolicySnapshot", () => {
    const policy = createPolicySnapshot(sampleCommercialInput().policySnapshot);
    expect(policy.cancellationPolicyCode).toBe("CANCEL.STD");
    expect(policy.refundReadiness).toBe("POLICY_REF");
    expect(() =>
      createPolicySnapshot({
        ...sampleCommercialInput().policySnapshot,
        refundReadiness: "UNKNOWN",
      })
    ).toThrow(DomainValidationError);
  });

  it("validates and normalizes ContactSnapshot", () => {
    const contact = createContactSnapshot({
      ...sampleCommercialInput().contactSnapshot,
      bookerPhone: " +39  333  1234567 ",
    });
    expect(contact.bookerEmail).toBe("booker@example.com");
    expect(contact.bookerDisplayName).toBe("Booker Name");
    expect(contact.bookerPhone).toBe("+39 333 1234567");
    expect(() => createContactSnapshot({})).toThrow(DomainValidationError);
    expect(() =>
      createContactSnapshot({ bookerPhone: "not-a-phone" })
    ).toThrow(DomainValidationError);
  });

  it("validates and normalizes BillingSnapshot without payment secrets", () => {
    const billing = createBillingSnapshot(
      sampleCommercialInput().billingSnapshot
    );
    expect(billing.billingPartyType).toBe("INDIVIDUAL");
    expect(billing.billingCountryCode).toBe("IT");
    expect(billing.taxId).toBe("IT123");
    expect(() =>
      createBillingSnapshot({
        ...sampleCommercialInput().billingSnapshot,
        billingCountryCode: "ITA",
      })
    ).toThrow(DomainValidationError);
  });

  it("rejects confirmation without snapshots or with partial snapshots", () => {
    const pending = pendingBooking();
    expect(() =>
      // @ts-expect-error missing commercial argument
      confirmBooking(pending)
    ).toThrow();

    expect(() =>
      confirmBooking(pending, {
        ...sampleCommercialInput(),
        // @ts-expect-error partial
        billingSnapshot: null,
      })
    ).toThrow();
  });

  it("confirms with all snapshots, increments version exactly once, freezes deeply", () => {
    const pending = pendingBooking();
    const input = sampleCommercialInput();
    const confirmed = confirmBooking(pending, input, new Date("2026-08-02T15:00:00.000Z"));

    expect(confirmed.version).toBe(pending.version + 1);
    expect(confirmed.status).toBe("CONFIRMED");
    expect(confirmed.priceSnapshot).not.toBeNull();
    expect(() => {
      // @ts-expect-error intentional mutation
      confirmed.priceSnapshot.currency = "USD";
    }).toThrow();
    expect(() => {
      // @ts-expect-error intentional mutation
      confirmed.contactSnapshot.bookerEmail = "x@y.com";
    }).toThrow();

    input.priceSnapshot.currency = "USD";
    input.contactSnapshot.bookerEmail = "mutated@example.com";
    expect(confirmed.priceSnapshot?.currency).toBe("EUR");
    expect(confirmed.contactSnapshot?.bookerEmail).toBe("booker@example.com");
  });

  it("rejects rehydrate of non-confirmed Booking with snapshots and confirmed without", () => {
    const pending = pendingBooking();
    expect(() =>
      rehydrateBooking({
        ...pending,
        priceSnapshot: createPriceSnapshot(sampleCommercialInput().priceSnapshot),
        policySnapshot: createPolicySnapshot(sampleCommercialInput().policySnapshot),
        contactSnapshot: createContactSnapshot(
          sampleCommercialInput().contactSnapshot
        ),
        billingSnapshot: createBillingSnapshot(
          sampleCommercialInput().billingSnapshot
        ),
        commercialRevision: 1,
      })
    ).toThrow(DomainValidationError);

    const confirmed = confirmBooking(pending, sampleCommercialInput());
    expect(() =>
      rehydrateBooking({
        ...confirmed,
        priceSnapshot: null,
        policySnapshot: null,
        contactSnapshot: null,
        billingSnapshot: null,
        commercialRevision: 0,
      })
    ).toThrow(MissingCommercialSnapshotError);

    expect(() =>
      rehydrateBooking({
        ...confirmed,
        billingSnapshot: null,
      })
    ).toThrow(MissingCommercialSnapshotError);
  });

  it("rehydrate preserves version and commercial freeze; cancel keeps snapshots", () => {
    const confirmed = confirmBooking(pendingBooking(), sampleCommercialInput());
    const versionBefore = confirmed.version;
    const again = rehydrateBooking({ ...confirmed });
    expect(again.version).toBe(versionBefore);
    expect(again.priceSnapshot).toEqual(confirmed.priceSnapshot);

    const cancelled = cancelBooking(confirmed);
    expect(cancelled.version).toBe(versionBefore + 1);
    expect(cancelled.priceSnapshot).toEqual(confirmed.priceSnapshot);
  });

  it("rejects replacing commercial snapshots on confirmed Booking", () => {
    const confirmed = confirmBooking(pendingBooking(), sampleCommercialInput());
    expect(() =>
      replaceBookingCommercialSnapshots(confirmed, sampleCommercialInput())
    ).toThrow(CommercialSnapshotImmutableError);
  });

  it("does not share commercial snapshot references across confirm and rehydrate", () => {
    const confirmed = confirmBooking(pendingBooking(), sampleCommercialInput());
    const again = rehydrateBooking({
      ...confirmed,
      priceSnapshot: confirmed.priceSnapshot
        ? { ...confirmed.priceSnapshot }
        : null,
      policySnapshot: confirmed.policySnapshot
        ? { ...confirmed.policySnapshot }
        : null,
      contactSnapshot: confirmed.contactSnapshot
        ? { ...confirmed.contactSnapshot }
        : null,
      billingSnapshot: confirmed.billingSnapshot
        ? { ...confirmed.billingSnapshot }
        : null,
    });
    expect(again.priceSnapshot).not.toBe(confirmed.priceSnapshot);
    expect(again.contactSnapshot).not.toBe(confirmed.contactSnapshot);
  });

  it("keeps prior instance snapshots stable after cancel and rejects revision != 1 on rehydrate", () => {
    const confirmed = confirmBooking(pendingBooking(), sampleCommercialInput());
    const priceBefore = confirmed.priceSnapshot;
    const cancelled = cancelBooking(confirmed);
    expect(confirmed.status).toBe("CONFIRMED");
    expect(confirmed.priceSnapshot).toBe(priceBefore);
    expect(cancelled.priceSnapshot).not.toBe(priceBefore);
    expect(cancelled.priceSnapshot).toEqual(priceBefore);

    expect(() =>
      rehydrateBooking({
        ...confirmed,
        commercialRevision: 2,
      })
    ).toThrow(DomainValidationError);
  });

  it("rehydrate from a later-mutated plain object stays isolated", () => {
    const confirmed = confirmBooking(pendingBooking(), sampleCommercialInput());
    const plain = {
      ...confirmed.priceSnapshot!,
    };
    const rehydrated = rehydrateBooking({
      ...confirmed,
      priceSnapshot: plain,
      policySnapshot: { ...confirmed.policySnapshot! },
      contactSnapshot: { ...confirmed.contactSnapshot! },
      billingSnapshot: { ...confirmed.billingSnapshot! },
    });
    plain.currency = "USD";
    expect(rehydrated.priceSnapshot?.currency).toBe("EUR");
  });
});
