import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { OrganizationRepository } from "../application/organization-repository";
import { DuplicateCodeError, TenantScopeMismatchError } from "../domain/errors";
import type { Organization } from "../domain/organization";

/**
 * In-memory OrganizationRepository for contract tests.
 * Always tenant-scoped. Not for production use.
 */
export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly byId = new Map<string, Organization>();

  private key(tenantId: TenantId, id: OrganizationId): string {
    return `${tenantId}::${id}`;
  }

  async findById(
    tenantId: TenantId,
    id: OrganizationId
  ): Promise<Organization | null> {
    const found = this.byId.get(this.key(tenantId, id));
    if (!found) {
      return null;
    }
    if (found.tenantId !== tenantId) {
      return null;
    }
    return found;
  }

  async findByCode(
    tenantId: TenantId,
    code: string
  ): Promise<Organization | null> {
    const normalized = code.trim();
    for (const organization of this.byId.values()) {
      if (
        organization.tenantId === tenantId &&
        organization.code === normalized
      ) {
        return organization;
      }
    }
    return null;
  }

  async findByTenant(tenantId: TenantId): Promise<Organization[]> {
    return [...this.byId.values()]
      .filter((organization) => organization.tenantId === tenantId)
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  async save(tenantId: TenantId, organization: Organization): Promise<void> {
    if (organization.tenantId !== tenantId) {
      throw new TenantScopeMismatchError();
    }

    const duplicate = await this.findByCode(tenantId, organization.code);
    if (duplicate && duplicate.id !== organization.id) {
      throw new DuplicateCodeError();
    }

    // Remove any previous key for same id under this tenant (idempotent upsert).
    for (const [mapKey, value] of this.byId.entries()) {
      if (value.id === organization.id) {
        this.byId.delete(mapKey);
      }
    }

    this.byId.set(this.key(tenantId, organization.id), organization);
  }
}
