export type { TripRepository } from "./application/trip-repository";
export {
  createTripForConfirmedAssignment,
  type CreateTripForConfirmedAssignmentInput,
} from "./application/create-trip-for-confirmed-assignment";
export {
  cancelTrip,
  completeTrip,
  createScheduledTrip,
  disruptTrip,
  markCustomerNoShow,
  markDriverNoShow,
  markTripArrived,
  markTripEnRoute,
  rehydrateTrip,
  startTrip,
  type CreateScheduledTripInput,
  type RehydrateTripInput,
  type Trip,
  type TripOperationResult,
} from "./domain/trip";
export type { TripDomainEvent, TripDomainEventType } from "./domain/trip-events";
export {
  TRIP_STATUSES,
  isCurrentTripStatus,
  isTerminalTripStatus,
  isTripStatus,
  type TripStatus,
} from "./domain/trip-status";
export {
  AssignmentNotConfirmedForTripError,
  CurrentTripConflictError,
  InvalidTripStateTransitionError,
  TripDomainValidationError,
  TripScopeMismatchError,
  TripVersionConflictError,
} from "./domain/errors";
export {
  asTripAssignmentId,
  asTripId,
  asTripServiceId,
  type TripAssignmentId,
  type TripId,
  type TripServiceId,
} from "./domain/identifiers";
export { InMemoryTripRepository } from "./infrastructure";
