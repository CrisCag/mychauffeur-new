import type { Assignment } from "@/lib/modules/assignments";
import {
  createScheduledTrip,
  type CreateScheduledTripInput,
  type TripOperationResult,
} from "../domain/trip";
import {
  AssignmentNotConfirmedForTripError,
  TripScopeMismatchError,
} from "../domain/errors";

export type CreateTripForConfirmedAssignmentInput = Omit<
  CreateScheduledTripInput,
  "tenantId" | "organizationId" | "serviceId" | "assignmentId"
> & {
  tenantId: Assignment["tenantId"];
  organizationId: Assignment["organizationId"];
};

export function createTripForConfirmedAssignment(
  assignment: Assignment,
  input: CreateTripForConfirmedAssignmentInput
): TripOperationResult {
  if (
    assignment.tenantId !== input.tenantId ||
    assignment.organizationId !== input.organizationId
  ) {
    throw new TripScopeMismatchError();
  }
  if (assignment.status !== "CONFIRMED") {
    throw new AssignmentNotConfirmedForTripError();
  }
  return createScheduledTrip({
    ...input,
    serviceId: assignment.serviceId,
    assignmentId: assignment.id,
  });
}
