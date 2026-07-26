/**
 * Application authorization failure.
 * Message is intentional and non-sensitive (no resource/actor details).
 */
export class AuthorizationDeniedError extends Error {
  readonly name = "AuthorizationDeniedError";

  constructor() {
    super("Authorization denied");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
