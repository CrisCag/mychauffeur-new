export type {
  AuthorizationDecision,
  AuthorizationDecisionInput,
  AuthorizationDecisionKind,
  AuthorizationReasonCode,
  AuthorizationScope,
  DataVisibility,
} from "./authorization-types";

export {
  AUTHORIZATION_SCOPES,
  DATA_VISIBILITIES,
} from "./authorization-types";

export type { AuthorizationPolicy, CreateAuthorizationPolicyInput } from "./authorization-policy";
export {
  createAuthorizationPolicy,
  isKnownSensitivePermission,
} from "./authorization-policy";

export {
  evaluateAuthorization,
  hasExactPermission,
  isAllowed,
  requireAllowed,
} from "./authorization-engine";

export {
  AuthorizationDeniedError,
  type AuthorizationDeniedErrorDetails,
} from "./authorization-errors";
