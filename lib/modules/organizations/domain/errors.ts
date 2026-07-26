/**
 * Domain / application errors for organizations module.
 * Messages are intentional and non-sensitive.
 */
export class DomainValidationError extends Error {
  readonly name = "DomainValidationError";

  constructor(message = "Invalid domain data") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateCodeError extends Error {
  readonly name = "DuplicateCodeError";

  constructor(message = "Code already exists in scope") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TenantScopeMismatchError extends Error {
  readonly name = "TenantScopeMismatchError";

  constructor(message = "Tenant scope mismatch") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PersistenceError extends Error {
  readonly name = "PersistenceError";

  constructor(message = "Persistence operation failed") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
