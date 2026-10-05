import { randomUUID } from "node:crypto";
import {
  confirmAssignment,
  type Assignment,
} from "@/lib/modules/assignments";
import {
  createTripForConfirmedAssignment,
  type Trip,
} from "@/lib/modules/trips";
import { createInternalPendingAssignment } from "./assignments-test-fixtures";

export function createConfirmedAssignment(): Assignment {
  return confirmAssignment(
    createInternalPendingAssignment(),
    new Date("2026-10-04T11:00:00.000Z")
  ).assignment;
}

export function createScheduledTripFixture(
  assignment = createConfirmedAssignment()
): Trip {
  return createTripForConfirmedAssignment(assignment, {
    id: randomUUID(),
    tenantId: assignment.tenantId,
    organizationId: assignment.organizationId,
    createdAt: new Date("2026-10-04T12:00:00.000Z"),
  }).trip;
}
