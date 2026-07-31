import type { ActorId, PermissionId, RoleId } from "./identifiers";

export type RolePermission = {
  readonly roleId: RoleId;
  readonly permissionId: PermissionId;
  readonly assignedAt: Date;
  readonly assignedByActorId?: ActorId;
};

export type CreateRolePermissionInput = {
  roleId: RoleId;
  permissionId: PermissionId;
  assignedAt?: Date;
  assignedByActorId?: ActorId;
};

export function createRolePermission(
  input: CreateRolePermissionInput
): RolePermission {
  return Object.freeze({
    roleId: input.roleId,
    permissionId: input.permissionId,
    assignedAt: input.assignedAt ?? new Date(),
    ...(input.assignedByActorId !== undefined
      ? { assignedByActorId: input.assignedByActorId }
      : {}),
  });
}
