import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { asOrganizationId, asTenantId } from "@/lib/modules/identity";
import type { TripRepository } from "@/lib/modules/trips";
import {
  cancelTrip,
  CurrentTripConflictError,
  createTripForConfirmedAssignment,
  markTripEnRoute,
  TripDomainValidationError,
  TripVersionConflictError,
} from "@/lib/modules/trips";
import { InMemoryTripRepository } from "@/lib/modules/trips/infrastructure";
import {
  createConfirmedAssignment,
  createScheduledTripFixture,
} from "./trips-test-fixtures";

function registerTripRepositoryContractTests(
  label: string,
  createRepo: () => TripRepository
) {
  describe(`Trip repository contract (${label})`, () => {
    it("saves, clones, reads, and isolates tenant/organization scope", async () => {
      const repo = createRepo();
      const trip = createScheduledTripFixture();
      await repo.save(trip);
      const loaded = await repo.findById(trip.tenantId, trip.organizationId, trip.id);
      expect(loaded).toEqual(trip);
      expect(loaded).not.toBe(trip);
      expect(loaded?.createdAt).not.toBe(trip.createdAt);
      expect(loaded?.version).toBe(0);
      expect(
        await repo.findById(asTenantId(randomUUID()), trip.organizationId, trip.id)
      ).toBeNull();
      expect(
        await repo.findById(trip.tenantId, asOrganizationId(randomUUID()), trip.id)
      ).toBeNull();
    });

    it("allows only one current Trip per Service", async () => {
      const repo = createRepo();
      const assignment = createConfirmedAssignment();
      const first = createScheduledTripFixture(assignment);
      const second = createTripForConfirmedAssignment(assignment, {
        id: randomUUID(),
        tenantId: assignment.tenantId,
        organizationId: assignment.organizationId,
        createdAt: new Date("2026-10-04T12:30:00.000Z"),
      }).trip;
      await repo.save(first);
      await expect(repo.save(second)).rejects.toBeInstanceOf(CurrentTripConflictError);
      const ended = cancelTrip(
        first,
        "REPLACED",
        new Date("2026-10-04T13:00:00.000Z")
      ).trip;
      await repo.save(ended, 0);
      await repo.save(second);
      expect(
        await repo.findCurrentByServiceId(
          second.tenantId,
          second.organizationId,
          second.serviceId
        )
      ).toEqual(second);
    });

    it("enforces OCC and preserves the winning state", async () => {
      const repo = createRepo();
      const scheduled = createScheduledTripFixture();
      await repo.save(scheduled);
      const enRoute = markTripEnRoute(
        scheduled,
        new Date("2026-10-04T13:00:00.000Z")
      ).trip;
      await expect(repo.save(enRoute)).rejects.toBeInstanceOf(TripVersionConflictError);
      await repo.save(enRoute, 0);
      const stale = cancelTrip(
        scheduled,
        "STALE_WRITER",
        new Date("2026-10-04T13:30:00.000Z")
      ).trip;
      await expect(repo.save(stale, 0)).rejects.toBeInstanceOf(TripVersionConflictError);
      const loaded = await repo.findById(
        scheduled.tenantId,
        scheduled.organizationId,
        scheduled.id
      );
      expect(loaded?.status).toBe("EN_ROUTE");
      expect(loaded?.version).toBe(1);
    });

    it("rejects mutation of immutable identity and links", async () => {
      const repo = createRepo();
      const scheduled = createScheduledTripFixture();
      await repo.save(scheduled);
      const changed = {
        ...markTripEnRoute(
          scheduled,
          new Date("2026-10-04T13:00:00.000Z")
        ).trip,
        assignmentId: randomUUID() as typeof scheduled.assignmentId,
      };
      await expect(repo.save(changed, 0)).rejects.toBeInstanceOf(
        TripDomainValidationError
      );
    });
  });
}

registerTripRepositoryContractTests("in-memory", () => new InMemoryTripRepository());
