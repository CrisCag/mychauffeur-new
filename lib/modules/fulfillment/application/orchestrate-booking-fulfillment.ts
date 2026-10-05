import {
  completeBooking,
  markBookingInProgress,
  type Booking,
} from "@/lib/modules/bookings";
import type { Service } from "@/lib/modules/services";
import {
  createBookingFulfillmentEvent,
  type BookingFulfillmentEvent,
} from "./booking-fulfillment-events";
import {
  FulfillmentScopeMismatchError,
  FulfillmentServicesRequiredError,
  FulfillmentStateMismatchError,
} from "./errors";

export type BookingFulfillmentResult = Readonly<{
  booking: Booking;
  events: readonly BookingFulfillmentEvent[];
}>;

function assertServicesBelongToBooking(
  booking: Booking,
  allBookingServices: readonly Service[]
): void {
  if (allBookingServices.length === 0) {
    throw new FulfillmentServicesRequiredError();
  }
  const identities = new Set<string>();
  for (const service of allBookingServices) {
    if (
      service.tenantId !== booking.tenantId ||
      service.organizationId !== booking.organizationId ||
      String(service.bookingId) !== String(booking.id)
    ) {
      throw new FulfillmentScopeMismatchError();
    }
    const identity = String(service.id);
    if (identities.has(identity)) {
      throw new FulfillmentScopeMismatchError(
        "Duplicate Service in Booking fulfillment set"
      );
    }
    identities.add(identity);
  }
}

function result(
  booking: Booking,
  events: readonly BookingFulfillmentEvent[]
): BookingFulfillmentResult {
  return Object.freeze({ booking, events: Object.freeze([...events]) });
}

export function startBookingFulfillment(
  booking: Booking,
  allBookingServices: readonly Service[],
  at: Date
): BookingFulfillmentResult {
  assertServicesBelongToBooking(booking, allBookingServices);
  if (booking.status === "IN_PROGRESS") return result(booking, []);
  if (booking.status !== "CONFIRMED") {
    throw new FulfillmentStateMismatchError();
  }
  if (
    !allBookingServices.some(
      (service) =>
        service.status === "IN_EXECUTION" || service.status === "COMPLETED"
    )
  ) {
    throw new FulfillmentStateMismatchError(
      "No Service has entered execution"
    );
  }
  const next = markBookingInProgress(booking, at);
  return result(next, [
    createBookingFulfillmentEvent(next, "Booking.FulfillmentStarted", at),
  ]);
}

export function completeBookingFulfillment(
  booking: Booking,
  allBookingServices: readonly Service[],
  at: Date
): BookingFulfillmentResult {
  assertServicesBelongToBooking(booking, allBookingServices);
  const everyServiceClosed = allBookingServices.every(
    (service) =>
      service.status === "COMPLETED" || service.status === "CANCELLED"
  );
  const atLeastOneCompleted = allBookingServices.some(
    (service) => service.status === "COMPLETED"
  );
  if (!everyServiceClosed || !atLeastOneCompleted) {
    throw new FulfillmentStateMismatchError(
      "Booking Services are not completion-eligible"
    );
  }
  if (booking.status === "COMPLETED") return result(booking, []);
  if (booking.status !== "IN_PROGRESS") {
    throw new FulfillmentStateMismatchError();
  }
  const next = completeBooking(booking, at);
  return result(next, [
    createBookingFulfillmentEvent(next, "Booking.Completed", at),
  ]);
}
