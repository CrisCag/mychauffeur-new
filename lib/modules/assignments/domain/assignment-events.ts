import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { AssignmentId, AssignmentServiceId } from "./identifiers";
import type { AssignmentMode } from "./assignment-mode";
import type { AssignmentStatus } from "./assignment-status";

export type AssignmentDomainEventType =
  | "Assignment.Created"
  | "Assignment.Confirmed"
  | "Assignment.Activated"
  | "Assignment.Completed"
  | "Assignment.Rejected"
  | "Assignment.Reassigned"
  | "Assignment.Cancelled";

export type AssignmentDomainEvent = {
  readonly type: AssignmentDomainEventType;
  readonly assignmentId: AssignmentId;
  readonly serviceId: AssignmentServiceId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly mode: AssignmentMode;
  readonly status: AssignmentStatus;
  readonly reasonCode?: string;
  readonly occurredAt: Date;
};

export function createAssignmentDomainEvent(
  input: Omit<AssignmentDomainEvent, "occurredAt"> & { occurredAt: Date }
): AssignmentDomainEvent {
  return Object.freeze({
    ...input,
    occurredAt: new Date(input.occurredAt.getTime()),
  });
}
