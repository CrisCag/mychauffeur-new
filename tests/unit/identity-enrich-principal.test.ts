import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asActorId,
  asMembershipId,
  asOrganizationId,
  asPermissionId,
  asRoleId,
  asTenantId,
  asUserId,
  createAuthenticatedPrincipal,
  createOrganizationMembership,
  createPermission,
  createRole,
  enrichPrincipalWithResolvedAuthorization,
} from "@/lib/modules/identity";
import {
  InMemoryMembershipRoleRepository,
  InMemoryOrganizationMembershipRepository,
  InMemoryPermissionRepository,
  InMemoryPermissionResolver,
  InMemoryRolePermissionRepository,
  InMemoryRoleRepository,
} from "@/lib/modules/identity/infrastructure";

describe("enrichPrincipalWithResolvedAuthorization", () => {
  it("returns a new principal with resolved roles/permissions without mutating input", async () => {
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const userId = asUserId(randomUUID());

    const memberships = new InMemoryOrganizationMembershipRepository();
    const roles = new InMemoryRoleRepository();
    const permissions = new InMemoryPermissionRepository();
    const membershipRoles = new InMemoryMembershipRoleRepository(
      memberships,
      roles
    );
    const rolePermissions = new InMemoryRolePermissionRepository(
      roles,
      permissions
    );
    const resolver = new InMemoryPermissionResolver(
      memberships,
      roles,
      permissions,
      membershipRoles,
      rolePermissions
    );

    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId,
      userId,
    });
    await memberships.save(membership);
    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "dispatcher",
      displayName: "Dispatcher",
    });
    await roles.save(role);
    const permission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "booking",
      action: "create",
    });
    await permissions.save(permission);
    await membershipRoles.assign(tenantId, membership.id, role.id);
    await rolePermissions.assign(tenantId, role.id, permission.id);

    const principal = createAuthenticatedPrincipal({
      actorId: asActorId(userId),
      userId,
      tenantId,
      organizationId,
      authenticationMethod: "DEVELOPMENT_STUB",
      roles: [],
      permissions: [],
    });

    const enriched = await enrichPrincipalWithResolvedAuthorization(
      principal,
      resolver
    );

    expect(principal.roles).toEqual([]);
    expect(principal.permissions).toEqual([]);
    expect(enriched).not.toBe(principal);
    expect(enriched.roles).toEqual(["dispatcher"]);
    expect(enriched.permissions).toEqual(["booking.create"]);
  });

  it("yields empty authorization when membership is absent", async () => {
    const memberships = new InMemoryOrganizationMembershipRepository();
    const roles = new InMemoryRoleRepository();
    const permissions = new InMemoryPermissionRepository();
    const membershipRoles = new InMemoryMembershipRoleRepository(
      memberships,
      roles
    );
    const rolePermissions = new InMemoryRolePermissionRepository(
      roles,
      permissions
    );
    const resolver = new InMemoryPermissionResolver(
      memberships,
      roles,
      permissions,
      membershipRoles,
      rolePermissions
    );

    const principal = createAuthenticatedPrincipal({
      actorId: asActorId(randomUUID()),
      userId: asUserId(randomUUID()),
      tenantId: asTenantId(randomUUID()),
      organizationId: asOrganizationId(randomUUID()),
      authenticationMethod: "DEVELOPMENT_STUB",
      roles: ["stale"],
      permissions: ["stale.perm"],
    });

    const enriched = await enrichPrincipalWithResolvedAuthorization(
      principal,
      resolver
    );
    expect(enriched.roles).toEqual([]);
    expect(enriched.permissions).toEqual([]);
  });
});
