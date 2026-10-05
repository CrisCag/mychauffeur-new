import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  completeBookingFulfillment,
  FulfillmentScopeMismatchError,
  FulfillmentServicesRequiredError,
  FulfillmentStateMismatchError,
  startBookingFulfillment,
} from "@/lib/modules/fulfillment";
import {
  cancelService,
  completeService,
  markServiceInExecution,
  markServiceReadyForAssignment,
} from "@/lib/modules/services";
import {
  buildConfirmedBooking,
  createPlannedService,
} from "./services-test-fixtures";

function serviceForBooking(
  booking: ReturnType<typeof buildConfirmedBooking>,
  sequence: number
) {
  return createPlannedService(booking, {
    id: randomUUID(),
    serviceSequence: sequence,
    generationKey: `fulfillment-${sequence}-${randomUUID().slice(0, 8)}`,
  });
}

function executingService(
  booking: ReturnType<typeof buildConfirmedBooking>,
  sequence: number
) {
  const ready = markServiceReadyForAssignment(
    serviceForBooking(booking, sequence),
    new Date("2026-08-02T13:00:00.000Z")
  ).service;
  return markServiceInExecution(
    ready,
    new Date("2026-08-02T14:00:00.000Z")
  ).service;
}

describe("Booking fulfillment orchestration", () => {
  it("starts fulfillment when at least one Service enters execution", () => {
    const booking = buildConfirmedBooking();
    const executing = executingService(booking, 1);
    const ready = markServiceReadyForAssignment(
      serviceForBooking(booking, 2),
      new Date("2026-08-02T13:00:00.000Z")
    ).service;
    const result = startBookingFulfillment(
      booking,
      [executing, ready],
      new Date(booking.updatedAt.getTime() + 60_000)
    );
    expect(result.booking.status).toBe("IN_PROGRESS");
    expect(result.events[0]?.type).toBe("Booking.FulfillmentStarted");
    expect(result.events[0]).not.toHaveProperty("customerId");
  });

  it("completes only after every Service is terminal and one completed", () => {
    const booking = buildConfirmedBooking();
    const executing = executingService(booking, 1);
    const secondReady = markServiceReadyForAssignment(
      serviceForBooking(booking, 2),
      new Date("2026-08-02T13:00:00.000Z")
    ).service;
    const inProgress = startBookingFulfillment(
      booking,
      [executing, secondReady],
      new Date(booking.updatedAt.getTime() + 60_000)
    ).booking;
    expect(() =>
      completeBookingFulfillment(
        inProgress,
        [executing, secondReady],
        new Date(inProgress.updatedAt.getTime() + 60_000)
      )
    ).toThrow(FulfillmentStateMismatchError);

    const completed = completeService(
      executing,
      new Date("2026-08-02T16:00:00.000Z")
    ).service;
    const cancelled = cancelService(
      secondReady,
      "OPERATIONAL",
      new Date("2026-08-02T15:00:00.000Z")
    ).service;
    const result = completeBookingFulfillment(
      inProgress,
      [completed, cancelled],
      new Date(inProgress.updatedAt.getTime() + 60_000)
    );
    expect(result.booking.status).toBe("COMPLETED");
    expect(result.events[0]?.type).toBe("Booking.Completed");
    expect(
      completeBookingFulfillment(
        result.booking,
        [completed, cancelled],
        new Date(result.booking.updatedAt.getTime() + 60_000)
      ).events
    ).toEqual([]);
  });

  it("rejects empty, duplicate, cross-scope, and non-executing Service sets", () => {
    const booking = buildConfirmedBooking();
    expect(() =>
      startBookingFulfillment(
        booking,
        [],
        new Date("2026-08-02T14:00:00.000Z")
      )
    ).toThrow(FulfillmentServicesRequiredError);
    const executing = executingService(booking, 1);
    expect(() =>
      startBookingFulfillment(
        booking,
        [executing, executing],
        new Date("2026-08-02T14:00:00.000Z")
      )
    ).toThrow(FulfillmentScopeMismatchError);
    expect(() =>
      startBookingFulfillment(
        booking,
        [executingService(buildConfirmedBooking(), 1)],
        new Date("2026-08-02T14:00:00.000Z")
      )
    ).toThrow(FulfillmentScopeMismatchError);
    const ready = markServiceReadyForAssignment(
      serviceForBooking(booking, 2),
      new Date("2026-08-02T13:00:00.000Z")
    ).service;
    expect(() =>
      startBookingFulfillment(
        booking,
        [ready],
        new Date("2026-08-02T14:00:00.000Z")
      )
    ).toThrow(FulfillmentStateMismatchError);
  });
});
