import type { Service } from "@/lib/modules/services";
import {
  createPendingAssignment,
  type AssignmentOperationResult,
  type CreatePendingAssignmentInput,
} from "../domain/assignment";
import {
  AssignmentScopeMismatchError,
  AssignmentServiceNotReadyError,
} from "../domain/errors";

export type CreateAssignmentForReadyServiceInput = Omit<
  CreatePendingAssignmentInput,
  "tenantId" | "organizationId" | "serviceId"
> & {
  tenantId: Service["tenantId"];
  organizationId: Service["organizationId"];
};

export function createAssignmentForReadyService(
  service: Service,
  input: CreateAssignmentForReadyServiceInput
): AssignmentOperationResult {
  if (
    service.tenantId !== input.tenantId ||
    service.organizationId !== input.organizationId
  ) {
    throw new AssignmentScopeMismatchError();
  }
  if (service.status !== "READY_FOR_ASSIGNMENT") {
    throw new AssignmentServiceNotReadyError();
  }
  return createPendingAssignment({
    ...input,
    serviceId: service.id,
  });
}
