import type { TenantId } from "@/lib/modules/identity";
import type { Tenant } from "../domain/tenant";

/**
 * Persistence Port for Tenant Aggregate.
 * No adapter implementation in Step 0.
 */
export interface TenantRepository {
  findById(id: TenantId): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<void>;
}
