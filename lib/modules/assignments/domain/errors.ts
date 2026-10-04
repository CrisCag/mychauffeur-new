export class AssignmentDomainValidationError extends Error {
  readonly name = "AssignmentDomainValidationError";
}

export class InvalidAssignmentStateTransitionError extends Error {
  readonly name = "InvalidAssignmentStateTransitionError";

  constructor(message = "Assignment state transition is invalid") {
    super(message);
  }
}

export class AssignmentVersionConflictError extends Error {
  readonly name = "AssignmentVersionConflictError";

  constructor(message = "Assignment version conflict") {
    super(message);
  }
}

export class ActiveAssignmentConflictError extends Error {
  readonly name = "ActiveAssignmentConflictError";

  constructor(message = "Service already has a current assignment") {
    super(message);
  }
}

export class AssignmentNotFoundError extends Error {
  readonly name = "AssignmentNotFoundError";
}

export class AssignmentServiceNotReadyError extends Error {
  readonly name = "AssignmentServiceNotReadyError";

  constructor(message = "Service is not ready for assignment") {
    super(message);
  }
}

export class AssignmentScopeMismatchError extends Error {
  readonly name = "AssignmentScopeMismatchError";

  constructor(message = "Assignment scope mismatch") {
    super(message);
  }
}
