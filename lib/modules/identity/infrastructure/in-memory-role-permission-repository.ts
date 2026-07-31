import type {
  ActorId,
  PermissionId,
  RoleId,
  TenantId,
} from "../domain/identifiers";
import { AuthorizationScopeError } from "../domain/errors";
import { createRolePermission } from "../domain/role-permission";
import type { RolePermission } from "../domain/role-permission";
import type { PermissionRepository } from "../application/permission-repository";
import type { RolePermissionRepository } from "../application/role-permission-repository";
import type { RoleRepository } from "../application/role-repository";

/** In-memory RolePermissionRepository — not for production. */
export class InMemoryRolePermissionRepository
  implements RolePermissionRepository
{
  private readonly assignments = new Map<string, RolePermission>();

  constructor(
    private readonly roles: RoleRepository,
    private readonly permissions: PermissionRepository
  ) {}

  private key(roleId: RoleId, permissionId: PermissionId): string {
    return `${roleId}::${permissionId}`;
  }

  async findPermissionIdsByRole(
    tenantId: TenantId,
    roleId: RoleId
  ): Promise<PermissionId[]> {
    const role = await this.roles.findById(tenantId, roleId);
    if (!role) {
      return [];
    }

    const permissionIds: PermissionId[] = [];
    for (const assignment of this.assignments.values()) {
      if (assignment.roleId !== roleId) {
        continue;
      }
      const permission = await this.permissions.findById(
        assignment.permissionId
      );
      if (permission) {
        permissionIds.push(assignment.permissionId);
      }
    }
    return permissionIds.sort((a, b) => a.localeCompare(b));
  }

  async assign(
    tenantId: TenantId,
    roleId: RoleId,
    permissionId: PermissionId,
    actorId?: ActorId
  ): Promise<void> {
    const role = await this.roles.findById(tenantId, roleId);
    if (!role) {
      throw new AuthorizationScopeError("Role not found in tenant");
    }

    const permission = await this.permissions.findById(permissionId);
    if (!permission) {
      throw new AuthorizationScopeError("Permission not found");
    }

    this.assignments.set(
      this.key(roleId, permissionId),
      createRolePermission({
        roleId,
        permissionId,
        assignedByActorId: actorId,
      })
    );
  }

  async revoke(
    tenantId: TenantId,
    roleId: RoleId,
    permissionId: PermissionId
  ): Promise<void> {
    const role = await this.roles.findById(tenantId, roleId);
    if (!role) {
      return;
    }
    this.assignments.delete(this.key(roleId, permissionId));
  }
}
