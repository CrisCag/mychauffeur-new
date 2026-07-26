import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { Organization } from "../domain/organization";

/**
 * Persistence Port for Organization Aggregate.
 * Tenant scope is explicit on every operation.
 * No adapter implementation in Step 0.
 */
export interface OrganizationRepository {
  findById(
    tenantId: TenantId,
    id: OrganizationId
  ): Promise<Organization | null>;
  save(tenantId: TenantId, organization: Organization): Promise<void>;
}
