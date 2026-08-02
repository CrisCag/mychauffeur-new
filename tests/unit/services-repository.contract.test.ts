import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import type { ServiceRepository } from "@/lib/modules/services";
import {
  asServiceBookingId,
  cancelService,
  createServiceNumberFromToken,
  DomainValidationError,
  DuplicateServiceGenerationKeyError,
  DuplicateServiceNumberError,
  DuplicateServiceSequenceError,
  markServiceReadyForAssignment,
  ServiceVersionConflictError,
} from "@/lib/modules/services";
import { createServiceFromConfirmedBooking } from "@/lib/modules/services/domain/service";
import {
  InMemoryServiceRepository,
  MAX_SERVICE_BOOKING_PAGE_LIMIT,
} from "@/lib/modules/services/infrastructure";
import {
  baseServiceInput,
  buildConfirmedBooking,
  createPlannedService,
} from "./services-test-fixtures";

export function registerServiceRepositoryContractTests(
  label: string,
  createRepo: () => ServiceRepository
) {
  describe(`Service repository contract (${label})`, () => {
    it("saves and reads without incrementing version", async () => {
      const repo = createRepo();
      const service = createPlannedService();
      await repo.save(service);
      const loaded = await repo.findById(
        service.tenantId,
        service.organizationId,
        service.id
      );
      expect(loaded).toEqual(service);
      expect(loaded?.version).toBe(0);
    });

    it("deep clones on save/read", async () => {
      const repo = createRepo();
      const service = createPlannedService();
      await repo.save(service);
      const a = await repo.findById(
        service.tenantId,
        service.organizationId,
        service.id
      );
      const b = await repo.findById(
        service.tenantId,
        service.organizationId,
        service.id
      );
      expect(a).not.toBe(b);
      expect(a?.routePlan).not.toBe(b?.routePlan);
      expect(a?.schedule.scheduledPickupAt).not.toBe(
        b?.schedule.scheduledPickupAt
      );
    });

    it("isolates tenant and organization without leakage", async () => {
      const repo = createRepo();
      const service = createPlannedService();
      await repo.save(service);

      expect(
        await repo.findById(
          asTenantId(randomUUID()),
          service.organizationId,
          service.id
        )
      ).toBeNull();
      expect(
        await repo.findById(
          service.tenantId,
          asOrganizationId(randomUUID()),
          service.id
        )
      ).toBeNull();
      expect(
        await repo.existsByServiceNumber(
          asTenantId(randomUUID()),
          service.organizationId,
          service.serviceNumber
        )
      ).toBe(false);
      expect(
        await repo.findByGenerationKey(
          service.tenantId,
          asOrganizationId(randomUUID()),
          service.generationKey
        )
      ).toBeNull();
    });

    it("enforces unique ServiceNumber, generationKey, and Booking+sequence", async () => {
      const repo = createRepo();
      const booking = buildConfirmedBooking();
      const first = createServiceFromConfirmedBooking(
        baseServiceInput(booking)
      ).service;
      await repo.save(first);

      await expect(
        repo.save(
          createServiceFromConfirmedBooking(
            baseServiceInput(booking, {
              id: randomUUID(),
              serviceNumber: first.serviceNumber,
              generationKey: `other-${randomUUID().slice(0, 8)}`,
              serviceSequence: 2,
            })
          ).service
        )
      ).rejects.toBeInstanceOf(DuplicateServiceNumberError);

      await expect(
        repo.save(
          createServiceFromConfirmedBooking(
            baseServiceInput(booking, {
              id: randomUUID(),
              serviceNumber: createServiceNumberFromToken(randomUUID()),
              generationKey: first.generationKey,
              serviceSequence: 2,
            })
          ).service
        )
      ).rejects.toBeInstanceOf(DuplicateServiceGenerationKeyError);

      await expect(
        repo.save(
          createServiceFromConfirmedBooking(
            baseServiceInput(booking, {
              id: randomUUID(),
              serviceNumber: createServiceNumberFromToken(randomUUID()),
              generationKey: `other-${randomUUID().slice(0, 8)}`,
              serviceSequence: first.serviceSequence,
            })
          ).service
        )
      ).rejects.toBeInstanceOf(DuplicateServiceSequenceError);
    });

    it("paginates findByBookingId ordered by serviceSequence", async () => {
      const repo = createRepo();
      const booking = buildConfirmedBooking();
      for (let seq = 1; seq <= 5; seq += 1) {
        await repo.save(
          createServiceFromConfirmedBooking(
            baseServiceInput(booking, {
              id: randomUUID(),
              serviceNumber: createServiceNumberFromToken(randomUUID()),
              generationKey: `gen-page-${seq}-${randomUUID().slice(0, 6)}`,
              serviceSequence: seq,
            })
          ).service
        );
      }

      const page1 = await repo.findByBookingId(
        booking.tenantId,
        booking.organizationId,
        asServiceBookingId(booking.id),
        { limit: 2 }
      );
      expect(page1.items.map((s) => s.serviceSequence)).toEqual([1, 2]);
      expect(page1.nextCursor).toBe(2);

      const page2 = await repo.findByBookingId(
        booking.tenantId,
        booking.organizationId,
        asServiceBookingId(booking.id),
        { limit: 2, cursor: page1.nextCursor }
      );
      expect(page2.items.map((s) => s.serviceSequence)).toEqual([3, 4]);

      const emptyOther = await repo.findByBookingId(
        booking.tenantId,
        booking.organizationId,
        asServiceBookingId(randomUUID()),
        { limit: 10 }
      );
      expect(emptyOther.items).toEqual([]);

      await expect(
        repo.findByBookingId(
          booking.tenantId,
          booking.organizationId,
          asServiceBookingId(booking.id),
          { limit: 0 }
        )
      ).rejects.toBeInstanceOf(DomainValidationError);

      await expect(
        repo.findByBookingId(
          booking.tenantId,
          booking.organizationId,
          asServiceBookingId(booking.id),
          { limit: MAX_SERVICE_BOOKING_PAGE_LIMIT + 1 }
        )
      ).rejects.toBeInstanceOf(DomainValidationError);

      await expect(
        repo.findByBookingId(
          booking.tenantId,
          booking.organizationId,
          asServiceBookingId(booking.id),
          { limit: 1.5 }
        )
      ).rejects.toBeInstanceOf(DomainValidationError);

      expect(MAX_SERVICE_BOOKING_PAGE_LIMIT).toBe(100);
    });

    it("OCC: update requires expectedVersion; conflict leaves persisted unchanged", async () => {
      const repo = createRepo();
      const service = createPlannedService();
      await repo.save(service);

      const ready = markServiceReadyForAssignment(
        service,
        new Date("2026-08-02T13:00:00.000Z")
      ).service;

      await expect(repo.save(ready)).rejects.toBeInstanceOf(
        ServiceVersionConflictError
      );

      const still = await repo.findById(
        service.tenantId,
        service.organizationId,
        service.id
      );
      expect(still?.status).toBe("PLANNED");
      expect(still?.version).toBe(0);

      await repo.save(ready, 0);
      const loaded = await repo.findById(
        service.tenantId,
        service.organizationId,
        service.id
      );
      expect(loaded?.status).toBe("READY_FOR_ASSIGNMENT");
      expect(loaded?.version).toBe(1);

      const cancelledA = cancelService(
        ready,
        "CUSTOMER_REQUEST",
        new Date("2026-08-02T14:00:00.000Z")
      ).service;
      const cancelledB = cancelService(
        ready,
        "OPERATIONAL",
        new Date("2026-08-02T14:00:00.000Z")
      ).service;

      await repo.save(cancelledA, 1);
      await expect(repo.save(cancelledB, 1)).rejects.toBeInstanceOf(
        ServiceVersionConflictError
      );
      const afterConflict = await repo.findById(
        service.tenantId,
        service.organizationId,
        service.id
      );
      expect(afterConflict?.cancelReasonCode).toBe("CUSTOMER_REQUEST");
      expect(afterConflict?.version).toBe(2);
    });

    it("rejects identity mutation on update", async () => {
      const repo = createRepo();
      const service = createPlannedService();
      await repo.save(service);
      const ready = markServiceReadyForAssignment(
        service,
        new Date("2026-08-02T13:00:00.000Z")
      ).service;
      const mutated = {
        ...ready,
        serviceNumber: createServiceNumberFromToken(randomUUID()),
      };
      await expect(repo.save(mutated as typeof ready, 0)).rejects.toBeInstanceOf(
        DomainValidationError
      );
    });

    it("findByServiceNumber and findByGenerationKey round-trip", async () => {
      const repo = createRepo();
      const service = createPlannedService();
      await repo.save(service);
      expect(
        await repo.findByServiceNumber(
          service.tenantId,
          service.organizationId,
          service.serviceNumber
        )
      ).toEqual(service);
      expect(
        await repo.findByGenerationKey(
          service.tenantId,
          service.organizationId,
          service.generationKey
        )
      ).toEqual(service);
      expect(
        await repo.existsByServiceNumber(
          service.tenantId,
          service.organizationId,
          service.serviceNumber
        )
      ).toBe(true);
    });
  });
}

registerServiceRepositoryContractTests(
  "InMemoryServiceRepository",
  () => new InMemoryServiceRepository()
);
