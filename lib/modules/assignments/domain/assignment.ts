import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import {
  AssignmentDomainValidationError,
  InvalidAssignmentStateTransitionError,
} from "./errors";
import {
  createAssignmentDomainEvent,
  type AssignmentDomainEvent,
  type AssignmentDomainEventType,
} from "./assignment-events";
import { isAssignmentMode, type AssignmentMode } from "./assignment-mode";
import {
  isAssignmentStatus,
  isTerminalAssignmentStatus,
  type AssignmentStatus,
} from "./assignment-status";
import {
  asAssignmentDriverId,
  asAssignmentId,
  asAssignmentServiceId,
  asAssignmentVehicleId,
  asPartnerOrganizationId,
  type AssignmentDriverId,
  type AssignmentId,
  type AssignmentServiceId,
  type AssignmentVehicleId,
  type PartnerOrganizationId,
} from "./identifiers";

export type Assignment = {
  readonly id: AssignmentId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly serviceId: AssignmentServiceId;
  readonly mode: AssignmentMode;
  readonly driverId: AssignmentDriverId | null;
  readonly vehicleId: AssignmentVehicleId | null;
  readonly partnerOrganizationId: PartnerOrganizationId | null;
  readonly status: AssignmentStatus;
  readonly reasonCode: string | null;
  readonly confirmedAt: Date | null;
  readonly activatedAt: Date | null;
  readonly completedAt: Date | null;
  readonly endedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type AssignmentOperationResult = {
  readonly assignment: Assignment;
  readonly events: readonly AssignmentDomainEvent[];
};

export type CreatePendingAssignmentInput = {
  id: AssignmentId | string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  serviceId: AssignmentServiceId | string;
  mode: AssignmentMode | string;
  driverId?: AssignmentDriverId | string | null;
  vehicleId?: AssignmentVehicleId | string | null;
  partnerOrganizationId?: PartnerOrganizationId | string | null;
  createdAt: Date;
};

export type RehydrateAssignmentInput = Omit<
  Assignment,
  | "id"
  | "serviceId"
  | "driverId"
  | "vehicleId"
  | "partnerOrganizationId"
  | "mode"
  | "status"
> & {
  id: AssignmentId | string;
  serviceId: AssignmentServiceId | string;
  driverId?: AssignmentDriverId | string | null;
  vehicleId?: AssignmentVehicleId | string | null;
  partnerOrganizationId?: PartnerOrganizationId | string | null;
  mode: AssignmentMode | string;
  status: AssignmentStatus | string;
};

function assertClock(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new AssignmentDomainValidationError(`${field} is invalid`);
  }
  return value;
}

function copyDate(value: Date | null): Date | null {
  return value ? new Date(value.getTime()) : null;
}

function parseReasonCode(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9_]{1,63}$/.test(normalized)) {
    throw new AssignmentDomainValidationError("reasonCode is invalid");
  }
  return normalized;
}

function parseVersion(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new AssignmentDomainValidationError(
      "Assignment version must be a non-negative integer"
    );
  }
  return value;
}

function optionalId<T>(
  value: string | T | null | undefined,
  parser: (raw: string) => T
): T | null {
  return value === undefined || value === null ? null : parser(String(value));
}

function assertExecutorCoupling(assignment: Assignment): void {
  if (assignment.mode === "INTERNAL") {
    if (!assignment.driverId || !assignment.vehicleId) {
      throw new AssignmentDomainValidationError(
        "INTERNAL assignment requires driverId and vehicleId"
      );
    }
    if (assignment.partnerOrganizationId) {
      throw new AssignmentDomainValidationError(
        "INTERNAL assignment cannot reference a partner organization"
      );
    }
    return;
  }

  if (!assignment.partnerOrganizationId) {
    throw new AssignmentDomainValidationError(
      "PARTNER assignment requires partnerOrganizationId"
    );
  }
  if (assignment.driverId || assignment.vehicleId) {
    throw new AssignmentDomainValidationError(
      "PARTNER assignment cannot bind internal driver or vehicle"
    );
  }
}

function assertLifecycleCoupling(assignment: Assignment): void {
  const terminal = isTerminalAssignmentStatus(assignment.status);
  if ((terminal && !assignment.endedAt) || (!terminal && assignment.endedAt)) {
    throw new AssignmentDomainValidationError(
      "Assignment status and endedAt are inconsistent"
    );
  }
  if (
    (assignment.status === "PENDING" || assignment.status === "REJECTED") &&
    assignment.confirmedAt
  ) {
    throw new AssignmentDomainValidationError(
      "Unconfirmed lifecycle cannot have confirmedAt"
    );
  }
  if (
    (["CONFIRMED", "ACTIVE", "COMPLETED", "REASSIGNED"] as const).includes(
      assignment.status as "CONFIRMED" | "ACTIVE" | "COMPLETED" | "REASSIGNED"
    ) &&
    !assignment.confirmedAt
  ) {
    throw new AssignmentDomainValidationError(
      "Confirmed lifecycle requires confirmedAt"
    );
  }
  if (
    (assignment.status === "ACTIVE" || assignment.status === "COMPLETED") &&
    !assignment.activatedAt
  ) {
    throw new AssignmentDomainValidationError(
      "Active lifecycle requires activatedAt"
    );
  }
  if (
    (["PENDING", "CONFIRMED", "REJECTED"] as const).includes(
      assignment.status as "PENDING" | "CONFIRMED" | "REJECTED"
    ) &&
    assignment.activatedAt
  ) {
    throw new AssignmentDomainValidationError(
      "Inactive lifecycle cannot have activatedAt"
    );
  }
  if (assignment.status === "COMPLETED" && !assignment.completedAt) {
    throw new AssignmentDomainValidationError(
      "COMPLETED requires completedAt"
    );
  }
  if (assignment.status !== "COMPLETED" && assignment.completedAt) {
    throw new AssignmentDomainValidationError(
      "completedAt is only allowed when COMPLETED"
    );
  }
  const reasonStatuses: readonly AssignmentStatus[] = [
    "REJECTED",
    "REASSIGNED",
    "CANCELLED",
  ];
  if (reasonStatuses.includes(assignment.status) !== Boolean(assignment.reasonCode)) {
    throw new AssignmentDomainValidationError(
      "Assignment status and reasonCode are inconsistent"
    );
  }
}

function freezeAssignment(assignment: Assignment): Assignment {
  assertExecutorCoupling(assignment);
  assertLifecycleCoupling(assignment);
  if (assignment.createdAt.getTime() > assignment.updatedAt.getTime()) {
    throw new AssignmentDomainValidationError(
      "createdAt must be <= updatedAt"
    );
  }
  return Object.freeze({
    ...assignment,
    confirmedAt: copyDate(assignment.confirmedAt),
    activatedAt: copyDate(assignment.activatedAt),
    completedAt: copyDate(assignment.completedAt),
    endedAt: copyDate(assignment.endedAt),
    createdAt: new Date(assignment.createdAt.getTime()),
    updatedAt: new Date(assignment.updatedAt.getTime()),
  });
}

function result(
  assignment: Assignment,
  events: readonly AssignmentDomainEvent[]
): AssignmentOperationResult {
  return Object.freeze({
    assignment,
    events: Object.freeze([...events]),
  });
}

function transition(
  assignment: Assignment,
  status: AssignmentStatus,
  at: Date,
  eventType: AssignmentDomainEventType,
  patch: Partial<Assignment> = {}
): AssignmentOperationResult {
  const occurredAt = assertClock(at, "at");
  if (occurredAt.getTime() < assignment.updatedAt.getTime()) {
    throw new AssignmentDomainValidationError("at must be >= updatedAt");
  }
  const next = freezeAssignment({
    ...assignment,
    ...patch,
    status,
    updatedAt: new Date(occurredAt.getTime()),
    version: assignment.version + 1,
  });
  return result(next, [
    createAssignmentDomainEvent({
      type: eventType,
      assignmentId: next.id,
      serviceId: next.serviceId,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      mode: next.mode,
      status: next.status,
      ...(next.reasonCode ? { reasonCode: next.reasonCode } : {}),
      occurredAt,
    }),
  ]);
}

export function createPendingAssignment(
  input: CreatePendingAssignmentInput
): AssignmentOperationResult {
  if (!isAssignmentMode(String(input.mode))) {
    throw new AssignmentDomainValidationError("mode is invalid");
  }
  const createdAt = assertClock(input.createdAt, "createdAt");
  const assignment = freezeAssignment({
    id: asAssignmentId(String(input.id)),
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    serviceId: asAssignmentServiceId(String(input.serviceId)),
    mode: input.mode as AssignmentMode,
    driverId: optionalId(input.driverId, asAssignmentDriverId),
    vehicleId: optionalId(input.vehicleId, asAssignmentVehicleId),
    partnerOrganizationId: optionalId(
      input.partnerOrganizationId,
      asPartnerOrganizationId
    ),
    status: "PENDING",
    reasonCode: null,
    confirmedAt: null,
    activatedAt: null,
    completedAt: null,
    endedAt: null,
    createdAt: new Date(createdAt.getTime()),
    updatedAt: new Date(createdAt.getTime()),
    version: 0,
  });
  return result(assignment, [
    createAssignmentDomainEvent({
      type: "Assignment.Created",
      assignmentId: assignment.id,
      serviceId: assignment.serviceId,
      tenantId: assignment.tenantId,
      organizationId: assignment.organizationId,
      mode: assignment.mode,
      status: assignment.status,
      occurredAt: createdAt,
    }),
  ]);
}

export function rehydrateAssignment(input: RehydrateAssignmentInput): Assignment {
  if (!isAssignmentMode(String(input.mode))) {
    throw new AssignmentDomainValidationError("mode is invalid");
  }
  if (!isAssignmentStatus(String(input.status))) {
    throw new AssignmentDomainValidationError("status is invalid");
  }
  return freezeAssignment({
    ...input,
    id: asAssignmentId(String(input.id)),
    serviceId: asAssignmentServiceId(String(input.serviceId)),
    mode: input.mode as AssignmentMode,
    status: input.status as AssignmentStatus,
    driverId: optionalId(input.driverId, asAssignmentDriverId),
    vehicleId: optionalId(input.vehicleId, asAssignmentVehicleId),
    partnerOrganizationId: optionalId(
      input.partnerOrganizationId,
      asPartnerOrganizationId
    ),
    reasonCode: input.reasonCode
      ? parseReasonCode(input.reasonCode)
      : null,
    confirmedAt: copyDate(input.confirmedAt),
    activatedAt: copyDate(input.activatedAt),
    completedAt: copyDate(input.completedAt),
    endedAt: copyDate(input.endedAt),
    createdAt: new Date(assertClock(input.createdAt, "createdAt").getTime()),
    updatedAt: new Date(assertClock(input.updatedAt, "updatedAt").getTime()),
    version: parseVersion(input.version),
  });
}

export function confirmAssignment(
  assignment: Assignment,
  at: Date
): AssignmentOperationResult {
  if (assignment.status === "CONFIRMED") return result(assignment, []);
  if (assignment.status !== "PENDING") {
    throw new InvalidAssignmentStateTransitionError();
  }
  const occurredAt = assertClock(at, "at");
  return transition(assignment, "CONFIRMED", occurredAt, "Assignment.Confirmed", {
    confirmedAt: new Date(occurredAt.getTime()),
  });
}

export function activateAssignment(
  assignment: Assignment,
  at: Date
): AssignmentOperationResult {
  if (assignment.status === "ACTIVE") return result(assignment, []);
  if (assignment.status !== "CONFIRMED") {
    throw new InvalidAssignmentStateTransitionError();
  }
  const occurredAt = assertClock(at, "at");
  return transition(assignment, "ACTIVE", occurredAt, "Assignment.Activated", {
    activatedAt: new Date(occurredAt.getTime()),
  });
}

export function completeAssignment(
  assignment: Assignment,
  at: Date
): AssignmentOperationResult {
  if (assignment.status === "COMPLETED") return result(assignment, []);
  if (assignment.status !== "ACTIVE") {
    throw new InvalidAssignmentStateTransitionError();
  }
  const occurredAt = assertClock(at, "at");
  return transition(assignment, "COMPLETED", occurredAt, "Assignment.Completed", {
    completedAt: new Date(occurredAt.getTime()),
    endedAt: new Date(occurredAt.getTime()),
  });
}

function endWithReason(
  assignment: Assignment,
  status: "REJECTED" | "REASSIGNED" | "CANCELLED",
  reasonCode: string,
  at: Date,
  eventType: AssignmentDomainEventType,
  allowed: readonly AssignmentStatus[]
): AssignmentOperationResult {
  const reason = parseReasonCode(reasonCode);
  if (assignment.status === status) {
    if (assignment.reasonCode === reason) return result(assignment, []);
    throw new InvalidAssignmentStateTransitionError();
  }
  if (!allowed.includes(assignment.status)) {
    throw new InvalidAssignmentStateTransitionError();
  }
  const occurredAt = assertClock(at, "at");
  return transition(assignment, status, occurredAt, eventType, {
    reasonCode: reason,
    endedAt: new Date(occurredAt.getTime()),
  });
}

export const rejectAssignment = (
  assignment: Assignment,
  reasonCode: string,
  at: Date
): AssignmentOperationResult =>
  endWithReason(
    assignment,
    "REJECTED",
    reasonCode,
    at,
    "Assignment.Rejected",
    ["PENDING"]
  );

export const reassignAssignment = (
  assignment: Assignment,
  reasonCode: string,
  at: Date
): AssignmentOperationResult =>
  endWithReason(
    assignment,
    "REASSIGNED",
    reasonCode,
    at,
    "Assignment.Reassigned",
    ["CONFIRMED", "ACTIVE"]
  );

export const cancelAssignment = (
  assignment: Assignment,
  reasonCode: string,
  at: Date
): AssignmentOperationResult =>
  endWithReason(
    assignment,
    "CANCELLED",
    reasonCode,
    at,
    "Assignment.Cancelled",
    ["PENDING", "CONFIRMED", "ACTIVE"]
  );
