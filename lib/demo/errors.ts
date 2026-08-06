export class DemoValidationError extends Error {
  readonly name = "DemoValidationError";

  constructor(message = "Invalid demo input") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DemoNotAvailableError extends Error {
  readonly name = "DemoNotAvailableError";

  constructor(message = "Demo is not available") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DemoIdempotencyConflictError extends Error {
  readonly name = "DemoIdempotencyConflictError";

  constructor(message = "Demo submission conflict") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DemoOrchestrationError extends Error {
  readonly name = "DemoOrchestrationError";

  constructor(message = "Demo orchestration failed") {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Map Domain/Application errors to UI-safe messages (no PII, no keys). */
export function mapDemoErrorForUi(error: unknown): {
  readonly code: string;
  readonly messageIt: string;
  readonly messageEn: string;
} {
  if (error instanceof DemoValidationError) {
    return {
      code: "VALIDATION",
      messageIt: "Controlla i dati inseriti e riprova.",
      messageEn: "Check the entered data and try again.",
    };
  }
  if (error instanceof DemoIdempotencyConflictError) {
    return {
      code: "IDEMPOTENCY",
      messageIt: "Richiesta in conflitto con una precedente. Usa Reset demo.",
      messageEn: "Request conflicts with a previous one. Use Reset demo.",
    };
  }
  if (error instanceof DemoNotAvailableError) {
    return {
      code: "UNAVAILABLE",
      messageIt: "La demo non è disponibile in questo ambiente.",
      messageEn: "The demo is not available in this environment.",
    };
  }
  return {
    code: "FAILED",
    messageIt: "Operazione non riuscita. Riprova o resetta la demo.",
    messageEn: "Operation failed. Retry or reset the demo.",
  };
}
