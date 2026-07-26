import type {
  ActorId,
  OrganizationId,
  TenantId,
  UserId,
} from "@/lib/modules/identity/domain/identifiers";
import { AuthorizationDeniedError } from "./authorization-denied-error";

export type AuthenticationState = "ANONYMOUS" | "AUTHENTICATED";

export type SecurityContext = {
  actorId: ActorId | null;
  userId: UserId | null;
  tenantId: TenantId | null;
  organizationId: OrganizationId | null;
  roles: readonly string[];
  permissions: readonly string[];
  authenticationState: AuthenticationState;
};

export function createAnonymousSecurityContext(): SecurityContext {
  return {
    actorId: null,
    userId: null,
    tenantId: null,
    organizationId: null,
    roles: [],
    permissions: [],
    authenticationState: "ANONYMOUS",
  };
}

export type AuthenticatedSecurityContextInput = {
  actorId: ActorId;
  userId: UserId;
  tenantId: TenantId;
  organizationId: OrganizationId;
  roles?: readonly string[];
  permissions?: readonly string[];
};

export function createAuthenticatedSecurityContext(
  input: AuthenticatedSecurityContextInput
): SecurityContext {
  return {
    actorId: input.actorId,
    userId: input.userId,
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    roles: Object.freeze([...(input.roles ?? [])]),
    permissions: Object.freeze([...(input.permissions ?? [])]),
    authenticationState: "AUTHENTICATED",
  };
}

/** Deny by default: missing permission = false. */
export function hasPermission(
  context: SecurityContext,
  permission: string
): boolean {
  if (context.authenticationState !== "AUTHENTICATED") {
    return false;
  }
  return context.permissions.includes(permission);
}

/**
 * Deny by default. Throws AuthorizationDeniedError when not authorized.
 * No sensitive details in the error.
 */
export function requirePermission(
  context: SecurityContext,
  permission: string
): void {
  if (!hasPermission(context, permission)) {
    throw new AuthorizationDeniedError();
  }
}
