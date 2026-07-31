import type {
  OrganizationId,
  RoleId,
  TenantId,
} from "../domain/identifiers";
import { DuplicateRoleCodeError } from "../domain/errors";
import type { Role } from "../domain/role";
import { normalizeRoleCode } from "../domain/role";
import type { RoleRepository } from "../application/role-repository";

/** In-memory RoleRepository — not for production. */
export class InMemoryRoleRepository implements RoleRepository {
  private readonly byKey = new Map<string, Role>();

  private key(tenantId: TenantId, roleId: RoleId): string {
    return `${tenantId}::${roleId}`;
  }

  private scopeMatches(
    role: Role,
    organizationId: OrganizationId | null
  ): boolean {
    if (organizationId === null) {
      return role.organizationId === null;
    }
    return role.organizationId === organizationId;
  }

  async findById(tenantId: TenantId, roleId: RoleId): Promise<Role | null> {
    const found = this.byKey.get(this.key(tenantId, roleId));
    if (!found || found.tenantId !== tenantId) {
      return null;
    }
    return found;
  }

  async findByCode(
    tenantId: TenantId,
    organizationId: OrganizationId | null,
    code: string
  ): Promise<Role | null> {
    const normalized = normalizeRoleCode(code);
    for (const role of this.byKey.values()) {
      if (
        role.tenantId === tenantId &&
        role.code === normalized &&
        this.scopeMatches(role, organizationId)
      ) {
        return role;
      }
    }
    return null;
  }

  async findAvailableForOrganization(
    tenantId: TenantId,
    organizationId: OrganizationId
  ): Promise<Role[]> {
    return [...this.byKey.values()]
      .filter(
        (role) =>
          role.tenantId === tenantId &&
          (role.organizationId === null ||
            role.organizationId === organizationId)
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  async save(role: Role): Promise<void> {
    const duplicate = await this.findByCode(
      role.tenantId,
      role.organizationId,
      role.code
    );
    if (duplicate && duplicate.id !== role.id) {
      throw new DuplicateRoleCodeError();
    }

    for (const [mapKey, value] of this.byKey.entries()) {
      if (value.id === role.id) {
        this.byKey.delete(mapKey);
      }
    }

    this.byKey.set(this.key(role.tenantId, role.id), role);
  }
}
