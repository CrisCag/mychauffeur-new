import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import {
  anonymizeCustomer,
  asCustomerEmailAddress,
  asCustomerNumber,
  asCustomerPhoneNumber,
  asIdentitySubjectId,
  asIndividualCustomerName,
  createCustomerNumberFromToken,
  createIndividualCustomer,
  createOrganizationCustomer,
  CustomerIdentityLinkConflictError,
  deactivateCustomer,
  DomainValidationError,
  InvalidCustomerStateTransitionError,
  linkCustomerIdentity,
  reactivateCustomer,
  rehydrateCustomer,
  unlinkCustomerIdentity,
  updateCustomerProfile,
} from "@/lib/modules/customers";
import {
  asQuoteId,
  createQuote,
  createQuoteNumberFromToken,
  issueQuote,
} from "@/lib/modules/quotes";
import {
  asBookingId,
  asCustomerId as asBookingCustomerId,
  createBooking,
  createBookingNumberFromToken,
} from "@/lib/modules/bookings";
import { sampleProposals } from "./quotes-test-fixtures";

function ids() {
  return {
    id: randomUUID(),
    tenantId: asTenantId(randomUUID()),
    organizationId: asOrganizationId(randomUUID()),
    customerNumber: createCustomerNumberFromToken(randomUUID()),
  };
}

function individual(overrides?: Partial<Parameters<typeof createIndividualCustomer>[0]>) {
  return createIndividualCustomer({
    ...ids(),
    individualName: "Ada Lovelace",
    createdAt: new Date("2026-08-02T10:00:00.000Z"),
    ...overrides,
  });
}

function organization(overrides?: Partial<Parameters<typeof createOrganizationCustomer>[0]>) {
  return createOrganizationCustomer({
    ...ids(),
    organizationName: "Acme Mobility SpA",
    createdAt: new Date("2026-08-02T10:00:00.000Z"),
    ...overrides,
  });
}

describe("Customer Domain", () => {
  it("creates individual Customer ACTIVE at version 0", () => {
    const { customer, events } = individual({
      email: " Ada@Example.COM ",
      phone: "+39 02 1234567",
    });
    expect(customer.status).toBe("ACTIVE");
    expect(customer.version).toBe(0);
    expect(customer.customerType).toBe("INDIVIDUAL");
    expect(customer.individualName).toBe("Ada Lovelace");
    expect(customer.organizationName).toBeNull();
    expect(customer.email).toBe("ada@example.com");
    expect(customer.phone).toBe("+39 02 1234567");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("Customer.Created");
    expect(JSON.stringify(events[0])).not.toMatch(/ada@example|Ada Lovelace/i);
  });

  it("creates organization Customer with organizationName only", () => {
    const { customer } = organization();
    expect(customer.customerType).toBe("ORGANIZATION");
    expect(customer.organizationName).toBe("Acme Mobility SpA");
    expect(customer.individualName).toBeNull();
  });

  it("rejects invalid type/name combinations on rehydrate", () => {
    const base = individual().customer;
    expect(() =>
      rehydrateCustomer({
        ...base,
        organizationName: "Not Allowed",
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      rehydrateCustomer({
        ...base,
        customerType: "ORGANIZATION",
        individualName: "Ada",
        organizationName: null,
      })
    ).toThrow(DomainValidationError);
  });

  it("validates CustomerNumber and contact limits", () => {
    expect(asCustomerNumber(" cu-abcdef12 ")).toBe("CU-ABCDEF12");
    expect(() => asCustomerNumber("BAD")).toThrow();
    expect(asCustomerEmailAddress("  X@Y.Z  ")).toBe("x@y.z");
    expect(() => asCustomerEmailAddress("not-an-email")).toThrow(
      DomainValidationError
    );
    expect(() => asCustomerPhoneNumber("1")).toThrow(DomainValidationError);
    expect(() => asIndividualCustomerName("")).toThrow(DomainValidationError);
    expect(() => asIndividualCustomerName("a".repeat(201))).toThrow(
      DomainValidationError
    );
  });

  it("updates profile, clears contacts, forbids removing required name", () => {
    const created = individual({ email: "a@b.co" }).customer;
    const updated = updateCustomerProfile(created, {
      individualName: "Ada L.",
      email: null,
      phone: "+1 555 0100",
      at: new Date("2026-08-02T11:00:00.000Z"),
    });
    expect(updated.customer.version).toBe(1);
    expect(updated.customer.email).toBeNull();
    expect(updated.customer.phone).toBe("+1 555 0100");
    expect(updated.events[0].type).toBe("Customer.ProfileUpdated");
    expect(JSON.stringify(updated.events[0])).not.toMatch(/Ada|555/);

    expect(() =>
      updateCustomerProfile(created, {
        individualName: null,
        at: new Date("2026-08-02T11:00:00.000Z"),
      })
    ).toThrow(DomainValidationError);

    const noop = updateCustomerProfile(updated.customer, {
      at: new Date("2026-08-02T12:00:00.000Z"),
    });
    expect(noop.customer).toBe(updated.customer);
    expect(noop.events).toHaveLength(0);
  });

  it("applies profile patch omit/clear/normalized-equal/mixed semantics", () => {
    const created = individual({
      email: "ada@example.com",
      phone: "+39 02 1234567",
    }).customer;

    const omit = updateCustomerProfile(created, {
      at: new Date("2026-08-02T11:00:00.000Z"),
    });
    expect(omit.customer).toBe(created);
    expect(omit.customer.email).toBe("ada@example.com");
    expect(omit.events).toHaveLength(0);

    const equalNormalized = updateCustomerProfile(created, {
      email: "  Ada@Example.COM ",
      phone: "+39 02 1234567",
      individualName: "  Ada Lovelace ",
      at: new Date("2026-08-02T11:00:00.000Z"),
    });
    expect(equalNormalized.customer).toBe(created);
    expect(equalNormalized.events).toHaveLength(0);

    expect(() =>
      updateCustomerProfile(created, {
        email: "   ",
        at: new Date("2026-08-02T11:00:00.000Z"),
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      updateCustomerProfile(created, {
        organizationName: null,
        at: new Date("2026-08-02T11:00:00.000Z"),
      })
    ).toThrow(DomainValidationError);

    const mixed = updateCustomerProfile(created, {
      individualName: "Ada L.",
      email: null,
      phone: "+1 555 9999",
      at: new Date("2026-08-02T11:00:00.000Z"),
    });
    expect(mixed.customer.version).toBe(1);
    expect(mixed.customer.individualName).toBe("Ada L.");
    expect(mixed.customer.email).toBeNull();
    expect(mixed.customer.phone).toBe("+1 555 9999");
    expect(mixed.customer.identityLink).toBeNull();
    expect(mixed.events).toHaveLength(1);
  });

  it("rejects operation timestamps before previous updatedAt", () => {
    const created = individual().customer;
    const updated = updateCustomerProfile(created, {
      individualName: "Ada L.",
      at: new Date("2026-08-02T12:00:00.000Z"),
    }).customer;
    expect(() =>
      updateCustomerProfile(updated, {
        individualName: "Ada",
        at: new Date("2026-08-02T11:00:00.000Z"),
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      deactivateCustomer(updated, new Date("2026-08-02T11:59:00.000Z"))
    ).toThrow(DomainValidationError);
  });

  it("links and unlinks identity with conflict and no-op rules", () => {
    const customer = individual().customer;
    const subject = asIdentitySubjectId("user-subj-001");
    const linked = linkCustomerIdentity(
      customer,
      subject,
      new Date("2026-08-02T11:00:00.000Z")
    );
    expect(linked.customer.identityLink?.identitySubjectId).toBe(subject);
    expect(linked.events[0].type).toBe("Customer.IdentityLinked");

    const same = linkCustomerIdentity(
      linked.customer,
      subject,
      new Date("2026-08-02T11:30:00.000Z")
    );
    expect(same.customer).toBe(linked.customer);
    expect(same.events).toHaveLength(0);

    expect(() =>
      linkCustomerIdentity(
        linked.customer,
        "user-subj-002",
        new Date("2026-08-02T11:45:00.000Z")
      )
    ).toThrow(CustomerIdentityLinkConflictError);

    const unlinked = unlinkCustomerIdentity(
      linked.customer,
      new Date("2026-08-02T12:00:00.000Z")
    );
    expect(unlinked.customer.identityLink).toBeNull();
    const unlinkNoop = unlinkCustomerIdentity(
      unlinked.customer,
      new Date("2026-08-02T12:30:00.000Z")
    );
    expect(unlinkNoop.events).toHaveLength(0);
  });

  it("deactivates, reactivates, and anonymizes irreversibly", () => {
    const active = individual({
      email: "secret@example.com",
      phone: "+39 333 1112222",
    }).customer;
    const linked = linkCustomerIdentity(
      active,
      "user-subj-aaa",
      new Date("2026-08-02T11:00:00.000Z")
    ).customer;

    const inactive = deactivateCustomer(
      linked,
      new Date("2026-08-02T12:00:00.000Z")
    ).customer;
    expect(inactive.status).toBe("INACTIVE");
    expect(inactive.version).toBe(linked.version + 1);

    const deactivateNoop = deactivateCustomer(
      inactive,
      new Date("2026-08-02T12:30:00.000Z")
    );
    expect(deactivateNoop.customer).toBe(inactive);
    expect(deactivateNoop.events).toHaveLength(0);

    const reactivated = reactivateCustomer(
      inactive,
      new Date("2026-08-02T13:00:00.000Z")
    ).customer;
    expect(reactivated.status).toBe("ACTIVE");

    const reactivateNoop = reactivateCustomer(
      reactivated,
      new Date("2026-08-02T13:30:00.000Z")
    );
    expect(reactivateNoop.customer).toBe(reactivated);
    expect(reactivateNoop.events).toHaveLength(0);

    const anonymized = anonymizeCustomer(
      reactivated,
      new Date("2026-08-02T14:00:00.000Z")
    ).customer;
    expect(anonymized.status).toBe("ANONYMIZED");
    expect(anonymized.individualName).toBeNull();
    expect(anonymized.organizationName).toBeNull();
    expect(anonymized.email).toBeNull();
    expect(anonymized.phone).toBeNull();
    expect(anonymized.identityLink).toBeNull();
    expect(anonymized.anonymizedAt?.toISOString()).toBe(
      "2026-08-02T14:00:00.000Z"
    );
    expect(anonymized.customerNumber).toBe(active.customerNumber);
    expect(anonymized.customerType).toBe("INDIVIDUAL");
    expect(JSON.stringify(anonymized)).not.toMatch(/Anonymous|secret@|333/i);

    const anonymizeNoop = anonymizeCustomer(
      anonymized,
      new Date("2026-08-02T15:00:00.000Z")
    );
    expect(anonymizeNoop.customer).toBe(anonymized);
    expect(anonymizeNoop.events).toHaveLength(0);

    expect(() =>
      updateCustomerProfile(anonymized, {
        individualName: "Nope",
        at: new Date("2026-08-02T15:00:00.000Z"),
      })
    ).toThrow(InvalidCustomerStateTransitionError);
    expect(() =>
      linkCustomerIdentity(
        anonymized,
        "user-subj-bbb",
        new Date("2026-08-02T15:00:00.000Z")
      )
    ).toThrow(InvalidCustomerStateTransitionError);
    expect(() =>
      unlinkCustomerIdentity(anonymized, new Date("2026-08-02T15:00:00.000Z"))
    ).toThrow(InvalidCustomerStateTransitionError);
    expect(() =>
      reactivateCustomer(anonymized, new Date("2026-08-02T15:00:00.000Z"))
    ).toThrow(InvalidCustomerStateTransitionError);
    expect(() =>
      deactivateCustomer(anonymized, new Date("2026-08-02T15:00:00.000Z"))
    ).toThrow(InvalidCustomerStateTransitionError);

    const fromInactive = anonymizeCustomer(
      deactivateCustomer(individual().customer, new Date("2026-08-02T12:00:00.000Z"))
        .customer,
      new Date("2026-08-02T14:00:00.000Z")
    ).customer;
    expect(fromInactive.status).toBe("ANONYMIZED");
  });

  it("freezes events and preserves prior instance on failed ops", () => {
    const created = individual().customer;
    const linked = linkCustomerIdentity(
      created,
      "user-subj-ccc",
      new Date("2026-08-02T11:00:00.000Z")
    );
    expect(() => {
      // @ts-expect-error intentional
      linked.events.push(linked.events[0]);
    }).toThrow();
    expect(() => {
      // @ts-expect-error intentional
      linked.events[0].type = "Customer.Anonymized";
    }).toThrow();
    expect(created.identityLink).toBeNull();
    expect(() => {
      // @ts-expect-error intentional
      linked.customer.individualName = "Mutated";
    }).toThrow();
  });

  it("rehydrate preserves version and does not emit events", () => {
    const { customer } = individual();
    const again = rehydrateCustomer({ ...customer });
    expect(again.version).toBe(0);
    expect(again).not.toBe(customer);
  });

  it("does not mutate Quote or Booking snapshots when Customer changes", () => {
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const createdAt = new Date("2026-08-02T10:00:00.000Z");

    const customer = createIndividualCustomer({
      id: randomUUID(),
      tenantId,
      organizationId,
      customerNumber: createCustomerNumberFromToken(randomUUID()),
      individualName: "Guest Holder",
      email: "holder@example.com",
      createdAt,
    }).customer;

    const quote = issueQuote(
      createQuote({
        id: asQuoteId(randomUUID()),
        tenantId,
        organizationId,
        quoteNumber: createQuoteNumberFromToken(randomUUID()),
        mode: "MANUAL",
        createdByActorId: asActorId(randomUUID()),
        guestCustomerSnapshot: {
          displayName: "Snapshot Guest",
          email: "snapshot@example.com",
        },
        createdAt,
      }).quote,
      sampleProposals(),
      new Date("2026-08-02T11:00:00.000Z"),
      new Date("2026-08-02T18:00:00.000Z")
    ).quote;

    const booking = createBooking({
      id: asBookingId(randomUUID()),
      tenantId,
      organizationId,
      bookingNumber: createBookingNumberFromToken(randomUUID()),
      bookedByActorId: asActorId(randomUUID()),
      source: "B2C_WEB",
      guestCustomerSnapshot: {
        displayName: "Booking Guest",
        email: "booking-guest@example.com",
      },
      createdAt,
    });

    const quoteEmail = quote.guestCustomerSnapshot?.email;
    const bookingEmail = booking.guestCustomerSnapshot?.email;

    anonymizeCustomer(customer, new Date("2026-08-02T15:00:00.000Z"));
    updateCustomerProfile(customer, {
      individualName: "Changed",
      email: "changed@example.com",
      at: new Date("2026-08-02T15:00:00.000Z"),
    });

    expect(quote.guestCustomerSnapshot?.email).toBe(quoteEmail);
    expect(booking.guestCustomerSnapshot?.email).toBe(bookingEmail);
    expect(quote.guestCustomerSnapshot?.displayName).toBe("Snapshot Guest");
    expect(booking.guestCustomerSnapshot?.displayName).toBe("Booking Guest");
    // Local Booking CustomerId type remains independent.
    expect(typeof asBookingCustomerId).toBe("function");
  });
});
