import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  completeAssignedServiceExecution,
  ExecutionScopeMismatchError,
  ExecutionStateMismatchError,
  startAssignedServiceExecution,
} from "@/lib/modules/execution";
import {
  confirmAssignment,
  createAssignmentForReadyService,
} from "@/lib/modules/assignments";
import { markTripArrived, markTripEnRoute } from "@/lib/modules/trips";
import { createReadyService } from "./assignments-test-fixtures";
import { createTripForConfirmedAssignment } from "@/lib/modules/trips";

function readyExecutionSet() {
  const service = createReadyService();
  const assignment = createConfirmedAssignmentForService(service);
  const scheduled = createTripForConfirmedAssignment(assignment, {
    id: randomUUID(),
    tenantId: assignment.tenantId,
    organizationId: assignment.organizationId,
    createdAt: new Date("2026-10-04T12:00:00.000Z"),
  }).trip;
  const enRoute = markTripEnRoute(
    scheduled,
    new Date("2026-10-04T13:00:00.000Z")
  ).trip;
  const trip = markTripArrived(
    enRoute,
    new Date("2026-10-04T14:00:00.000Z")
  ).trip;
  return { service, assignment, trip };
}

function createConfirmedAssignmentForService(
  service: ReturnType<typeof createReadyService>
) {
  const pending = createAssignmentForReadyService(service, {
    id: randomUUID(),
    tenantId: service.tenantId,
    organizationId: service.organizationId,
    mode: "INTERNAL",
    driverId: randomUUID(),
    vehicleId: randomUUID(),
    createdAt: new Date("2026-10-04T10:00:00.000Z"),
  }).assignment;
  return confirmAssignment(
    pending,
    new Date("2026-10-04T11:00:00.000Z")
  ).assignment;
}

describe("Execution orchestration", () => {
  it("starts Service, Assignment, and Trip together", () => {
    const source = readyExecutionSet();
    const started = startAssignedServiceExecution(
      source,
      new Date("2026-10-04T14:15:00.000Z")
    );
    expect(started.service.status).toBe("IN_EXECUTION");
    expect(started.assignment.status).toBe("ACTIVE");
    expect(started.trip.status).toBe("ONGOING");
    expect(started.events.service[0]?.type).toBe("Service.ExecutionStarted");
    expect(started.events.assignment[0]?.type).toBe("Assignment.Activated");
    expect(started.events.trip[0]?.type).toBe("Trip.Started");
  });

  it("completes all three aggregates and is idempotent when fully aligned", () => {
    const started = startAssignedServiceExecution(
      readyExecutionSet(),
      new Date("2026-10-04T14:15:00.000Z")
    );
    const completed = completeAssignedServiceExecution(
      started,
      new Date("2026-10-04T16:00:00.000Z")
    );
    expect(completed.service.status).toBe("COMPLETED");
    expect(completed.assignment.status).toBe("COMPLETED");
    expect(completed.trip.status).toBe("COMPLETED");
    expect(completed.events.service[0]?.type).toBe("Service.Completed");
    expect(completed.events.assignment[0]?.type).toBe("Assignment.Completed");
    expect(completed.events.trip[0]?.type).toBe("Trip.Completed");

    const again = completeAssignedServiceExecution(
      completed,
      new Date("2026-10-04T17:00:00.000Z")
    );
    expect(again.events).toEqual({ service: [], assignment: [], trip: [] });
    expect(again.service.version).toBe(completed.service.version);
  });

  it("rejects mixed lifecycle states rather than hiding partial updates", () => {
    const source = readyExecutionSet();
    const started = startAssignedServiceExecution(
      source,
      new Date("2026-10-04T14:15:00.000Z")
    );
    expect(() =>
      startAssignedServiceExecution(
        { ...source, trip: started.trip },
        new Date("2026-10-04T14:30:00.000Z")
      )
    ).toThrow(ExecutionStateMismatchError);
  });

  it("rejects cross-tenant and mismatched aggregate links", () => {
    const source = readyExecutionSet();
    const unrelated = readyExecutionSet();
    expect(() =>
      startAssignedServiceExecution(
        { ...source, trip: unrelated.trip },
        new Date("2026-10-04T14:15:00.000Z")
      )
    ).toThrow(ExecutionScopeMismatchError);
  });
});
