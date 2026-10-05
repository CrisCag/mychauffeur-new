export class FulfillmentScopeMismatchError extends Error {
  readonly name = "FulfillmentScopeMismatchError";

  constructor(message = "Booking fulfillment scope mismatch") {
    super(message);
  }
}

export class FulfillmentServicesRequiredError extends Error {
  readonly name = "FulfillmentServicesRequiredError";

  constructor(message = "Booking fulfillment requires Services") {
    super(message);
  }
}

export class FulfillmentStateMismatchError extends Error {
  readonly name = "FulfillmentStateMismatchError";

  constructor(message = "Booking fulfillment state mismatch") {
    super(message);
  }
}
