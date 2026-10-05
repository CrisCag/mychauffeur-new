export class TripDomainValidationError extends Error {
  readonly name = "TripDomainValidationError";
}

export class InvalidTripStateTransitionError extends Error {
  readonly name = "InvalidTripStateTransitionError";

  constructor(message = "Trip state transition is invalid") {
    super(message);
  }
}

export class TripVersionConflictError extends Error {
  readonly name = "TripVersionConflictError";

  constructor(message = "Trip version conflict") {
    super(message);
  }
}

export class CurrentTripConflictError extends Error {
  readonly name = "CurrentTripConflictError";

  constructor(message = "Service already has a current Trip") {
    super(message);
  }
}

export class AssignmentNotConfirmedForTripError extends Error {
  readonly name = "AssignmentNotConfirmedForTripError";

  constructor(message = "Assignment is not confirmed for Trip creation") {
    super(message);
  }
}

export class TripScopeMismatchError extends Error {
  readonly name = "TripScopeMismatchError";

  constructor(message = "Trip scope mismatch") {
    super(message);
  }
}
