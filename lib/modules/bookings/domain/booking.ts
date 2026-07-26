import type { OrganizationId, TenantId } from "@/lib/modules/identity";

declare const bookingIdBrand: unique symbol;

export type BookingId = string & { readonly [bookingIdBrand]: "BookingId" };

export function asBookingId(value: string): BookingId {
  return value as BookingId;
}

/** Minimal Booking placeholder — Aggregate not fully modeled yet. */
export type Booking = {
  id: BookingId;
  tenantId: TenantId;
  organizationId: OrganizationId;
};
