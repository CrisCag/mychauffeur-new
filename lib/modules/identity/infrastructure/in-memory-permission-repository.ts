import type { PermissionId } from "../domain/identifiers";
import { DuplicatePermissionCodeError } from "../domain/errors";
import type { Permission } from "../domain/permission";
import { normalizePermissionCode } from "../domain/permission";
import type { PermissionRepository } from "../application/permission-repository";

/** In-memory PermissionRepository (global catalog) — not for production. */
export class InMemoryPermissionRepository implements PermissionRepository {
  private readonly byId = new Map<string, Permission>();

  async findById(permissionId: PermissionId): Promise<Permission | null> {
    return this.byId.get(permissionId) ?? null;
  }

  async findByCode(code: string): Promise<Permission | null> {
    const normalized = normalizePermissionCode(code);
    for (const permission of this.byId.values()) {
      if (permission.code === normalized) {
        return permission;
      }
    }
    return null;
  }

  async save(permission: Permission): Promise<void> {
    const duplicate = await this.findByCode(permission.code);
    if (duplicate && duplicate.id !== permission.id) {
      throw new DuplicatePermissionCodeError();
    }
    this.byId.set(permission.id, permission);
  }
}
