import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { Service } from "../domain/service";
import type { ServiceBookingId } from "../domain/service-booking-id";
import type { ServiceGenerationKey } from "../domain/service-generation-key";
import type { ServiceId } from "../domain/service-id";
import type { ServiceNumber } from "../domain/service-number";

/**
 * Persistence Port for Service Aggregate (Step 9).
 * Every read/write is tenant-safe AND organization-scoped.
 * No unbounded global listing / cross-tenant or cross-organization queries.
 *
 * Optimistic concurrency:
 * - Insert: omit expectedVersion (first save is create, not update).
 * - Update: expectedVersion MUST equal the persisted version; service.version
 *   MUST be persistedVersion + 1. Mismatch → ServiceVersionConflictError.
 * - Failed save must not mutate the persisted row.
 * - find* / rehydrate never increment version.
 *
 * Uniqueness within tenant+organization:
 * - ServiceNumber
 * - generationKey
 * - bookingId + serviceSequence
 */
export type ServiceBookingPage = {
  readonly items: readonly Service[];
  readonly nextCursor: number | null;
};

export interface ServiceRepository {
  save(service: Service, expectedVersion?: number): Promise<void>;

  findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceId: ServiceId
  ): Promise<Service | null>;

  findByServiceNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceNumber: ServiceNumber
  ): Promise<Service | null>;

  existsByServiceNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceNumber: ServiceNumber
  ): Promise<boolean>;

  findByGenerationKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    generationKey: ServiceGenerationKey
  ): Promise<Service | null>;

  /**
   * Paginated services for a Booking, ordered by serviceSequence ascending.
   * limit required or defaults to a bounded default; hard max enforced.
   * cursor is sequence-based: return items with sequence > cursor.
   */
  findByBookingId(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingId: ServiceBookingId,
    options?: {
      limit?: number;
      /** Opaque / sequence cursor: last seen serviceSequence (exclusive). */
      cursor?: number | null;
    }
  ): Promise<ServiceBookingPage>;
}
