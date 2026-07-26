/**
 * Domain errors for the identity module.
 * Messages are intentional and non-sensitive.
 */
export class DomainValidationError extends Error {
  readonly name = "DomainValidationError";

  constructor(message = "Invalid domain data") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateExternalIdentityError extends Error {
  readonly name = "DuplicateExternalIdentityError";

  constructor(message = "External identity already exists") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
