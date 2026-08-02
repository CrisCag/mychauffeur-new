/**
 * Domain / application errors for customers module.
 * Messages must not include PII (names, email, phone).
 */

export class DomainValidationError extends Error {
  readonly name = "DomainValidationError";

  constructor(message = "Invalid domain data") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCustomerIdError extends Error {
  readonly name = "InvalidCustomerIdError";

  constructor(message = "Invalid CustomerId") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCustomerNumberError extends Error {
  readonly name = "InvalidCustomerNumberError";

  constructor(message = "Invalid CustomerNumber") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCustomerStateTransitionError extends Error {
  readonly name = "InvalidCustomerStateTransitionError";

  constructor(message = "Invalid Customer state transition") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CustomerIdentityLinkConflictError extends Error {
  readonly name = "CustomerIdentityLinkConflictError";

  constructor(message = "Customer identity link conflict") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CustomerVersionConflictError extends Error {
  readonly name = "CustomerVersionConflictError";

  constructor(message = "Customer version conflict") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CustomerNotFoundError extends Error {
  readonly name = "CustomerNotFoundError";

  constructor(message = "Customer not found") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateCustomerNumberError extends Error {
  readonly name = "DuplicateCustomerNumberError";

  constructor(message = "CustomerNumber already exists in scope") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateIdentitySubjectError extends Error {
  readonly name = "DuplicateIdentitySubjectError";

  constructor(
    message = "IdentitySubjectId already linked in organization scope"
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
