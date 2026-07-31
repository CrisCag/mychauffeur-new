import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asMembershipId,
  asOrganizationId,
  asPermissionId,
  asRoleId,
  asTenantId,
  asUserId,
  assignRoleToMembership,
  AuthorizationScopeError,
  createOrganizationMembership,
  createPermission,
  createRole,
} from "@/lib/modules/identity";
import {
  InMemoryMembershipRoleRepository,
  InMemoryOrganizationMembershipRepository,
  InMemoryPermissionRepository,
  InMemoryPermissionResolver,
  InMemoryRolePermissionRepository,
  InMemoryRoleRepository,
} from "@/lib/modules/identity/infrastructure";

describe("MembershipRole / RolePermission domain relations", () => {
  it("assigns a tenant-level role to a membership", () => {
    const tenantId = asTenantId(randomUUID());
    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId: asOrganizationId(randomUUID()),
      userId: asUserId(randomUUID()),
    });
    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "dispatcher",
      displayName: "Dispatcher",
    });
    const assignment = assignRoleToMembership(membership, role);
    expect(assignment.membershipId).toBe(membership.id);
    expect(assignment.roleId).toBe(role.id);
  });

  it("rejects cross-tenant role assignment", () => {
    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId: asTenantId(randomUUID()),
      organizationId: asOrganizationId(randomUUID()),
      userId: asUserId(randomUUID()),
    });
    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId: asTenantId(randomUUID()),
      code: "owner",
      displayName: "Owner",
    });
    expect(() => assignRoleToMembership(membership, role)).toThrow(
      AuthorizationScopeError
    );
  });

  it("rejects organization-level role on a different organization", () => {
    const tenantId = asTenantId(randomUUID());
    const membership = createOrganizationMembership({
      id: asMembershipId(randomUUID()),
      tenantId,
      organizationId: asOrganizationId(randomUUID()),
      userId: asUserId(randomUUID()),
    });
    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      organizationId: asOrganizationId(randomUUID()),
      code: "driver",
      displayName: "Driver",
    });
    expect(() => assignRoleToMembership(membership, role)).toThrow(
      AuthorizationScopeError
    );
  });

  it("deduplicates permissions across roles in the resolver", async () => {
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

    const roleA = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "role-a",
      displayName: "A",
    });
    const roleB = createRole({
      id: asRoleId(randomUUID()),
      tenantId,
      code: "role-b",
      displayName: "B",
    });
    await roles.save(roleA);
    await roles.save(roleB);

    const permission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "booking",
      action: "read",
    });
    await permissions.save(permission);

    await membershipRoles.assign(tenantId, membership.id, roleA.id);
    await membershipRoles.assign(tenantId, membership.id, roleB.id);
    await rolePermissions.assign(tenantId, roleA.id, permission.id);
    await rolePermissions.assign(tenantId, roleB.id, permission.id);

    const resolved = await resolver.resolvePermissions({
      tenantId,
      organizationId,
      userId,
    });

    expect(resolved.roles).toEqual(["role-a", "role-b"]);
    expect(resolved.permissions).toEqual(["booking.read"]);
  });
});
