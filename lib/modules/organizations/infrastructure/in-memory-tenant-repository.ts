import type { TenantId } from "@/lib/modules/identity";
import type { TenantRepository } from "../application/tenant-repository";
import { DuplicateCodeError } from "../domain/errors";
import type { Tenant } from "../domain/tenant";

/**
 * In-memory TenantRepository for contract tests / local verification.
 * Not for production use.
 */
export class InMemoryTenantRepository implements TenantRepository {
  private readonly byId = new Map<string, Tenant>();

  async findById(id: TenantId): Promise<Tenant | null> {
    return this.byId.get(id) ?? null;
  }

  async findByCode(code: string): Promise<Tenant | null> {
    const normalized = code.trim();
    for (const tenant of this.byId.values()) {
      if (tenant.code === normalized) {
        return tenant;
      }
    }
    return null;
  }

  async save(tenant: Tenant): Promise<void> {
    const existingByCode = await this.findByCode(tenant.code);
    if (existingByCode && existingByCode.id !== tenant.id) {
      throw new DuplicateCodeError();
    }
    this.byId.set(tenant.id, tenant);
  }
}
