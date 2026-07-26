import {
  createAuthenticatedSecurityContext,
  type SecurityContext,
} from "@/lib/modules/platform";
import type { AuthenticatedPrincipal } from "./authenticated-principal";

/**
 * Pure mapping from AuthenticatedPrincipal → SecurityContext.
 * Does not add implicit permissions (deny-by-default preserved).
 */
export function createSecurityContextFromPrincipal(
  principal: AuthenticatedPrincipal
): SecurityContext {
  return createAuthenticatedSecurityContext({
    actorId: principal.actorId,
    userId: principal.userId,
    tenantId: principal.tenantId,
    organizationId: principal.organizationId,
    roles: principal.roles,
    permissions: principal.permissions,
  });
}
