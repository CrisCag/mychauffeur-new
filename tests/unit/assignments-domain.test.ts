import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { asOrganizationId, asTenantId } from "@/lib/modules/identity";
import {
  activateAssignment,
  AssignmentDomainValidationError,
  AssignmentScopeMismatchError,
  AssignmentServiceNotReadyError,
  cancelAssignment,
  completeAssignment,
  confirmAssignment,
  createAssignmentForReadyService,
  createPendingAssignment,
  InvalidAssignmentStateTransitionError,
  reassignAssignment,
  rehydrateAssignment,
  rejectAssignment,
} from "@/lib/modules/assignments";
import { createPlannedService } from "./services-test-fixtures";
import {
  createInternalPendingAssignment,
  createPartnerPendingAssignment,
  createReadyService,
} from "./assignments-test-fixtures";

describe("Assignment aggregate", () => {
  it("creates INTERNAL and PARTNER assignments with exclusive executors", () => {
    const internal = createInternalPendingAssignment();
    expect(internal.mode).toBe("INTERNAL");
    expect(internal.driverId).not.toBeNull();
    expect(internal.vehicleId).not.toBeNull();
    expect(internal.partnerOrganizationId).toBeNull();
    expect(internal.status).toBe("PENDING");
    expect(internal.version).toBe(0);
    expect(Object.isFrozen(internal)).toBe(true);

    const partner = createPartnerPendingAssignment();
    expect(partner.mode).toBe("PARTNER");
    expect(partner.partnerOrganizationId).not.toBeNull();
    expect(partner.driverId).toBeNull();
    expect(partner.vehicleId).toBeNull();
  });

  it("rejects incomplete or mixed executor identities", () => {
    const service = createReadyService();
    const base = {
      id: randomUUID(),
      tenantId: service.tenantId,
      organizationId: service.organizationId,
      serviceId: service.id,
      createdAt: new Date("2026-10-04T10:00:00.000Z"),
    };
    expect(() => createPendingAssignment({ ...base, mode: "INTERNAL" })).toThrow(
      AssignmentDomainValidationError
    );
    expect(() =>
      createPendingAssignment({
        ...base,
        mode: "PARTNER",
        partnerOrganizationId: randomUUID(),
        driverId: randomUUID(),
      })
    ).toThrow(AssignmentDomainValidationError);
  });

  it("only starts from a READY_FOR_ASSIGNMENT Service in the same scope", () => {
    const planned = createPlannedService();
    const input = {
      id: randomUUID(),
      tenantId: planned.tenantId,
      organizationId: planned.organizationId,
      mode: "INTERNAL" as const,
      driverId: randomUUID(),
      vehicleId: randomUUID(),
      createdAt: new Date("2026-10-04T10:00:00.000Z"),
    };
    expect(() => createAssignmentForReadyService(planned, input)).toThrow(
      AssignmentServiceNotReadyError
    );
    const ready = createReadyService();
    expect(() =>
      createAssignmentForReadyService(ready, {
        ...input,
        tenantId: asTenantId(randomUUID()),
        organizationId: asOrganizationId(randomUUID()),
      })
    ).toThrow(AssignmentScopeMismatchError);
  });

  it("follows PENDING -> CONFIRMED -> ACTIVE -> COMPLETED with one version per transition", () => {
    const pending = createInternalPendingAssignment();
    const confirmedResult = confirmAssignment(
      pending,
      new Date("2026-10-04T11:00:00.000Z")
    );
    const activeResult = activateAssignment(
      confirmedResult.assignment,
      new Date("2026-10-04T12:00:00.000Z")
    );
    const completedResult = completeAssignment(
      activeResult.assignment,
      new Date("2026-10-04T13:00:00.000Z")
    );

    expect([pending.version, confirmedResult.assignment.version, activeResult.assignment.version, completedResult.assignment.version]).toEqual([0, 1, 2, 3]);
    expect(confirmedResult.events[0]?.type).toBe("Assignment.Confirmed");
    expect(activeResult.events[0]?.type).toBe("Assignment.Activated");
    expect(completedResult.events[0]?.type).toBe("Assignment.Completed");
    expect(completedResult.assignment.completedAt?.toISOString()).toBe(
      "2026-10-04T13:00:00.000Z"
    );
    expect(completedResult.assignment.endedAt?.toISOString()).toBe(
      "2026-10-04T13:00:00.000Z"
    );
  });

  it("supports rejection, cancellation, and replacement terminal paths", () => {
    const pending = createPartnerPendingAssignment();
    const rejected = rejectAssignment(
      pending,
      "partner_declined",
      new Date("2026-10-04T11:00:00.000Z")
    ).assignment;
    expect(rejected.status).toBe("REJECTED");
    expect(rejected.reasonCode).toBe("PARTNER_DECLINED");

    const confirmed = confirmAssignment(
      createInternalPendingAssignment(),
      new Date("2026-10-04T11:00:00.000Z")
    ).assignment;
    expect(
      reassignAssignment(
        confirmed,
        "driver_unavailable",
        new Date("2026-10-04T12:00:00.000Z")
      ).assignment.status
    ).toBe("REASSIGNED");
    expect(
      cancelAssignment(
        createInternalPendingAssignment(),
        "service_cancelled",
        new Date("2026-10-04T11:00:00.000Z")
      ).assignment.status
    ).toBe("CANCELLED");
  });

  it("prevents invalid transitions and sensitive free-form reasons", () => {
    const pending = createInternalPendingAssignment();
    expect(() => activateAssignment(pending, new Date("2026-10-04T11:00:00Z"))).toThrow(
      InvalidAssignmentStateTransitionError
    );
    expect(() =>
      cancelAssignment(
        pending,
        "card 4111 1111 1111 1111",
        new Date("2026-10-04T11:00:00Z")
      )
    ).toThrow(AssignmentDomainValidationError);
  });

  it("rehydrates without version changes and protects Date references", () => {
    const pending = createInternalPendingAssignment();
    const sourceUpdatedAt = new Date(pending.updatedAt.getTime());
    const restored = rehydrateAssignment({
      ...pending,
      createdAt: new Date(pending.createdAt.getTime()),
      updatedAt: sourceUpdatedAt,
    });
    sourceUpdatedAt.setUTCFullYear(2040);
    expect(restored.version).toBe(0);
    expect(restored.updatedAt.toISOString()).toBe("2026-10-04T10:00:00.000Z");

    const at = new Date("2026-10-04T11:00:00.000Z");
    const confirmed = confirmAssignment(pending, at).assignment;
    at.setUTCFullYear(2040);
    expect(confirmed.confirmedAt?.toISOString()).toBe("2026-10-04T11:00:00.000Z");
  });
});
