import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { Organization } from "../domain/organization";

/**
 * Persistence Port for Organization Aggregate.
 * Every operation requires explicit tenant scope.
 */
export interface OrganizationRepository {
  findById(
    tenantId: TenantId,
    id: OrganizationId
  ): Promise<Organization | null>;
  findByCode(tenantId: TenantId, code: string): Promise<Organization | null>;
  findByTenant(tenantId: TenantId): Promise<Organization[]>;
  save(tenantId: TenantId, organization: Organization): Promise<void>;
}
