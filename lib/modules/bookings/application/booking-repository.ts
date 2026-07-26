import type { TenantId } from "@/lib/modules/identity";
import type { Booking, BookingId } from "../domain/booking";

/**
 * Persistence Port for Booking Aggregate.
 * Tenant scope is explicit on every operation.
 * No adapter implementation in Step 0.
 */
export interface BookingRepository {
  findById(tenantId: TenantId, id: BookingId): Promise<Booking | null>;
  save(tenantId: TenantId, booking: Booking): Promise<void>;
}
