import type { PermissionId } from "../domain/identifiers";
import type { Permission } from "../domain/permission";

/**
 * Global Permission catalog — not tenant-owned.
 */
export type PermissionRepository = {
  findById(permissionId: PermissionId): Promise<Permission | null>;
  findByCode(code: string): Promise<Permission | null>;
  save(permission: Permission): Promise<void>;
};
