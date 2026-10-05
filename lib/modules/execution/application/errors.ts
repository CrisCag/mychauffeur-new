export class ExecutionScopeMismatchError extends Error {
  readonly name = "ExecutionScopeMismatchError";

  constructor(message = "Execution aggregate scope mismatch") {
    super(message);
  }
}

export class ExecutionStateMismatchError extends Error {
  readonly name = "ExecutionStateMismatchError";

  constructor(message = "Execution aggregate state mismatch") {
    super(message);
  }
}
