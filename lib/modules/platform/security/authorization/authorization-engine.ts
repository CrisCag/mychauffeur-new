import type { AuthorizationPolicy } from "./authorization-policy";
import { AuthorizationDeniedError } from "./authorization-errors";
import type {
  AuthorizationDecision,
  AuthorizationDecisionInput,
  AuthorizationReasonCode,
  AuthorizationScope,
  DataVisibility,
} from "./authorization-types";

function deny(
  input: AuthorizationDecisionInput,
  policy: AuthorizationPolicy,
  reasonCode: AuthorizationReasonCode,
  missingPermissions: readonly string[],
  dataVisibility: DataVisibility | null
): AuthorizationDecision {
  return Object.freeze({
    decision: "DENIED",
    reasonCode,
    requiredPermission: policy.requiredPermission,
    evaluatedScope: policy.requiredScope,
    missingPermissions: Object.freeze([...missingPermissions]),
    auditRequired: policy.auditRequired,
    dataVisibility,
    evaluatedAt: new Date(),
  });
}

function allow(
  policy: AuthorizationPolicy,
  dataVisibility: DataVisibility
): AuthorizationDecision {
  return Object.freeze({
    decision: "ALLOWED",
    reasonCode: "ALLOWED",
    requiredPermission: policy.requiredPermission,
    evaluatedScope: policy.requiredScope,
    missingPermissions: Object.freeze([]),
    auditRequired: policy.auditRequired,
    dataVisibility,
    evaluatedAt: new Date(),
  });
}

/**
 * Exact, case-sensitive Permission membership check.
 * No wildcard, no Role→Permission transformation, no code rewriting.
 */
export function hasExactPermission(
  grantedPermissions: readonly string[],
  requiredPermission: string
): boolean {
  return grantedPermissions.includes(requiredPermission);
}

/**
 * Privilege rank for Data Visibility: higher = more data exposure.
 * requestedDataVisibility may only narrow (or equal) the policy grant — never amplify.
 */
function dataVisibilityRank(visibility: DataVisibility): number {
  switch (visibility) {
    case "FULL":
      return 100;
    case "LIMITED":
      return 80;
    case "PROGRESSIVE":
      return 70;
    case "MASKED":
      return 60;
    case "OPERATIONAL_ONLY":
      return 50;
    case "FINANCIAL_OWN":
      return 50;
    case "INTERNAL_ONLY":
      return 40;
    default: {
      const _exhaustive: never = visibility;
      void _exhaustive;
      return 0;
    }
  }
}

/**
 * Policy is authoritative for the maximum granted visibility.
 * A request may only select an equal or more restrictive visibility.
 */
function resolveDataVisibility(
  input: AuthorizationDecisionInput,
  policy: AuthorizationPolicy
): DataVisibility {
  const granted = policy.dataVisibility;
  const requested = input.requestedDataVisibility;
  if (requested === undefined) {
    return granted;
  }
  if (dataVisibilityRank(requested) <= dataVisibilityRank(granted)) {
    return requested;
  }
  return granted;
}

function evaluateScope(
  input: AuthorizationDecisionInput,
  scope: AuthorizationScope
): AuthorizationReasonCode | null {
  switch (scope) {
    case "PLATFORM":
      // Permission already verified; no implicit super-admin / no tenant bypass.
      return null;

    case "TENANT": {
      if (
        input.tenantId === null ||
        input.resourceTenantId === null ||
        input.tenantId !== input.resourceTenantId
      ) {
        return "TENANT_MISMATCH";
      }
      return null;
    }

    case "ORGANIZATION": {
      if (
        input.tenantId === null ||
        input.resourceTenantId === null ||
        input.tenantId !== input.resourceTenantId
      ) {
        return "TENANT_MISMATCH";
      }
      if (
        input.organizationId === null ||
        input.resourceOrganizationId === null ||
        input.organizationId !== input.resourceOrganizationId
      ) {
        return "ORGANIZATION_MISMATCH";
      }
      return null;
    }

    case "OWN_RECORDS": {
      if (
        input.tenantId === null ||
        input.resourceTenantId === null ||
        input.tenantId !== input.resourceTenantId
      ) {
        return "TENANT_MISMATCH";
      }
      if (
        input.resourceOrganizationId !== null &&
        input.resourceOrganizationId !== undefined
      ) {
        if (
          input.organizationId === null ||
          input.organizationId !== input.resourceOrganizationId
        ) {
          return "ORGANIZATION_MISMATCH";
        }
      }
      if (
        input.resourceOwnerId === undefined ||
        input.resourceOwnerId === null
      ) {
        return "RESOURCE_NOT_AVAILABLE";
      }
      if (
        input.actorId === null ||
        input.actorId !== input.resourceOwnerId
      ) {
        return "OWNER_SCOPE_MISMATCH";
      }
      return null;
    }

    case "ASSIGNED_SERVICES": {
      if (
        input.tenantId === null ||
        input.resourceTenantId === null ||
        input.tenantId !== input.resourceTenantId
      ) {
        return "TENANT_MISMATCH";
      }
      if (
        input.organizationId === null ||
        input.resourceOrganizationId === null ||
        input.organizationId !== input.resourceOrganizationId
      ) {
        return "ORGANIZATION_MISMATCH";
      }
      if (
        input.assignedActorId === undefined ||
        input.assignedActorId === null
      ) {
        return "RESOURCE_NOT_AVAILABLE";
      }
      if (
        input.actorId === null ||
        input.actorId !== input.assignedActorId
      ) {
        return "ASSIGNMENT_SCOPE_MISMATCH";
      }
      return null;
    }

    case "CASE_ASSIGNED": {
      if (
        input.tenantId === null ||
        input.resourceTenantId === null ||
        input.tenantId !== input.resourceTenantId
      ) {
        return "TENANT_MISMATCH";
      }
      if (
        input.resourceOrganizationId !== null &&
        input.resourceOrganizationId !== undefined
      ) {
        if (
          input.organizationId === null ||
          input.organizationId !== input.resourceOrganizationId
        ) {
          return "ORGANIZATION_MISMATCH";
        }
      }
      if (
        input.assignedCaseActorId === undefined ||
        input.assignedCaseActorId === null
      ) {
        return "RESOURCE_NOT_AVAILABLE";
      }
      if (
        input.actorId === null ||
        input.actorId !== input.assignedCaseActorId
      ) {
        return "CASE_SCOPE_MISMATCH";
      }
      return null;
    }

    case "FINANCIAL_ORGANIZATION": {
      if (
        input.tenantId === null ||
        input.resourceTenantId === null ||
        input.tenantId !== input.resourceTenantId
      ) {
        return "TENANT_MISMATCH";
      }
      if (
        input.organizationId === null ||
        input.resourceOrganizationId === null ||
        input.organizationId !== input.resourceOrganizationId
      ) {
        return "ORGANIZATION_MISMATCH";
      }
      return null;
    }

    default: {
      const _exhaustive: never = scope;
      void _exhaustive;
      return "RESOURCE_NOT_AVAILABLE";
    }
  }
}

/**
 * Pure, provider-agnostic Authorization Engine (deny-by-default).
 * Evaluates authentication → exact Permission → Scope → audit/visibility.
 * Does not evaluate Role names. Normal denial returns Decision (no throw).
 */
export function evaluateAuthorization(
  input: AuthorizationDecisionInput,
  policy: AuthorizationPolicy
): AuthorizationDecision {
  const visibility = resolveDataVisibility(input, policy);

  // 1. Authentication
  if (input.authenticationState !== "AUTHENTICATED") {
    return deny(input, policy, "AUTHENTICATION_REQUIRED", [], null);
  }

  // 2. Exact Permission (case-sensitive). No wildcards. Roles ignored.
  if (
    !hasExactPermission(input.grantedPermissions, policy.requiredPermission)
  ) {
    return deny(
      input,
      policy,
      "PERMISSION_MISSING",
      [policy.requiredPermission],
      null
    );
  }

  // 3. Scope validation
  const scopeFailure = evaluateScope(input, policy.requiredScope);
  if (scopeFailure !== null) {
    return deny(input, policy, scopeFailure, [], null);
  }

  // 4–5. auditRequired from policy; ALLOWED
  return allow(policy, visibility);
}

export function isAllowed(decision: AuthorizationDecision): boolean {
  return decision.decision === "ALLOWED";
}

/**
 * Converts a DENIED decision into AuthorizationDeniedError for Use Cases.
 * Does not include PII or resource payloads.
 */
export function requireAllowed(
  decision: AuthorizationDecision,
  requestId: string
): void {
  if (isAllowed(decision)) {
    return;
  }
  throw new AuthorizationDeniedError({
    reasonCode: decision.reasonCode,
    requiredPermission: decision.requiredPermission,
    evaluatedScope: decision.evaluatedScope,
    requestId,
  });
}
