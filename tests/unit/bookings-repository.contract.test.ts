import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import type { BookingRepository } from "@/lib/modules/bookings";
import {
  asBookingId,
  asCustomerId,
  BookingVersionConflictError,
  confirmBooking,
  createBooking,
  createBookingNumberFromToken,
  DomainValidationError,
  DuplicateBookingNumberError,
  requestBookingConfirmation,
} from "@/lib/modules/bookings";
import { InMemoryBookingRepository } from "@/lib/modules/bookings/infrastructure";

function sampleCommercialInput() {
  return {
    priceSnapshot: {
      currency: "EUR",
      pricingVersion: "pv-1",
      baseAmountMinor: 10000,
      taxAmountMinor: 0,
      vatAmountMinor: 2200,
      supplementsAmountMinor: 0,
      discountsAmountMinor: 0,
      totalCustomerAmountMinor: 12200,
    },
    policySnapshot: {
      cancellationPolicyCode: "CANCEL.STD",
      waitingPolicyCode: "WAIT.15",
      noShowPolicyCode: "NOSHOW.STD",
      modificationPolicyCode: "MOD.STD",
      paymentTermsCode: "PREPAID",
      refundReadiness: "NONE" as const,
      nightSupplementApplicable: false,
      holidaySupplementApplicable: false,
    },
    contactSnapshot: {
      bookerDisplayName: "Booker",
      bookerEmail: "booker@example.com",
    },
    billingSnapshot: {
      billingPartyType: "INDIVIDUAL",
      billingPartyName: "Booker",
      billingCountryCode: "IT",
    },
  };
}

function buildBooking(input?: {
  id?: ReturnType<typeof asBookingId>;
  tenantId?: ReturnType<typeof asTenantId>;
  organizationId?: ReturnType<typeof asOrganizationId>;
  bookingNumberToken?: string;
  guest?: boolean;
}) {
  const tenantId = input?.tenantId ?? asTenantId(randomUUID());
  const organizationId = input?.organizationId ?? asOrganizationId(randomUUID());
  return createBooking({
    id: input?.id ?? asBookingId(randomUUID()),
    tenantId,
    organizationId,
    bookingNumber: createBookingNumberFromToken(
      input?.bookingNumberToken ?? randomUUID()
    ),
    bookedByActorId: asActorId(randomUUID()),
    ...(input?.guest
      ? {
          guestCustomerSnapshot: {
            displayName: "Guest",
            email: "guest@example.com",
          },
        }
      : { customerId: asCustomerId(randomUUID()) }),
    source: "B2C_WEB",
  });
}

export function registerBookingRepositoryContractTests(
  label: string,
  createRepo: () => BookingRepository
) {
  describe(`Booking repository contract (${label})`, () => {
    it("saves and reads by id and booking number without incrementing version", async () => {
      const repo = createRepo();
      const booking = buildBooking();
      expect(booking.version).toBe(0);
      await repo.save(booking);

      const byId = await repo.findById(
        booking.tenantId,
        booking.organizationId,
        booking.id
      );
      expect(byId).toEqual(booking);
      expect(byId?.version).toBe(0);
      expect(byId?.priceSnapshot).toBeNull();
    });

    it("round-trips confirmed commercial snapshots with deep isolation", async () => {
      const repo = createRepo();
      const draft = buildBooking();
      await repo.save(draft);
      const pending = requestBookingConfirmation(draft);
      await repo.save(pending, draft.version);
      const confirmed = confirmBooking(pending, sampleCommercialInput());
      await repo.save(confirmed, pending.version);

      const loaded = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(loaded?.status).toBe("CONFIRMED");
      expect(loaded?.priceSnapshot?.totalCustomerAmountMinor).toBe(12200);
      expect(loaded?.policySnapshot?.cancellationPolicyCode).toBe("CANCEL.STD");
      expect(loaded?.contactSnapshot?.bookerEmail).toBe("booker@example.com");
      expect(loaded?.billingSnapshot?.billingCountryCode).toBe("IT");
      expect(loaded?.commercialRevision).toBe(1);
      expect(loaded?.priceSnapshot).not.toBe(confirmed.priceSnapshot);

      if (loaded?.priceSnapshot) {
        expect(() => {
          // @ts-expect-error intentional mutation
          loaded.priceSnapshot.currency = "USD";
        }).toThrow();
      }

      const again = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(again?.priceSnapshot?.currency).toBe("EUR");
    });

    it("isolates by tenant (wrong tenant → not found, no existence leak)", async () => {
      const repo = createRepo();
      const booking = buildBooking();
      await repo.save(booking);
      const otherTenant = asTenantId(randomUUID());

      await expect(
        repo.findById(otherTenant, booking.organizationId, booking.id)
      ).resolves.toBeNull();
      await expect(
        repo.existsByBookingNumber(
          otherTenant,
          booking.organizationId,
          booking.bookingNumber
        )
      ).resolves.toBe(false);
    });

    it("isolates by organization (wrong org → not found, no existence leak)", async () => {
      const repo = createRepo();
      const booking = buildBooking();
      await repo.save(booking);
      const otherOrg = asOrganizationId(randomUUID());

      await expect(
        repo.findById(booking.tenantId, otherOrg, booking.id)
      ).resolves.toBeNull();
      await expect(
        repo.existsByBookingNumber(
          booking.tenantId,
          otherOrg,
          booking.bookingNumber
        )
      ).resolves.toBe(false);
    });

    it("allows same BookingId in different tenants", async () => {
      const repo = createRepo();
      const sharedId = asBookingId(randomUUID());
      const a = buildBooking({
        id: sharedId,
        tenantId: asTenantId(randomUUID()),
      });
      const b = buildBooking({
        id: sharedId,
        tenantId: asTenantId(randomUUID()),
      });
      await repo.save(a);
      await repo.save(b);
      await expect(
        repo.findById(a.tenantId, a.organizationId, sharedId)
      ).resolves.toEqual(a);
      await expect(
        repo.findById(b.tenantId, b.organizationId, sharedId)
      ).resolves.toEqual(b);
    });

    it("enforces unique bookingNumber within tenant/org scope", async () => {
      const repo = createRepo();
      const tenantId = asTenantId(randomUUID());
      const organizationId = asOrganizationId(randomUUID());
      const token = randomUUID();
      const first = buildBooking({
        tenantId,
        organizationId,
        bookingNumberToken: token,
      });
      const second = buildBooking({
        tenantId,
        organizationId,
        bookingNumberToken: token,
      });
      await repo.save(first);
      await expect(repo.save(second)).rejects.toBeInstanceOf(
        DuplicateBookingNumberError
      );
    });

    it("allows same bookingNumber on different organizations", async () => {
      const repo = createRepo();
      const tenantId = asTenantId(randomUUID());
      const token = randomUUID();
      const a = buildBooking({
        tenantId,
        organizationId: asOrganizationId(randomUUID()),
        bookingNumberToken: token,
      });
      const b = buildBooking({
        tenantId,
        organizationId: asOrganizationId(randomUUID()),
        bookingNumberToken: token,
      });
      await repo.save(a);
      await repo.save(b);
    });

    it("returns null for unknown ids / numbers", async () => {
      const repo = createRepo();
      const booking = buildBooking();
      await expect(
        repo.findById(booking.tenantId, booking.organizationId, booking.id)
      ).resolves.toBeNull();
    });

    it("treats first save as insert: expectedVersion must be omitted", async () => {
      const repo = createRepo();
      const booking = buildBooking();
      await expect(repo.save(booking, 0)).rejects.toBeInstanceOf(
        BookingVersionConflictError
      );
      await repo.save(booking);
    });

    it("enforces optimistic concurrency: stale expectedVersion fails and leaves row unchanged", async () => {
      const repo = createRepo();
      const booking = buildBooking();
      await repo.save(booking);

      const pending = requestBookingConfirmation(booking);
      await repo.save(pending, booking.version);

      const stale = confirmBooking(pending, sampleCommercialInput());
      await expect(repo.save(stale, 0)).rejects.toBeInstanceOf(
        BookingVersionConflictError
      );

      const afterFailed = await repo.findById(
        booking.tenantId,
        booking.organizationId,
        booking.id
      );
      expect(afterFailed?.status).toBe("PENDING_CONFIRMATION");
      expect(afterFailed?.version).toBe(1);
      expect(afterFailed?.priceSnapshot).toBeNull();

      const confirmed = confirmBooking(pending, sampleCommercialInput());
      await repo.save(confirmed, pending.version);
      const loaded = await repo.findById(
        booking.tenantId,
        booking.organizationId,
        booking.id
      );
      expect(loaded?.status).toBe("CONFIRMED");
      expect(loaded?.version).toBe(2);
      expect(loaded?.priceSnapshot).not.toBeNull();
    });

    it("rejects concurrent confirm writers from the same expectedVersion", async () => {
      const repo = createRepo();
      const draft = buildBooking();
      await repo.save(draft);
      const pending = requestBookingConfirmation(draft);
      await repo.save(pending, draft.version);

      const writerA = confirmBooking(pending, sampleCommercialInput());
      const writerB = confirmBooking(pending, {
        ...sampleCommercialInput(),
        priceSnapshot: {
          ...sampleCommercialInput().priceSnapshot,
          baseAmountMinor: 20000,
          totalCustomerAmountMinor: 22200,
        },
      });

      await repo.save(writerA, pending.version);
      await expect(repo.save(writerB, pending.version)).rejects.toBeInstanceOf(
        BookingVersionConflictError
      );

      const loaded = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(loaded?.status).toBe("CONFIRMED");
      expect(loaded?.version).toBe(2);
      expect(loaded?.priceSnapshot?.baseAmountMinor).toBe(10000);
      expect(loaded?.commercialRevision).toBe(1);
    });

    it("two independent reads do not share snapshot references", async () => {
      const repo = createRepo();
      const draft = buildBooking();
      await repo.save(draft);
      const pending = requestBookingConfirmation(draft);
      await repo.save(pending, draft.version);
      const confirmed = confirmBooking(pending, sampleCommercialInput());
      await repo.save(confirmed, pending.version);

      const a = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      const b = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      expect(a?.priceSnapshot).not.toBe(b?.priceSnapshot);
      expect(a?.contactSnapshot).not.toBe(b?.contactSnapshot);
    });

    it("requires expectedVersion on update and rejects bookingNumber mutation", async () => {
      const repo = createRepo();
      const booking = buildBooking();
      await repo.save(booking);

      const pending = requestBookingConfirmation(booking);
      await expect(repo.save(pending)).rejects.toBeInstanceOf(
        BookingVersionConflictError
      );

      const withNewNumber = {
        ...pending,
        bookingNumber: createBookingNumberFromToken(randomUUID()),
      };
      await expect(
        repo.save(withNewNumber, booking.version)
      ).rejects.toBeInstanceOf(DomainValidationError);
    });

    it("does not leak mutable references: alter loaded object, re-read unchanged", async () => {
      const repo = createRepo();
      const booking = buildBooking({ guest: true });
      await repo.save(booking);
      const loaded = await repo.findById(
        booking.tenantId,
        booking.organizationId,
        booking.id
      );
      expect(loaded).not.toBeNull();
      if (!loaded) {
        return;
      }

      expect(() => {
        // @ts-expect-error intentional mutation attempt
        loaded.status = "CONFIRMED";
      }).toThrow();

      loaded.requestedAt.setTime(0);
      const again = await repo.findById(
        booking.tenantId,
        booking.organizationId,
        booking.id
      );
      expect(again?.status).toBe("DRAFT");
      expect(again?.requestedAt.getTime()).toBe(booking.requestedAt.getTime());
    });

    it("does not expose a global findAll API", () => {
      const repo = createRepo();
      expect("findAll" in repo).toBe(false);
    });
  });
}

describe("InMemory booking repository", () => {
  registerBookingRepositoryContractTests(
    "in-memory",
    () => new InMemoryBookingRepository()
  );
});
