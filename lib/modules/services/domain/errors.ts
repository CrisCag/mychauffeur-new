/**
 * Domain / application errors for services module.
 * Messages must not include PII (names, email, phone, addresses).
 */

export class DomainValidationError extends Error {
  readonly name = "DomainValidationError";

  constructor(message = "Invalid domain data") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidServiceIdError extends Error {
  readonly name = "InvalidServiceIdError";

  constructor(message = "Invalid ServiceId") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidServiceNumberError extends Error {
  readonly name = "InvalidServiceNumberError";

  constructor(message = "Invalid ServiceNumber") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidServiceStateTransitionError extends Error {
  readonly name = "InvalidServiceStateTransitionError";

  constructor(message = "Invalid Service state transition") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ServiceVersionConflictError extends Error {
  readonly name = "ServiceVersionConflictError";

  constructor(message = "Service version conflict") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ServiceNotFoundError extends Error {
  readonly name = "ServiceNotFoundError";

  constructor(message = "Service not found") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateServiceNumberError extends Error {
  readonly name = "DuplicateServiceNumberError";

  constructor(message = "ServiceNumber already exists in scope") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateServiceGenerationKeyError extends Error {
  readonly name = "DuplicateServiceGenerationKeyError";

  constructor(message = "Service generation key already exists in scope") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateServiceSequenceError extends Error {
  readonly name = "DuplicateServiceSequenceError";

  constructor(message = "Service sequence already exists for Booking in scope") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ServiceBookingNotEligibleError extends Error {
  readonly name = "ServiceBookingNotEligibleError";

  constructor(message = "Booking is not eligible for Service generation") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ServiceCancellationConflictError extends Error {
  readonly name = "ServiceCancellationConflictError";

  constructor(message = "Service cancellation reason conflict") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
