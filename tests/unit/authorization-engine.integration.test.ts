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
  createSecurityContextFromPrincipal,
  enrichPrincipalWithResolvedAuthorization,
  updateOrganizationMembershipStatus,
} from "@/lib/modules/identity";
import {
  InMemoryMembershipRoleRepository,
  InMemoryOrganizationMembershipRepository,
  InMemoryPermissionRepository,
  InMemoryPermissionResolver,
  InMemoryRolePermissionRepository,
  InMemoryRoleRepository,
} from "@/lib/modules/identity/infrastructure";
import {
  createAuthorizationPolicy,
  evaluateAuthorization,
} from "@/lib/modules/platform";

function createStack() {
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
  return {
    memberships,
    roles,
    permissions,
    membershipRoles,
    rolePermissions,
    resolver,
  };
}

describe("Principal → Resolver → Authorization Engine integration", () => {
  it("ACTIVE membership + ACTIVE role + ACTIVE permission → ALLOWED", async () => {
    const stack = createStack();
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const userId = asUserId(randomUUID());
    const actorId = asActorId(userId);

    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId,
      userId,
    });
    await stack.memberships.save(membership);

    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "dispatcher",
      displayName: "Dispatcher",
    });
    await stack.roles.save(role);

    const permission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "booking",
      action: "read",
    });
    await stack.permissions.save(permission);
    await stack.membershipRoles.assign(tenantId, membership.id, role.id);
    await stack.rolePermissions.assign(tenantId, role.id, permission.id);

    const basePrincipal = createAuthenticatedPrincipal({
      actorId,
      userId,
      tenantId,
      organizationId,
      authenticationMethod: "DEVELOPMENT_STUB",
    });
    const principal = await enrichPrincipalWithResolvedAuthorization(
      basePrincipal,
      stack.resolver
    );
    const context = createSecurityContextFromPrincipal(principal);

    expect(context.roles).toEqual(["dispatcher"]);
    expect(context.permissions).toEqual(["booking.read"]);

    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
      dataVisibility: "FULL",
    });
    const decision = evaluateAuthorization(
      {
        actorId: context.actorId,
        userId: context.userId,
        authenticationState: context.authenticationState,
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        grantedPermissions: context.permissions,
        requiredPermission: "booking.read",
        requiredScope: "ORGANIZATION",
        resourceTenantId: tenantId,
        resourceOrganizationId: organizationId,
        requestId: randomUUID(),
      },
      policy
    );

    expect(decision.decision).toBe("ALLOWED");
    expect(decision.reasonCode).toBe("ALLOWED");
  });

  it("SUSPENDED membership → empty grants → DENIED", async () => {
    const stack = createStack();
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const userId = asUserId(randomUUID());

    let membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId,
      userId,
    });
    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "dispatcher",
      displayName: "Dispatcher",
    });
    const permission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "booking",
      action: "read",
    });
    await stack.roles.save(role);
    await stack.permissions.save(permission);
    await stack.memberships.save(membership);
    await stack.membershipRoles.assign(tenantId, membership.id, role.id);
    await stack.rolePermissions.assign(tenantId, role.id, permission.id);

    membership = updateOrganizationMembershipStatus(membership, "SUSPENDED");
    await stack.memberships.save(membership);

    const principal = await enrichPrincipalWithResolvedAuthorization(
      createAuthenticatedPrincipal({
        actorId: asActorId(userId),
        userId,
        tenantId,
        organizationId,
        authenticationMethod: "DEVELOPMENT_STUB",
      }),
      stack.resolver
    );
    expect(principal.permissions).toEqual([]);

    const decision = evaluateAuthorization(
      {
        actorId: principal.actorId,
        userId: principal.userId,
        authenticationState: "AUTHENTICATED",
        tenantId,
        organizationId,
        grantedPermissions: principal.permissions,
        requiredPermission: "booking.read",
        requiredScope: "ORGANIZATION",
        resourceTenantId: tenantId,
        resourceOrganizationId: organizationId,
        requestId: randomUUID(),
      },
      createAuthorizationPolicy({
        requiredPermission: "booking.read",
        requiredScope: "ORGANIZATION",
      })
    );
    expect(decision.reasonCode).toBe("PERMISSION_MISSING");
  });

  it("DISABLED permission is not granted → DENIED", async () => {
    const stack = createStack();
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const userId = asUserId(randomUUID());
    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId,
      userId,
    });
    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "dispatcher",
      displayName: "Dispatcher",
    });
    const permission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "booking",
      action: "cancel",
      status: "DISABLED",
    });
    await stack.memberships.save(membership);
    await stack.roles.save(role);
    await stack.permissions.save(permission);
    await stack.membershipRoles.assign(tenantId, membership.id, role.id);
    await stack.rolePermissions.assign(tenantId, role.id, permission.id);

    const principal = await enrichPrincipalWithResolvedAuthorization(
      createAuthenticatedPrincipal({
        actorId: asActorId(userId),
        userId,
        tenantId,
        organizationId,
        authenticationMethod: "DEVELOPMENT_STUB",
      }),
      stack.resolver
    );
    expect(principal.permissions).toEqual([]);
    expect(principal.roles).toEqual(["dispatcher"]);

    const decision = evaluateAuthorization(
      {
        actorId: principal.actorId,
        userId: principal.userId,
        authenticationState: "AUTHENTICATED",
        tenantId,
        organizationId,
        grantedPermissions: principal.permissions,
        requiredPermission: "booking.cancel",
        requiredScope: "ORGANIZATION",
        resourceTenantId: tenantId,
        resourceOrganizationId: organizationId,
        requestId: randomUUID(),
      },
      createAuthorizationPolicy({
        requiredPermission: "booking.cancel",
        requiredScope: "ORGANIZATION",
      })
    );
    expect(decision.reasonCode).toBe("PERMISSION_MISSING");
  });

  it("organization mismatch → DENIED", async () => {
    const stack = createStack();
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const otherOrg = asOrganizationId(randomUUID());
    const userId = asUserId(randomUUID());
    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId,
      userId,
    });
    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "owner",
      displayName: "Owner",
    });
    const permission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "booking",
      action: "read",
    });
    await stack.memberships.save(membership);
    await stack.roles.save(role);
    await stack.permissions.save(permission);
    await stack.membershipRoles.assign(tenantId, membership.id, role.id);
    await stack.rolePermissions.assign(tenantId, role.id, permission.id);

    const principal = await enrichPrincipalWithResolvedAuthorization(
      createAuthenticatedPrincipal({
        actorId: asActorId(userId),
        userId,
        tenantId,
        organizationId,
        authenticationMethod: "DEVELOPMENT_STUB",
      }),
      stack.resolver
    );

    const decision = evaluateAuthorization(
      {
        actorId: principal.actorId,
        userId: principal.userId,
        authenticationState: "AUTHENTICATED",
        tenantId,
        organizationId,
        grantedPermissions: principal.permissions,
        requiredPermission: "booking.read",
        requiredScope: "ORGANIZATION",
        resourceTenantId: tenantId,
        resourceOrganizationId: otherOrg,
        requestId: randomUUID(),
      },
      createAuthorizationPolicy({
        requiredPermission: "booking.read",
        requiredScope: "ORGANIZATION",
      })
    );
    expect(decision.reasonCode).toBe("ORGANIZATION_MISMATCH");
  });

  it("Role name alone never implies Permission", async () => {
    const decision = evaluateAuthorization(
      {
        actorId: asActorId(randomUUID()),
        userId: asUserId(randomUUID()),
        authenticationState: "AUTHENTICATED",
        tenantId: asTenantId(randomUUID()),
        organizationId: asOrganizationId(randomUUID()),
        grantedPermissions: [],
        requiredPermission: "booking.read",
        requiredScope: "ORGANIZATION",
        resourceTenantId: asTenantId(randomUUID()),
        resourceOrganizationId: asOrganizationId(randomUUID()),
        requestId: randomUUID(),
      },
      createAuthorizationPolicy({
        requiredPermission: "booking.read",
        requiredScope: "ORGANIZATION",
      })
    );
    expect(decision.reasonCode).toBe("PERMISSION_MISSING");
  });
});
