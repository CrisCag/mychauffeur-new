import { describe, expect, it } from "vitest";
import {
  cancelBooking,
  completeBooking,
  InvalidBookingStateTransitionError,
  markBookingInProgress,
} from "@/lib/modules/bookings";
import { InMemoryBookingRepository } from "@/lib/modules/bookings/infrastructure";
import { buildConfirmedBooking } from "./services-test-fixtures";

describe("Booking fulfillment Domain", () => {
  it("advances CONFIRMED -> IN_PROGRESS -> COMPLETED with immutable commercial snapshots", () => {
    const confirmed = buildConfirmedBooking();
    const startedAt = new Date(confirmed.updatedAt.getTime() + 60_000);
    const started = markBookingInProgress(
      confirmed,
      startedAt
    );
    expect(started.status).toBe("IN_PROGRESS");
    expect(started.fulfillmentStartedAt?.toISOString()).toBe(
      startedAt.toISOString()
    );
    expect(started.version).toBe(confirmed.version + 1);
    expect(started.confirmedAt).toEqual(confirmed.confirmedAt);
    expect(started.priceSnapshot).toEqual(confirmed.priceSnapshot);
    expect(started.priceSnapshot).not.toBe(confirmed.priceSnapshot);

    const completedAt = new Date(startedAt.getTime() + 60_000);
    const completed = completeBooking(
      started,
      completedAt
    );
    expect(completed.status).toBe("COMPLETED");
    expect(completed.completedAt?.toISOString()).toBe(
      completedAt.toISOString()
    );
    expect(completed.version).toBe(started.version + 1);
    expect(completeBooking(completed, completed.updatedAt)).toBe(completed);
    expect(() =>
      cancelBooking(completed, new Date(completedAt.getTime() + 60_000))
    ).toThrow(InvalidBookingStateTransitionError);
  });

  it("rejects a fulfillment timestamp before the prior Booking update", () => {
    const confirmed = buildConfirmedBooking();
    expect(() =>
      markBookingInProgress(
        confirmed,
        new Date(confirmed.updatedAt.getTime() - 1)
      )
    ).toThrow(/updatedAt|timestamp|createdAt/i);
  });

  it("repository persists fulfillment timestamps with OCC and deep cloning", async () => {
    const repo = new InMemoryBookingRepository();
    const confirmed = buildConfirmedBooking();
    await repo.save(confirmed);
    const startedAt = new Date(confirmed.updatedAt.getTime() + 60_000);
    const started = markBookingInProgress(
      confirmed,
      startedAt
    );
    await repo.save(started, confirmed.version);
    const completed = completeBooking(
      started,
      new Date(startedAt.getTime() + 60_000)
    );
    await repo.save(completed, started.version);
    const loaded = await repo.findById(
      completed.tenantId,
      completed.organizationId,
      completed.id
    );
    expect(loaded?.status).toBe("COMPLETED");
    expect(loaded?.fulfillmentStartedAt).toEqual(completed.fulfillmentStartedAt);
    expect(loaded?.fulfillmentStartedAt).not.toBe(
      completed.fulfillmentStartedAt
    );
    expect(loaded?.completedAt).toEqual(completed.completedAt);
    expect(loaded?.completedAt).not.toBe(completed.completedAt);
  });
});
