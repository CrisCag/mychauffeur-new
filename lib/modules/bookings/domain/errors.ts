/**
 * Domain / application errors for bookings module.
 * Messages are deterministic and must not include PII.
 */

export class DomainValidationError extends Error {
  readonly name = "DomainValidationError";

  constructor(message = "Invalid domain data") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidBookingIdError extends Error {
  readonly name = "InvalidBookingIdError";

  constructor(message = "Invalid BookingId") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidBookingNumberError extends Error {
  readonly name = "InvalidBookingNumberError";

  constructor(message = "Invalid BookingNumber") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidBookingStateTransitionError extends Error {
  readonly name = "InvalidBookingStateTransitionError";

  constructor(message = "Invalid Booking state transition") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MissingBookingCustomerError extends Error {
  readonly name = "MissingBookingCustomerError";

  constructor(message = "Booking requires customerId or guestCustomerSnapshot") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BookingTenantMismatchError extends Error {
  readonly name = "BookingTenantMismatchError";

  constructor(message = "Booking tenant scope mismatch") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BookingOrganizationMismatchError extends Error {
  readonly name = "BookingOrganizationMismatchError";

  constructor(message = "Booking organization scope mismatch") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BookingVersionConflictError extends Error {
  readonly name = "BookingVersionConflictError";

  constructor(message = "Booking version conflict") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BookingNotFoundError extends Error {
  readonly name = "BookingNotFoundError";

  constructor(message = "Booking not found") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateBookingNumberError extends Error {
  readonly name = "DuplicateBookingNumberError";

  constructor(message = "BookingNumber already exists in scope") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
