import type {
  ActorId,
  PermissionId,
  RoleId,
  TenantId,
} from "../domain/identifiers";

export type RolePermissionRepository = {
  findPermissionIdsByRole(
    tenantId: TenantId,
    roleId: RoleId
  ): Promise<PermissionId[]>;

  assign(
    tenantId: TenantId,
    roleId: RoleId,
    permissionId: PermissionId,
    actorId?: ActorId
  ): Promise<void>;

  revoke(
    tenantId: TenantId,
    roleId: RoleId,
    permissionId: PermissionId
  ): Promise<void>;
};
