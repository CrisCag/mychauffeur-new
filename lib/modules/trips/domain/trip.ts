import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import {
  InvalidTripStateTransitionError,
  TripDomainValidationError,
} from "./errors";
import {
  asTripAssignmentId,
  asTripId,
  asTripServiceId,
  type TripAssignmentId,
  type TripId,
  type TripServiceId,
} from "./identifiers";
import {
  createTripDomainEvent,
  type TripDomainEvent,
  type TripDomainEventType,
} from "./trip-events";
import {
  isTerminalTripStatus,
  isTripStatus,
  type TripStatus,
} from "./trip-status";

export type Trip = {
  readonly id: TripId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly serviceId: TripServiceId;
  readonly assignmentId: TripAssignmentId;
  readonly status: TripStatus;
  readonly reasonCode: string | null;
  readonly enRouteAt: Date | null;
  readonly arrivedAt: Date | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly endedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type TripOperationResult = {
  readonly trip: Trip;
  readonly events: readonly TripDomainEvent[];
};

export type CreateScheduledTripInput = {
  id: TripId | string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  serviceId: TripServiceId | string;
  assignmentId: TripAssignmentId | string;
  createdAt: Date;
};

export type RehydrateTripInput = Omit<
  Trip,
  "id" | "serviceId" | "assignmentId" | "status"
> & {
  id: TripId | string;
  serviceId: TripServiceId | string;
  assignmentId: TripAssignmentId | string;
  status: TripStatus | string;
};

function assertDate(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TripDomainValidationError(`${field} is invalid`);
  }
  return value;
}

function copyDate(value: Date | null): Date | null {
  return value ? new Date(value.getTime()) : null;
}

function assertVersion(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new TripDomainValidationError(
      "Trip version must be a non-negative integer"
    );
  }
  return value;
}

function parseReasonCode(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9_]{1,63}$/.test(normalized)) {
    throw new TripDomainValidationError("reasonCode is invalid");
  }
  return normalized;
}

function assertTimestampOrder(trip: Trip): void {
  const ordered = [
    trip.createdAt,
    trip.enRouteAt,
    trip.arrivedAt,
    trip.startedAt,
    trip.completedAt,
    trip.endedAt,
    trip.updatedAt,
  ].filter((value): value is Date => value !== null);
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index - 1].getTime() > ordered[index].getTime()) {
      throw new TripDomainValidationError("Trip timestamps are inconsistent");
    }
  }
}

function assertLifecycle(trip: Trip): void {
  const terminal = isTerminalTripStatus(trip.status);
  if ((terminal && !trip.endedAt) || (!terminal && trip.endedAt)) {
    throw new TripDomainValidationError("Trip status and endedAt are inconsistent");
  }
  const reasonStatuses: readonly TripStatus[] = [
    "NO_SHOW_CUSTOMER",
    "NO_SHOW_DRIVER",
    "CANCELLED",
    "DISRUPTED",
  ];
  if (reasonStatuses.includes(trip.status) !== Boolean(trip.reasonCode)) {
    throw new TripDomainValidationError(
      "Trip status and reasonCode are inconsistent"
    );
  }
  if (trip.status === "SCHEDULED" && (trip.enRouteAt || trip.arrivedAt || trip.startedAt)) {
    throw new TripDomainValidationError("SCHEDULED Trip cannot have execution timestamps");
  }
  if (["EN_ROUTE", "ARRIVED", "ONGOING", "COMPLETED"].includes(trip.status) && !trip.enRouteAt) {
    throw new TripDomainValidationError("Trip execution requires enRouteAt");
  }
  if (["ARRIVED", "ONGOING", "COMPLETED", "NO_SHOW_CUSTOMER"].includes(trip.status) && !trip.arrivedAt) {
    throw new TripDomainValidationError("Trip arrival requires arrivedAt");
  }
  if (["ONGOING", "COMPLETED"].includes(trip.status) && !trip.startedAt) {
    throw new TripDomainValidationError("Trip service requires startedAt");
  }
  if ((trip.status === "COMPLETED") !== Boolean(trip.completedAt)) {
    throw new TripDomainValidationError("Trip completion metadata is inconsistent");
  }
  if (trip.arrivedAt && !trip.enRouteAt) {
    throw new TripDomainValidationError("arrivedAt requires enRouteAt");
  }
  if (trip.startedAt && !trip.arrivedAt) {
    throw new TripDomainValidationError("startedAt requires arrivedAt");
  }
  if (trip.completedAt && !trip.startedAt) {
    throw new TripDomainValidationError("completedAt requires startedAt");
  }
  assertTimestampOrder(trip);
}

function freezeTrip(trip: Trip): Trip {
  const frozen = Object.freeze({
    ...trip,
    enRouteAt: copyDate(trip.enRouteAt),
    arrivedAt: copyDate(trip.arrivedAt),
    startedAt: copyDate(trip.startedAt),
    completedAt: copyDate(trip.completedAt),
    endedAt: copyDate(trip.endedAt),
    createdAt: new Date(trip.createdAt.getTime()),
    updatedAt: new Date(trip.updatedAt.getTime()),
  });
  assertLifecycle(frozen);
  return frozen;
}

function result(trip: Trip, events: readonly TripDomainEvent[]): TripOperationResult {
  return Object.freeze({ trip, events: Object.freeze([...events]) });
}

function transition(
  trip: Trip,
  status: TripStatus,
  at: Date,
  eventType: TripDomainEventType,
  patch: Partial<Trip> = {}
): TripOperationResult {
  const occurredAt = assertDate(at, "at");
  if (occurredAt.getTime() < trip.updatedAt.getTime()) {
    throw new TripDomainValidationError("at must be >= updatedAt");
  }
  const next = freezeTrip({
    ...trip,
    ...patch,
    status,
    updatedAt: new Date(occurredAt.getTime()),
    version: trip.version + 1,
  });
  return result(next, [
    createTripDomainEvent({
      type: eventType,
      tripId: next.id,
      serviceId: next.serviceId,
      assignmentId: next.assignmentId,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      status: next.status,
      ...(next.reasonCode ? { reasonCode: next.reasonCode } : {}),
      occurredAt,
    }),
  ]);
}

export function createScheduledTrip(
  input: CreateScheduledTripInput
): TripOperationResult {
  const createdAt = assertDate(input.createdAt, "createdAt");
  const trip = freezeTrip({
    id: asTripId(String(input.id)),
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    serviceId: asTripServiceId(String(input.serviceId)),
    assignmentId: asTripAssignmentId(String(input.assignmentId)),
    status: "SCHEDULED",
    reasonCode: null,
    enRouteAt: null,
    arrivedAt: null,
    startedAt: null,
    completedAt: null,
    endedAt: null,
    createdAt: new Date(createdAt.getTime()),
    updatedAt: new Date(createdAt.getTime()),
    version: 0,
  });
  return result(trip, [
    createTripDomainEvent({
      type: "Trip.Created",
      tripId: trip.id,
      serviceId: trip.serviceId,
      assignmentId: trip.assignmentId,
      tenantId: trip.tenantId,
      organizationId: trip.organizationId,
      status: trip.status,
      occurredAt: createdAt,
    }),
  ]);
}

export function rehydrateTrip(input: RehydrateTripInput): Trip {
  if (!isTripStatus(String(input.status))) {
    throw new TripDomainValidationError("status is invalid");
  }
  return freezeTrip({
    ...input,
    id: asTripId(String(input.id)),
    serviceId: asTripServiceId(String(input.serviceId)),
    assignmentId: asTripAssignmentId(String(input.assignmentId)),
    status: input.status as TripStatus,
    reasonCode: input.reasonCode ? parseReasonCode(input.reasonCode) : null,
    enRouteAt: copyDate(input.enRouteAt),
    arrivedAt: copyDate(input.arrivedAt),
    startedAt: copyDate(input.startedAt),
    completedAt: copyDate(input.completedAt),
    endedAt: copyDate(input.endedAt),
    createdAt: new Date(assertDate(input.createdAt, "createdAt").getTime()),
    updatedAt: new Date(assertDate(input.updatedAt, "updatedAt").getTime()),
    version: assertVersion(input.version),
  });
}

export function markTripEnRoute(trip: Trip, at: Date): TripOperationResult {
  if (trip.status === "EN_ROUTE") return result(trip, []);
  if (trip.status !== "SCHEDULED") throw new InvalidTripStateTransitionError();
  const occurredAt = assertDate(at, "at");
  return transition(trip, "EN_ROUTE", occurredAt, "Trip.EnRoute", {
    enRouteAt: new Date(occurredAt.getTime()),
  });
}

export function markTripArrived(trip: Trip, at: Date): TripOperationResult {
  if (trip.status === "ARRIVED") return result(trip, []);
  if (trip.status !== "EN_ROUTE") throw new InvalidTripStateTransitionError();
  const occurredAt = assertDate(at, "at");
  return transition(trip, "ARRIVED", occurredAt, "Trip.Arrived", {
    arrivedAt: new Date(occurredAt.getTime()),
  });
}

export function startTrip(trip: Trip, at: Date): TripOperationResult {
  if (trip.status === "ONGOING") return result(trip, []);
  if (trip.status !== "ARRIVED") throw new InvalidTripStateTransitionError();
  const occurredAt = assertDate(at, "at");
  return transition(trip, "ONGOING", occurredAt, "Trip.Started", {
    startedAt: new Date(occurredAt.getTime()),
  });
}

export function completeTrip(trip: Trip, at: Date): TripOperationResult {
  if (trip.status === "COMPLETED") return result(trip, []);
  if (trip.status !== "ONGOING") throw new InvalidTripStateTransitionError();
  const occurredAt = assertDate(at, "at");
  return transition(trip, "COMPLETED", occurredAt, "Trip.Completed", {
    completedAt: new Date(occurredAt.getTime()),
    endedAt: new Date(occurredAt.getTime()),
  });
}

function endWithReason(
  trip: Trip,
  status: "NO_SHOW_CUSTOMER" | "NO_SHOW_DRIVER" | "CANCELLED" | "DISRUPTED",
  reasonCode: string,
  at: Date,
  eventType: TripDomainEventType,
  allowed: readonly TripStatus[]
): TripOperationResult {
  const reason = parseReasonCode(reasonCode);
  if (trip.status === status) {
    if (trip.reasonCode === reason) return result(trip, []);
    throw new InvalidTripStateTransitionError();
  }
  if (!allowed.includes(trip.status)) throw new InvalidTripStateTransitionError();
  const occurredAt = assertDate(at, "at");
  return transition(trip, status, occurredAt, eventType, {
    reasonCode: reason,
    endedAt: new Date(occurredAt.getTime()),
  });
}

export const markCustomerNoShow = (
  trip: Trip,
  reasonCode: string,
  at: Date
): TripOperationResult =>
  endWithReason(trip, "NO_SHOW_CUSTOMER", reasonCode, at, "Trip.CustomerNoShow", ["ARRIVED"]);

export const markDriverNoShow = (
  trip: Trip,
  reasonCode: string,
  at: Date
): TripOperationResult =>
  endWithReason(trip, "NO_SHOW_DRIVER", reasonCode, at, "Trip.DriverNoShow", ["SCHEDULED"]);

export const cancelTrip = (
  trip: Trip,
  reasonCode: string,
  at: Date
): TripOperationResult =>
  endWithReason(trip, "CANCELLED", reasonCode, at, "Trip.Cancelled", [
    "SCHEDULED",
    "EN_ROUTE",
    "ARRIVED",
    "ONGOING",
  ]);

export const disruptTrip = (
  trip: Trip,
  reasonCode: string,
  at: Date
): TripOperationResult =>
  endWithReason(trip, "DISRUPTED", reasonCode, at, "Trip.Disrupted", [
    "EN_ROUTE",
    "ARRIVED",
    "ONGOING",
  ]);
