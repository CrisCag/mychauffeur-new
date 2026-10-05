import type { Booking } from "@/lib/modules/bookings";

export type BookingFulfillmentEventType =
  | "Booking.FulfillmentStarted"
  | "Booking.Completed";

export type BookingFulfillmentEvent = Readonly<{
  type: BookingFulfillmentEventType;
  bookingId: Booking["id"];
  tenantId: Booking["tenantId"];
  organizationId: Booking["organizationId"];
  status: Booking["status"];
  occurredAt: Date;
}>;

export function createBookingFulfillmentEvent(
  booking: Booking,
  type: BookingFulfillmentEventType,
  occurredAt: Date
): BookingFulfillmentEvent {
  return Object.freeze({
    type,
    bookingId: booking.id,
    tenantId: booking.tenantId,
    organizationId: booking.organizationId,
    status: booking.status,
    occurredAt: new Date(occurredAt.getTime()),
  });
}
