import type { TenantId } from "@/lib/modules/identity";
import type { Tenant } from "../domain/tenant";

/**
 * Persistence Port for Tenant Aggregate.
 */
export interface TenantRepository {
  findById(id: TenantId): Promise<Tenant | null>;
  findByCode(code: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<void>;
}
