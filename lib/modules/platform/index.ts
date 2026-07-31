export type {
  AuthenticationState,
  AuthenticatedSecurityContextInput,
  SecurityContext,
} from "./security/security-context";

export {
  createAnonymousSecurityContext,
  createAuthenticatedSecurityContext,
  hasPermission,
  requirePermission,
} from "./security/security-context";

export { AuthorizationDeniedError } from "./security/authorization-denied-error";

export type {
  AuthorizationDecision,
  AuthorizationDecisionInput,
  AuthorizationDecisionKind,
  AuthorizationPolicy,
  AuthorizationReasonCode,
  AuthorizationScope,
  CreateAuthorizationPolicyInput,
  DataVisibility,
} from "./security/authorization";

export {
  AUTHORIZATION_SCOPES,
  DATA_VISIBILITIES,
  createAuthorizationPolicy,
  evaluateAuthorization,
  hasExactPermission,
  isAllowed,
  isKnownSensitivePermission,
  requireAllowed,
} from "./security/authorization";
