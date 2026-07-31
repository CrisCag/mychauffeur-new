import type {
  AuthorizationScope,
  DataVisibility,
} from "./authorization-types";

export type AuthorizationPolicy = {
  readonly requiredPermission: string;
  readonly requiredScope: AuthorizationScope;
  readonly dataVisibility: DataVisibility;
  readonly auditRequired: boolean;
  readonly sensitiveOperation: boolean;
};

export type CreateAuthorizationPolicyInput = {
  requiredPermission: string;
  requiredScope: AuthorizationScope;
  dataVisibility?: DataVisibility;
  auditRequired?: boolean;
  sensitiveOperation?: boolean;
};

/**
 * Pure factory for explicit Use Case policies.
 * Sensitive operations force auditRequired=true. No Role-derived policies.
 */
export function createAuthorizationPolicy(
  input: CreateAuthorizationPolicyInput
): AuthorizationPolicy {
  const sensitiveOperation = input.sensitiveOperation ?? false;
  const defaultVisibility: DataVisibility =
    input.requiredScope === "FINANCIAL_ORGANIZATION"
      ? "FINANCIAL_OWN"
      : "FULL";

  return Object.freeze({
    requiredPermission: input.requiredPermission,
    requiredScope: input.requiredScope,
    dataVisibility: input.dataVisibility ?? defaultVisibility,
    auditRequired: sensitiveOperation ? true : (input.auditRequired ?? false),
    sensitiveOperation,
  });
}

/**
 * Convenience markers for known sensitive Permission codes (MC-OS-029).
 * Prefer explicit policy.sensitiveOperation on Use Cases; this is not a Role map.
 */
export function isKnownSensitivePermission(permission: string): boolean {
  switch (permission) {
    case "membership.manage":
    case "role.manage":
    case "permission.assign":
    case "pricing.manage":
    case "finance.read":
    case "audit.read":
    case "platform.tenant.manage":
    case "platform.organization.suspend":
    case "platform.configuration.manage":
    case "platform.security.incident.manage":
    case "reconciliation.manage":
      return true;
    default:
      return false;
  }
}
