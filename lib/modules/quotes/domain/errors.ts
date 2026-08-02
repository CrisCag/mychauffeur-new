/**
 * Domain / application errors for quotes module.
 * Messages are deterministic and must not include PII or sensitive financial detail.
 */

export class DomainValidationError extends Error {
  readonly name = "DomainValidationError";

  constructor(message = "Invalid domain data") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidQuoteIdError extends Error {
  readonly name = "InvalidQuoteIdError";

  constructor(message = "Invalid QuoteId") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidQuoteNumberError extends Error {
  readonly name = "InvalidQuoteNumberError";

  constructor(message = "Invalid QuoteNumber") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidQuoteStateTransitionError extends Error {
  readonly name = "InvalidQuoteStateTransitionError";

  constructor(message = "Invalid Quote state transition") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MissingQuoteProposalError extends Error {
  readonly name = "MissingQuoteProposalError";

  constructor(message = "Quote issue requires complete commercial proposals") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class QuoteExpiredError extends Error {
  readonly name = "QuoteExpiredError";

  constructor(message = "Quote version is expired") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class QuoteAcceptanceConflictError extends Error {
  readonly name = "QuoteAcceptanceConflictError";

  constructor(message = "Quote acceptance command conflict") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class QuoteVersionConflictError extends Error {
  readonly name = "QuoteVersionConflictError";

  constructor(message = "Quote version conflict") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class QuoteNotFoundError extends Error {
  readonly name = "QuoteNotFoundError";

  constructor(message = "Quote not found") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DuplicateQuoteNumberError extends Error {
  readonly name = "DuplicateQuoteNumberError";

  constructor(message = "QuoteNumber already exists in scope") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class QuoteHistoryImmutableError extends Error {
  readonly name = "QuoteHistoryImmutableError";

  constructor(message = "Issued QuoteVersion history is append-only") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MissingQuoteCustomerError extends Error {
  readonly name = "MissingQuoteCustomerError";

  constructor(message = "Quote requires customerId or guestCustomerSnapshot") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
