import type {
  AuthorizationReasonCode,
  AuthorizationScope,
} from "./authorization-types";

export type AuthorizationDeniedErrorDetails = {
  readonly reasonCode: AuthorizationReasonCode;
  readonly requiredPermission: string;
  readonly evaluatedScope: AuthorizationScope;
  readonly requestId: string;
};

/**
 * Application authorization failure for Use Cases that prefer exceptions.
 * Message is intentional and non-sensitive (no PII, tokens, claims, or resource payloads).
 */
export class AuthorizationDeniedError extends Error {
  readonly name = "AuthorizationDeniedError";
  readonly reasonCode?: AuthorizationReasonCode;
  readonly requiredPermission?: string;
  readonly evaluatedScope?: AuthorizationScope;
  readonly requestId?: string;

  constructor(details?: AuthorizationDeniedErrorDetails) {
    super("Authorization denied");
    Object.setPrototypeOf(this, new.target.prototype);
    if (details) {
      this.reasonCode = details.reasonCode;
      this.requiredPermission = details.requiredPermission;
      this.evaluatedScope = details.evaluatedScope;
      this.requestId = details.requestId;
    }
  }
}
