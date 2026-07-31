import type { OrganizationMembershipRepository } from "../application/organization-membership-repository";
import type { MembershipRoleRepository } from "../application/membership-role-repository";
import type { PermissionRepository } from "../application/permission-repository";
import type {
  PermissionResolver,
  ResolvePermissionsInput,
  ResolvedAuthorization,
} from "../application/permission-resolver";
import type { RolePermissionRepository } from "../application/role-permission-repository";
import type { RoleRepository } from "../application/role-repository";

/**
 * Deny-by-default in-memory PermissionResolver — not for production.
 * Inactive memberships and disabled/archived roles/permissions yield empty sets.
 */
export class InMemoryPermissionResolver implements PermissionResolver {
  constructor(
    private readonly memberships: OrganizationMembershipRepository,
    private readonly roles: RoleRepository,
    private readonly permissions: PermissionRepository,
    private readonly membershipRoles: MembershipRoleRepository,
    private readonly rolePermissions: RolePermissionRepository
  ) {}

  async resolvePermissions(
    input: ResolvePermissionsInput
  ): Promise<ResolvedAuthorization> {
    const membership = await this.memberships.findByUserAndOrganization(
      input.tenantId,
      input.userId,
      input.organizationId
    );

    if (!membership || membership.status !== "ACTIVE") {
      return { roles: [], permissions: [] };
    }

    const roleIds = await this.membershipRoles.findRoleIdsByMembership(
      input.tenantId,
      membership.id
    );

    const roleCodes = new Set<string>();
    const permissionCodes = new Set<string>();

    for (const roleId of roleIds) {
      const role = await this.roles.findById(input.tenantId, roleId);
      if (!role || role.status !== "ACTIVE") {
        continue;
      }
      if (
        role.organizationId !== null &&
        role.organizationId !== input.organizationId
      ) {
        continue;
      }

      roleCodes.add(role.code);

      const permissionIds =
        await this.rolePermissions.findPermissionIdsByRole(
          input.tenantId,
          roleId
        );
      for (const permissionId of permissionIds) {
        const permission = await this.permissions.findById(permissionId);
        if (!permission || permission.status !== "ACTIVE") {
          continue;
        }
        permissionCodes.add(permission.code);
      }
    }

    return {
      roles: [...roleCodes].sort((a, b) => a.localeCompare(b)),
      permissions: [...permissionCodes].sort((a, b) => a.localeCompare(b)),
    };
  }
}
