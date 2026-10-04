import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { asOrganizationId, asTenantId } from "@/lib/modules/identity";
import type { AssignmentRepository } from "@/lib/modules/assignments";
import {
  ActiveAssignmentConflictError,
  AssignmentDomainValidationError,
  AssignmentVersionConflictError,
  cancelAssignment,
  confirmAssignment,
  createAssignmentForReadyService,
} from "@/lib/modules/assignments";
import { InMemoryAssignmentRepository } from "@/lib/modules/assignments/infrastructure";
import {
  createInternalPendingAssignment,
  createReadyService,
} from "./assignments-test-fixtures";

function registerAssignmentRepositoryContractTests(
  label: string,
  createRepo: () => AssignmentRepository
) {
  describe(`Assignment repository contract (${label})`, () => {
    it("saves, reads, isolates scope, and does not increment version", async () => {
      const repo = createRepo();
      const assignment = createInternalPendingAssignment();
      await repo.save(assignment);
      const loaded = await repo.findById(
        assignment.tenantId,
        assignment.organizationId,
        assignment.id
      );
      expect(loaded).toEqual(assignment);
      expect(loaded).not.toBe(assignment);
      expect(loaded?.createdAt).not.toBe(assignment.createdAt);
      expect(loaded?.version).toBe(0);
      expect(
        await repo.findById(
          asTenantId(randomUUID()),
          assignment.organizationId,
          assignment.id
        )
      ).toBeNull();
      expect(
        await repo.findById(
          assignment.tenantId,
          asOrganizationId(randomUUID()),
          assignment.id
        )
      ).toBeNull();
    });

    it("allows only one current assignment per Service", async () => {
      const repo = createRepo();
      const service = createReadyService();
      const first = createInternalPendingAssignment(service);
      const second = createAssignmentForReadyService(service, {
        id: randomUUID(),
        tenantId: service.tenantId,
        organizationId: service.organizationId,
        mode: "PARTNER",
        partnerOrganizationId: randomUUID(),
        createdAt: new Date("2026-10-04T10:30:00.000Z"),
      }).assignment;
      await repo.save(first);
      await expect(repo.save(second)).rejects.toBeInstanceOf(
        ActiveAssignmentConflictError
      );

      const ended = cancelAssignment(
        first,
        "REPLACED",
        new Date("2026-10-04T11:00:00.000Z")
      ).assignment;
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

    it("enforces OCC and leaves persisted state unchanged after a stale write", async () => {
      const repo = createRepo();
      const pending = createInternalPendingAssignment();
      await repo.save(pending);
      const confirmed = confirmAssignment(
        pending,
        new Date("2026-10-04T11:00:00.000Z")
      ).assignment;
      await expect(repo.save(confirmed)).rejects.toBeInstanceOf(
        AssignmentVersionConflictError
      );
      await repo.save(confirmed, 0);

      const stale = cancelAssignment(
        pending,
        "STALE_WRITER",
        new Date("2026-10-04T12:00:00.000Z")
      ).assignment;
      await expect(repo.save(stale, 0)).rejects.toBeInstanceOf(
        AssignmentVersionConflictError
      );
      const loaded = await repo.findById(
        pending.tenantId,
        pending.organizationId,
        pending.id
      );
      expect(loaded?.status).toBe("CONFIRMED");
      expect(loaded?.version).toBe(1);
    });

    it("rejects changes to identity or executor", async () => {
      const repo = createRepo();
      const pending = createInternalPendingAssignment();
      await repo.save(pending);
      const changed = {
        ...confirmAssignment(
          pending,
          new Date("2026-10-04T11:00:00.000Z")
        ).assignment,
        driverId: randomUUID() as typeof pending.driverId,
      };
      await expect(repo.save(changed, 0)).rejects.toBeInstanceOf(
        AssignmentDomainValidationError
      );
    });
  });
}

registerAssignmentRepositoryContractTests(
  "in-memory",
  () => new InMemoryAssignmentRepository()
);
