import type { AuthenticatedPrincipal } from "./authenticated-principal";
import { createAuthenticatedPrincipal } from "./authenticated-principal";
import type { PermissionResolver } from "./permission-resolver";

/**
 * Pure application helper: builds a new AuthenticatedPrincipal with roles and
 * permissions from PermissionResolver. Does not mutate the input principal.
 * Not wired to routes or Auth providers in Step 3.
 */
export async function enrichPrincipalWithResolvedAuthorization(
  principal: AuthenticatedPrincipal,
  resolver: PermissionResolver
): Promise<AuthenticatedPrincipal> {
  const resolved = await resolver.resolvePermissions({
    tenantId: principal.tenantId,
    organizationId: principal.organizationId,
    userId: principal.userId,
  });

  return createAuthenticatedPrincipal({
    actorId: principal.actorId,
    userId: principal.userId,
    tenantId: principal.tenantId,
    organizationId: principal.organizationId,
    authenticationMethod: principal.authenticationMethod,
    authenticatedAt: principal.authenticatedAt,
    sessionId: principal.sessionId,
    roles: resolved.roles,
    permissions: resolved.permissions,
  });
}
