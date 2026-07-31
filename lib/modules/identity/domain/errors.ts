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

export class DuplicateMembershipError extends Error {
  readonly name = "DuplicateMembershipError";

  constructor(message = "Membership already exists in scope") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateRoleCodeError extends Error {
  readonly name = "DuplicateRoleCodeError";

  constructor(message = "Role code already exists in scope") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicatePermissionCodeError extends Error {
  readonly name = "DuplicatePermissionCodeError";

  constructor(message = "Permission code already exists") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthorizationScopeError extends Error {
  readonly name = "AuthorizationScopeError";

  constructor(message = "Authorization scope mismatch") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
