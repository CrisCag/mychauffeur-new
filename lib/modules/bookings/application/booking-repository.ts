import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { Booking, BookingId } from "../domain/booking";
import type { BookingNumber } from "../domain/booking-number";

/**
 * Persistence Port for Booking Aggregate (Step 5).
 * Every read/write is tenant-safe AND organization-scoped.
 * No findAll / global listing / cross-tenant or cross-organization queries.
 *
 * Optimistic concurrency:
 * - Insert: omit expectedVersion (first save is create, not update).
 * - Update: expectedVersion MUST equal the persisted version; booking.version
 *   MUST be persistedVersion + 1. Mismatch → BookingVersionConflictError.
 * - Failed save must not mutate the persisted row.
 * - find* / rehydrate never increment version.
 */
export interface BookingRepository {
  save(booking: Booking, expectedVersion?: number): Promise<void>;

  findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingId: BookingId
  ): Promise<Booking | null>;

  findByBookingNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingNumber: BookingNumber
  ): Promise<Booking | null>;

  existsByBookingNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    bookingNumber: BookingNumber
  ): Promise<boolean>;
}
