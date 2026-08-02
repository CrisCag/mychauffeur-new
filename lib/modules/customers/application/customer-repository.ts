import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { Customer } from "../domain/customer";
import type { CustomerId } from "../domain/customer-id";
import type { CustomerNumber } from "../domain/customer-number";
import type { IdentitySubjectId } from "../domain/identity-subject-id";

/**
 * Persistence Port for Customer Aggregate (Step 8).
 * Every read/write is tenant-safe AND organization-scoped.
 * No findAll / global listing / email-phone lookup / cross-scope queries.
 *
 * Optimistic concurrency:
 * - Insert: omit expectedVersion.
 * - Update: expectedVersion MUST equal persisted version; customer.version MUST be +1
 *   except Domain-level idempotent no-ops which should skip save.
 * - Failed save must not mutate the persisted row.
 *
 * IdentitySubjectId uniqueness is enforced within tenant+organization when present.
 */
export interface CustomerRepository {
  save(customer: Customer, expectedVersion?: number): Promise<void>;

  findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    customerId: CustomerId
  ): Promise<Customer | null>;

  findByCustomerNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    customerNumber: CustomerNumber
  ): Promise<Customer | null>;

  existsByCustomerNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    customerNumber: CustomerNumber
  ): Promise<boolean>;

  findByIdentitySubjectId(
    tenantId: TenantId,
    organizationId: OrganizationId,
    identitySubjectId: IdentitySubjectId
  ): Promise<Customer | null>;
}
