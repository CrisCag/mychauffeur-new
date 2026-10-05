import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { asTenantId } from "@/lib/modules/identity";
import {
  AssignmentNotConfirmedForTripError,
  cancelTrip,
  completeTrip,
  createTripForConfirmedAssignment,
  disruptTrip,
  InvalidTripStateTransitionError,
  markCustomerNoShow,
  markDriverNoShow,
  markTripArrived,
  markTripEnRoute,
  rehydrateTrip,
  startTrip,
  TripDomainValidationError,
  TripScopeMismatchError,
} from "@/lib/modules/trips";
import { createInternalPendingAssignment } from "./assignments-test-fixtures";
import {
  createConfirmedAssignment,
  createScheduledTripFixture,
} from "./trips-test-fixtures";

describe("Trip aggregate", () => {
  it("is created only from a confirmed Assignment in the same scope", () => {
    const pending = createInternalPendingAssignment();
    const input = {
      id: randomUUID(),
      tenantId: pending.tenantId,
      organizationId: pending.organizationId,
      createdAt: new Date("2026-10-04T12:00:00.000Z"),
    };
    expect(() => createTripForConfirmedAssignment(pending, input)).toThrow(
      AssignmentNotConfirmedForTripError
    );

    const confirmed = createConfirmedAssignment();
    expect(() =>
      createTripForConfirmedAssignment(confirmed, {
        ...input,
        tenantId: asTenantId(randomUUID()),
      })
    ).toThrow(TripScopeMismatchError);

    const created = createTripForConfirmedAssignment(confirmed, {
      ...input,
      tenantId: confirmed.tenantId,
      organizationId: confirmed.organizationId,
    });
    expect(created.trip.serviceId).toBe(confirmed.serviceId);
    expect(created.trip.assignmentId).toBe(confirmed.id);
    expect(created.trip.status).toBe("SCHEDULED");
    expect(created.trip.version).toBe(0);
    expect(created.events[0]?.type).toBe("Trip.Created");
  });

  it("follows the canonical operational lifecycle with one version per transition", () => {
    const scheduled = createScheduledTripFixture();
    const enRoute = markTripEnRoute(
      scheduled,
      new Date("2026-10-04T13:00:00.000Z")
    );
    const arrived = markTripArrived(
      enRoute.trip,
      new Date("2026-10-04T14:00:00.000Z")
    );
    const ongoing = startTrip(
      arrived.trip,
      new Date("2026-10-04T14:15:00.000Z")
    );
    const completed = completeTrip(
      ongoing.trip,
      new Date("2026-10-04T16:00:00.000Z")
    );

    expect([
      scheduled.version,
      enRoute.trip.version,
      arrived.trip.version,
      ongoing.trip.version,
      completed.trip.version,
    ]).toEqual([0, 1, 2, 3, 4]);
    expect(enRoute.events[0]?.type).toBe("Trip.EnRoute");
    expect(arrived.events[0]?.type).toBe("Trip.Arrived");
    expect(ongoing.events[0]?.type).toBe("Trip.Started");
    expect(completed.events[0]?.type).toBe("Trip.Completed");
    expect(completed.trip.endedAt?.toISOString()).toBe(
      "2026-10-04T16:00:00.000Z"
    );
  });

  it("supports explicit no-show, cancellation, and disruption terminal paths", () => {
    const scheduled = createScheduledTripFixture();
    expect(
      markDriverNoShow(
        scheduled,
        "DRIVER_ABSENT",
        new Date("2026-10-04T13:00:00.000Z")
      ).trip.status
    ).toBe("NO_SHOW_DRIVER");

    const arrived = markTripArrived(
      markTripEnRoute(
        createScheduledTripFixture(),
        new Date("2026-10-04T13:00:00.000Z")
      ).trip,
      new Date("2026-10-04T14:00:00.000Z")
    ).trip;
    const customerNoShow = markCustomerNoShow(
      arrived,
      "WAITING_POLICY_EXPIRED",
      new Date("2026-10-04T14:30:00.000Z")
    ).trip;
    expect(customerNoShow.status).toBe("NO_SHOW_CUSTOMER");
    expect(customerNoShow.arrivedAt).not.toBeNull();

    const ongoing = startTrip(
      arrived,
      new Date("2026-10-04T14:15:00.000Z")
    ).trip;
    expect(
      disruptTrip(
        ongoing,
        "VEHICLE_FAILURE",
        new Date("2026-10-04T15:00:00.000Z")
      ).trip.status
    ).toBe("DISRUPTED");
    expect(
      cancelTrip(
        createScheduledTripFixture(),
        "SERVICE_CANCELLED",
        new Date("2026-10-04T13:00:00.000Z")
      ).trip.status
    ).toBe("CANCELLED");
  });

  it("rejects invalid transitions, backward clocks, and free-form sensitive reasons", () => {
    const scheduled = createScheduledTripFixture();
    expect(() => markTripArrived(scheduled, new Date("2026-10-04T13:00:00Z"))).toThrow(
      InvalidTripStateTransitionError
    );
    expect(() => markTripEnRoute(scheduled, new Date("2026-10-04T11:00:00Z"))).toThrow(
      TripDomainValidationError
    );
    expect(() =>
      cancelTrip(
        scheduled,
        "call passenger@example.com",
        new Date("2026-10-04T13:00:00Z")
      )
    ).toThrow(TripDomainValidationError);
  });

  it("is idempotent on the same state and does not bump version", () => {
    const enRoute = markTripEnRoute(
      createScheduledTripFixture(),
      new Date("2026-10-04T13:00:00.000Z")
    ).trip;
    const again = markTripEnRoute(
      enRoute,
      new Date("2026-10-04T14:00:00.000Z")
    );
    expect(again.trip).toBe(enRoute);
    expect(again.events).toEqual([]);
    expect(again.trip.version).toBe(1);
  });

  it("rehydrates without bumping version and protects Date references", () => {
    const trip = createScheduledTripFixture();
    const updatedAt = new Date(trip.updatedAt.getTime());
    const restored = rehydrateTrip({
      ...trip,
      createdAt: new Date(trip.createdAt.getTime()),
      updatedAt,
    });
    updatedAt.setUTCFullYear(2040);
    expect(restored.version).toBe(0);
    expect(restored.updatedAt.toISOString()).toBe("2026-10-04T12:00:00.000Z");
    expect(Object.isFrozen(restored)).toBe(true);
  });
});
