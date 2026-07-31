import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asMembershipId,
  asOrganizationId,
  asPermissionId,
  asRoleId,
  asTenantId,
  asUserId,
  AuthorizationScopeError,
  createOrganizationMembership,
  createPermission,
  createRole,
  DuplicateMembershipError,
  DuplicatePermissionCodeError,
  DuplicateRoleCodeError,
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

function createAuthStack() {
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

describe("Identity membership/role/permission in-memory contracts", () => {
  it("saves and finds Membership tenant-safe", async () => {
    const { memberships } = createAuthStack();
    const tenantId = asTenantId(randomUUID());
    const otherTenant = asTenantId(randomUUID());
    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId: asOrganizationId(randomUUID()),
      userId: asUserId(randomUUID()),
    });
    await memberships.save(membership);

    await expect(
      memberships.findById(tenantId, membership.id)
    ).resolves.toEqual(membership);
    await expect(
      memberships.findById(otherTenant, membership.id)
    ).resolves.toBeNull();
  });

  it("looks up by user and organization scoped to tenant", async () => {
    const { memberships } = createAuthStack();
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const userId = asUserId(randomUUID());
    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId,
      userId,
    });
    await memberships.save(membership);

    await expect(
      memberships.findByUserAndOrganization(tenantId, userId, organizationId)
    ).resolves.toEqual(membership);
    await expect(
      memberships.findByUser(tenantId, userId)
    ).resolves.toEqual([membership]);
    await expect(
      memberships.findByOrganization(tenantId, organizationId)
    ).resolves.toEqual([membership]);
    await expect(
      memberships.findByUser(asTenantId(randomUUID()), userId)
    ).resolves.toEqual([]);
  });

  it("rejects duplicate Membership in the same scope", async () => {
    const { memberships } = createAuthStack();
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const userId = asUserId(randomUUID());
    await memberships.save(
      createOrganizationMembership({
        id: asMembershipId(randomUUID()),
        tenantId,
        organizationId,
        userId,
      })
    );
    await expect(
      memberships.save(
        createOrganizationMembership({
          id: asMembershipId(randomUUID()),
          tenantId,
          organizationId,
          userId,
        })
      )
    ).rejects.toBeInstanceOf(DuplicateMembershipError);
  });

  it("saves Role and enforces code uniqueness per scope", async () => {
    const { roles } = createAuthStack();
    const tenantId = asTenantId(randomUUID());
    const orgA = asOrganizationId(randomUUID());
    const orgB = asOrganizationId(randomUUID());

    const tenantRole = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "dispatcher",
      displayName: "Dispatcher",
    });
    await roles.save(tenantRole);
    await expect(
      roles.findById(tenantId, tenantRole.id)
    ).resolves.toEqual(tenantRole);

    await expect(
      roles.save(
        createRole({
          id: asRoleId(randomUUID()),
          tenantId,
          code: "dispatcher",
          displayName: "Dup",
        })
      )
    ).rejects.toBeInstanceOf(DuplicateRoleCodeError);

    const orgRoleA = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      organizationId: orgA,
      code: "driver",
      displayName: "Driver A",
    });
    const orgRoleB = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      organizationId: orgB,
      code: "driver",
      displayName: "Driver B",
    });
    await roles.save(orgRoleA);
    await roles.save(orgRoleB);

    const available = await roles.findAvailableForOrganization(tenantId, orgA);
    expect(available.map((role) => role.id).sort()).toEqual(
      [tenantRole.id, orgRoleA.id].sort()
    );
  });

  it("enforces global unique Permission codes", async () => {
    const { permissions } = createAuthStack();
    const permission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "organization",
      action: "read",
    });
    await permissions.save(permission);
    await expect(permissions.findByCode("ORGANIZATION.READ")).resolves.toEqual(
      permission
    );
    await expect(
      permissions.save(
        createPermission({
          id: asPermissionId(randomUUID()),
          resource: "organization",
          action: "read",
        })
      )
    ).rejects.toBeInstanceOf(DuplicatePermissionCodeError);
  });

  it("assigns and revokes MembershipRole with scope checks", async () => {
    const { memberships, roles, membershipRoles } = createAuthStack();
    const tenantId = asTenantId(randomUUID());
    const otherTenant = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId,
      userId: asUserId(randomUUID()),
    });
    await memberships.save(membership);

    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "owner",
      displayName: "Owner",
    });
    await roles.save(role);

    await membershipRoles.assign(tenantId, membership.id, role.id);
    await expect(
      membershipRoles.findRoleIdsByMembership(tenantId, membership.id)
    ).resolves.toEqual([role.id]);

    const foreignRole = createRole({
      id: asRoleId(randomUUID()),
      tenantId: otherTenant,
      code: "owner",
      displayName: "Owner",
    });
    await roles.save(foreignRole);
    await expect(
      membershipRoles.assign(tenantId, membership.id, foreignRole.id)
    ).rejects.toBeInstanceOf(AuthorizationScopeError);

    const otherOrgRole = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      organizationId: asOrganizationId(randomUUID()),
      code: "driver",
      displayName: "Driver",
    });
    await roles.save(otherOrgRole);
    await expect(
      membershipRoles.assign(tenantId, membership.id, otherOrgRole.id)
    ).rejects.toBeInstanceOf(AuthorizationScopeError);

    await membershipRoles.revoke(tenantId, membership.id, role.id);
    await expect(
      membershipRoles.findRoleIdsByMembership(tenantId, membership.id)
    ).resolves.toEqual([]);
  });

  it("assigns and revokes RolePermission", async () => {
    const { roles, permissions, rolePermissions } = createAuthStack();
    const tenantId = asTenantId(randomUUID());
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

    await rolePermissions.assign(tenantId, role.id, permission.id);
    await expect(
      rolePermissions.findPermissionIdsByRole(tenantId, role.id)
    ).resolves.toEqual([permission.id]);

    await rolePermissions.revoke(tenantId, role.id, permission.id);
    await expect(
      rolePermissions.findPermissionIdsByRole(tenantId, role.id)
    ).resolves.toEqual([]);
  });

  it("does not expose global findAll enumeration", () => {
    const stack = createAuthStack();
    expect("findAll" in stack.memberships).toBe(false);
    expect("findAll" in stack.roles).toBe(false);
    expect("findAll" in stack.permissions).toBe(false);
    expect("findAll" in stack.membershipRoles).toBe(false);
    expect("findAll" in stack.rolePermissions).toBe(false);
  });

  it("PermissionResolver is deny-by-default for inactive membership", async () => {
    const {
      memberships,
      roles,
      permissions,
      membershipRoles,
      rolePermissions,
      resolver,
    } = createAuthStack();
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const userId = asUserId(randomUUID());

    let membership = createOrganizationMembership({
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
      action: "read",
    });
    await permissions.save(permission);
    await membershipRoles.assign(tenantId, membership.id, role.id);
    await rolePermissions.assign(tenantId, role.id, permission.id);

    await expect(
      resolver.resolvePermissions({ tenantId, organizationId, userId })
    ).resolves.toEqual({
      roles: ["dispatcher"],
      permissions: ["booking.read"],
    });

    membership = updateOrganizationMembershipStatus(membership, "SUSPENDED");
    await memberships.save(membership);
    await expect(
      resolver.resolvePermissions({ tenantId, organizationId, userId })
    ).resolves.toEqual({ roles: [], permissions: [] });

    membership = updateOrganizationMembershipStatus(membership, "REVOKED");
    await memberships.save(membership);
    await expect(
      resolver.resolvePermissions({ tenantId, organizationId, userId })
    ).resolves.toEqual({ roles: [], permissions: [] });

    await expect(
      resolver.resolvePermissions({
        tenantId,
        organizationId,
        userId: asUserId(randomUUID()),
      })
    ).resolves.toEqual({ roles: [], permissions: [] });
  });

  it("ignores DISABLED roles and permissions during resolution", async () => {
    const {
      memberships,
      roles,
      permissions,
      membershipRoles,
      rolePermissions,
      resolver,
    } = createAuthStack();
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());
    const userId = asUserId(randomUUID());
    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId,
      userId,
    });
    await memberships.save(membership);

    const activeRole = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "active-role",
      displayName: "Active",
    });
    const disabledRole = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "disabled-role",
      displayName: "Disabled",
      status: "DISABLED",
    });
    await roles.save(activeRole);
    await roles.save(disabledRole);

    const activePermission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "membership",
      action: "read",
    });
    const disabledPermission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "membership",
      action: "manage",
      status: "DISABLED",
    });
    await permissions.save(activePermission);
    await permissions.save(disabledPermission);

    await membershipRoles.assign(tenantId, membership.id, activeRole.id);
    await membershipRoles.assign(tenantId, membership.id, disabledRole.id);
    await rolePermissions.assign(
      tenantId,
      activeRole.id,
      activePermission.id
    );
    await rolePermissions.assign(
      tenantId,
      activeRole.id,
      disabledPermission.id
    );
    await rolePermissions.assign(
      tenantId,
      disabledRole.id,
      activePermission.id
    );

    await expect(
      resolver.resolvePermissions({ tenantId, organizationId, userId })
    ).resolves.toEqual({
      roles: ["active-role"],
      permissions: ["membership.read"],
    });
  });
});
