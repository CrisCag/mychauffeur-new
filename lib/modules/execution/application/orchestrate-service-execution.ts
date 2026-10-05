import {
  activateAssignment,
  completeAssignment,
  type Assignment,
  type AssignmentDomainEvent,
} from "@/lib/modules/assignments";
import {
  completeService,
  markServiceInExecution,
  type Service,
  type ServiceDomainEvent,
} from "@/lib/modules/services";
import {
  completeTrip,
  startTrip,
  type Trip,
  type TripDomainEvent,
} from "@/lib/modules/trips";
import {
  ExecutionScopeMismatchError,
  ExecutionStateMismatchError,
} from "./errors";

export type ExecutionAggregateSet = {
  readonly service: Service;
  readonly assignment: Assignment;
  readonly trip: Trip;
};

export type ExecutionOrchestrationResult = ExecutionAggregateSet & {
  readonly events: Readonly<{
    service: readonly ServiceDomainEvent[];
    assignment: readonly AssignmentDomainEvent[];
    trip: readonly TripDomainEvent[];
  }>;
};

function assertLinked(input: ExecutionAggregateSet): void {
  const { service, assignment, trip } = input;
  if (
    service.tenantId !== assignment.tenantId ||
    service.tenantId !== trip.tenantId ||
    service.organizationId !== assignment.organizationId ||
    service.organizationId !== trip.organizationId ||
    String(service.id) !== String(assignment.serviceId) ||
    String(service.id) !== String(trip.serviceId) ||
    String(assignment.id) !== String(trip.assignmentId)
  ) {
    throw new ExecutionScopeMismatchError();
  }
}

function result(
  service: Service,
  assignment: Assignment,
  trip: Trip,
  serviceEvents: readonly ServiceDomainEvent[],
  assignmentEvents: readonly AssignmentDomainEvent[],
  tripEvents: readonly TripDomainEvent[]
): ExecutionOrchestrationResult {
  return Object.freeze({
    service,
    assignment,
    trip,
    events: Object.freeze({
      service: Object.freeze([...serviceEvents]),
      assignment: Object.freeze([...assignmentEvents]),
      trip: Object.freeze([...tripEvents]),
    }),
  });
}

export function startAssignedServiceExecution(
  input: ExecutionAggregateSet,
  at: Date
): ExecutionOrchestrationResult {
  assertLinked(input);
  if (
    input.service.status === "IN_EXECUTION" &&
    input.assignment.status === "ACTIVE" &&
    input.trip.status === "ONGOING"
  ) {
    return result(input.service, input.assignment, input.trip, [], [], []);
  }
  if (
    input.service.status !== "READY_FOR_ASSIGNMENT" ||
    input.assignment.status !== "CONFIRMED" ||
    input.trip.status !== "ARRIVED"
  ) {
    throw new ExecutionStateMismatchError();
  }
  const service = markServiceInExecution(input.service, at);
  const assignment = activateAssignment(input.assignment, at);
  const trip = startTrip(input.trip, at);
  return result(
    service.service,
    assignment.assignment,
    trip.trip,
    service.events,
    assignment.events,
    trip.events
  );
}

export function completeAssignedServiceExecution(
  input: ExecutionAggregateSet,
  at: Date
): ExecutionOrchestrationResult {
  assertLinked(input);
  if (
    input.service.status === "COMPLETED" &&
    input.assignment.status === "COMPLETED" &&
    input.trip.status === "COMPLETED"
  ) {
    return result(input.service, input.assignment, input.trip, [], [], []);
  }
  if (
    input.service.status !== "IN_EXECUTION" ||
    input.assignment.status !== "ACTIVE" ||
    input.trip.status !== "ONGOING"
  ) {
    throw new ExecutionStateMismatchError();
  }
  const service = completeService(input.service, at);
  const assignment = completeAssignment(input.assignment, at);
  const trip = completeTrip(input.trip, at);
  return result(
    service.service,
    assignment.assignment,
    trip.trip,
    service.events,
    assignment.events,
    trip.events
  );
}
