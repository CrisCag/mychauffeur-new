import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  adjustPlannedServiceRequirements,
  adjustPlannedServiceSchedule,
  cancelService,
  createLocationSnapshot,
  createOperationalContactSnapshot,
  createRoutePlanSnapshot,
  createServiceNumberFromToken,
  createServiceRequirements,
  createServiceSchedule,
  DomainValidationError,
  InvalidServiceStateTransitionError,
  markServiceReadyForAssignment,
  rehydrateService,
  serializeRoutePlanSnapshot,
  ServiceCancellationConflictError,
} from "@/lib/modules/services";
import { createServiceFromConfirmedBooking } from "@/lib/modules/services/domain/service";
import {
  baseServiceInput,
  buildConfirmedBooking,
  createPlannedService,
  dropoffLocation,
  pickupLocation,
} from "./services-test-fixtures";

describe("Service Domain — Step 9", () => {
  it("creates from attested CONFIRMED Booking at version 0 with Service.Created", () => {
    const booking = buildConfirmedBooking();
    const { service, events } = createServiceFromConfirmedBooking(
      baseServiceInput(booking)
    );
    expect(service.status).toBe("PLANNED");
    expect(service.version).toBe(0);
    expect(service.bookingId).toBe(booking.id);
    expect(service.serviceSequence).toBe(1);
    expect(service.serviceType).toBe("TRANSFER");
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("Service.Created");
    expect(Object.isFrozen(events)).toBe(true);
    expect(Object.isFrozen(events[0])).toBe(true);
    expect(JSON.stringify(events[0])).not.toMatch(
      /Guest Passenger|\+39|Hotel Lobby|ada@/i
    );
  });

  it("rejects invalid ServiceType and TRANSFER without dropoff", () => {
    const booking = buildConfirmedBooking();
    expect(() =>
      createServiceFromConfirmedBooking(
        baseServiceInput(booking, { serviceType: "CUSTOM" as "TRANSFER" })
      )
    ).toThrow(DomainValidationError);
    expect(() =>
      createServiceFromConfirmedBooking(
        baseServiceInput(booking, {
          routePlan: { pickup: pickupLocation(), dropoff: null, stops: [] },
        })
      )
    ).toThrow(/dropoff/i);
  });

  it("allows HOURLY without dropoff", () => {
    const booking = buildConfirmedBooking();
    const { service } = createServiceFromConfirmedBooking(
      baseServiceInput(booking, {
        serviceType: "HOURLY",
        routePlan: { pickup: pickupLocation(), dropoff: null, stops: [] },
      })
    );
    expect(service.serviceType).toBe("HOURLY");
    expect(service.routePlan.dropoff).toBeNull();
  });

  it("validates Location all-or-none coordinates and range", () => {
    expect(() =>
      createLocationSnapshot({
        displayLabel: "X",
        latitude: 43,
      })
    ).toThrow(/all-or-none/i);
    expect(() =>
      createLocationSnapshot({
        displayLabel: "X",
        latitude: 91,
        longitude: 12,
      })
    ).toThrow(/coordinates/i);
    const loc = createLocationSnapshot(pickupLocation());
    expect(loc.countryCode).toBe("IT");
    expect(Object.isFrozen(loc)).toBe(true);
  });

  it("requires consecutive stops from 1 and deep-freezes RoutePlan", () => {
    expect(() =>
      createRoutePlanSnapshot(
        {
          pickup: pickupLocation(),
          dropoff: dropoffLocation(),
          stops: [
            { sequence: 1, location: pickupLocation() },
            { sequence: 3, location: dropoffLocation() },
          ],
        },
        "TRANSFER"
      )
    ).toThrow(/consecutive/i);

    const plan = createRoutePlanSnapshot(
      {
        pickup: pickupLocation(),
        dropoff: dropoffLocation(),
        stops: [
          {
            sequence: 1,
            location: { displayLabel: "Stop A" },
            optional: false,
          },
        ],
        estimatedDistanceMeters: 1000,
      },
      "TRANSFER"
    );
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.stops)).toBe(true);
    expect(() => {
      (plan as { pickup: { displayLabel: string } }).pickup.displayLabel = "X";
    }).toThrow();
    const serialized = serializeRoutePlanSnapshot(plan);
    expect(Object.isFrozen(serialized.stops)).toBe(true);
  });

  it("rejects non-boolean requirement and stop flags", () => {
    expect(() =>
      createServiceRequirements({
        passengerCount: 1,
        requestedVehicleCategory: "SEDAN",
        accessibilityRequired: "false" as unknown as boolean,
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      createRoutePlanSnapshot(
        {
          pickup: pickupLocation(),
          dropoff: dropoffLocation(),
          stops: [
            {
              sequence: 1,
              location: { displayLabel: "Stop" },
              optional: 1 as unknown as boolean,
            },
          ],
        },
        "TRANSFER"
      )
    ).toThrow(DomainValidationError);
  });

  it("validates schedule timezone and requestedArrivalAt after pickup", () => {
    expect(() =>
      createServiceSchedule({
        scheduledPickupAt: new Date("2026-09-01T10:00:00.000Z"),
        timezone: "Europe/Rome",
        requestedArrivalAt: new Date("2026-09-01T09:00:00.000Z"),
      })
    ).toThrow(/requestedArrivalAt/i);
    expect(() =>
      createServiceSchedule({
        scheduledPickupAt: new Date("2026-09-01T10:00:00.000Z"),
        timezone: "NotAZone",
      })
    ).toThrow(/timezone/i);
  });

  it("validates requirements and operational contact without PII in errors", () => {
    expect(() =>
      createServiceRequirements({
        passengerCount: 0,
        requestedVehicleCategory: "SEDAN",
      })
    ).toThrow(DomainValidationError);
    const contact = createOperationalContactSnapshot({
      email: " Guest@Example.COM ",
    });
    expect(contact?.email).toBe("guest@example.com");
    expect(createOperationalContactSnapshot({})).toBeNull();
  });

  it("mark ready is idempotent on READY and rejects from CANCELLED", () => {
    const service = createPlannedService();
    const at = new Date("2026-08-02T13:00:00.000Z");
    const ready = markServiceReadyForAssignment(service, at);
    expect(ready.service.status).toBe("READY_FOR_ASSIGNMENT");
    expect(ready.service.version).toBe(1);
    expect(ready.events[0].type).toBe("Service.ReadyForAssignment");

    const again = markServiceReadyForAssignment(ready.service, at);
    expect(again.events).toHaveLength(0);
    expect(again.service.version).toBe(1);

    const cancelled = cancelService(
      ready.service,
      "OPERATIONAL",
      new Date("2026-08-02T14:00:00.000Z")
    ).service;
    expect(() =>
      markServiceReadyForAssignment(
        cancelled,
        new Date("2026-08-02T15:00:00.000Z")
      )
    ).toThrow(InvalidServiceStateTransitionError);
  });

  it("adjust schedule/requirements only in PLANNED; patch no-op; regressive timestamp rejected", () => {
    const service = createPlannedService();
    const ready = markServiceReadyForAssignment(
      service,
      new Date("2026-08-02T13:00:00.000Z")
    ).service;

    expect(() =>
      adjustPlannedServiceSchedule(ready, {
        pickupWindowMinutes: 30,
        at: new Date("2026-08-02T14:00:00.000Z"),
      })
    ).toThrow(InvalidServiceStateTransitionError);

    const noop = adjustPlannedServiceSchedule(service, {
      timezone: service.schedule.timezone,
      at: new Date("2026-08-02T12:30:00.000Z"),
    });
    expect(noop.events).toHaveLength(0);
    expect(noop.service.version).toBe(0);

    const adjusted = adjustPlannedServiceSchedule(service, {
      pickupWindowMinutes: 30,
      at: new Date("2026-08-02T12:30:00.000Z"),
    });
    expect(adjusted.service.version).toBe(1);
    expect(adjusted.events[0].type).toBe("Service.ScheduleAdjusted");

    expect(() =>
      adjustPlannedServiceSchedule(adjusted.service, {
        pickupWindowMinutes: 45,
        at: new Date("2026-08-02T12:00:00.000Z"),
      })
    ).toThrow(/timestamp/i);

    const req = adjustPlannedServiceRequirements(service, {
      passengerCount: 4,
      at: new Date("2026-08-02T12:30:00.000Z"),
    });
    expect(req.events[0].type).toBe("Service.RequirementsAdjusted");
    expect(req.service.requirements.passengerCount).toBe(4);

    expect(() =>
      adjustPlannedServiceRequirements(ready, {
        passengerCount: 3,
        at: new Date("2026-08-02T14:00:00.000Z"),
      })
    ).toThrow(InvalidServiceStateTransitionError);
  });

  it("cancel is terminal; same reason no-op; different reason conflict", () => {
    const service = createPlannedService();
    const cancelled = cancelService(
      service,
      "CUSTOMER_REQUEST",
      new Date("2026-08-02T13:00:00.000Z")
    );
    expect(cancelled.service.status).toBe("CANCELLED");
    expect(cancelled.events[0].type).toBe("Service.Cancelled");
    expect(cancelled.events[0].cancelReasonCode).toBe("CUSTOMER_REQUEST");

    const again = cancelService(
      cancelled.service,
      "CUSTOMER_REQUEST",
      new Date("2026-08-02T14:00:00.000Z")
    );
    expect(again.events).toHaveLength(0);

    expect(() =>
      cancelService(
        cancelled.service,
        "OPERATIONAL",
        new Date("2026-08-02T15:00:00.000Z")
      )
    ).toThrow(ServiceCancellationConflictError);

    expect(() =>
      adjustPlannedServiceSchedule(cancelled.service, {
        pickupWindowMinutes: 10,
        at: new Date("2026-08-02T16:00:00.000Z"),
      })
    ).toThrow(InvalidServiceStateTransitionError);
  });

  it("rehydrate validates and does not emit events; rejects forbidden statuses", () => {
    const service = createPlannedService();
    const rehydrated = rehydrateService({
      ...service,
      routePlan: {
        pickup: service.routePlan.pickup,
        dropoff: service.routePlan.dropoff,
        stops: [...service.routePlan.stops],
      },
      schedule: {
        scheduledPickupAt: service.schedule.scheduledPickupAt,
        timezone: service.schedule.timezone,
        requestedArrivalAt: service.schedule.requestedArrivalAt,
        pickupWindowMinutes: service.schedule.pickupWindowMinutes,
      },
      requirements: { ...service.requirements },
      operationalContact: service.operationalContact
        ? { ...service.operationalContact }
        : null,
    });
    expect(rehydrated.version).toBe(0);
    expect(rehydrated.status).toBe("PLANNED");

    expect(() =>
      rehydrateService({
        ...service,
        status: "COMPLETED" as "PLANNED",
        routePlan: {
          pickup: service.routePlan.pickup,
          dropoff: service.routePlan.dropoff,
          stops: [],
        },
        schedule: {
          scheduledPickupAt: service.schedule.scheduledPickupAt,
          timezone: service.schedule.timezone,
        },
        requirements: { ...service.requirements },
      })
    ).toThrow(/status/i);
  });

  it("supports multiple sequential Services for one Booking identity fields", () => {
    const booking = buildConfirmedBooking();
    const a = createServiceFromConfirmedBooking(
      baseServiceInput(booking, {
        serviceSequence: 1,
        generationKey: `gen-a-${randomUUID().slice(0, 8)}`,
        serviceNumber: createServiceNumberFromToken(randomUUID()),
      })
    ).service;
    const b = createServiceFromConfirmedBooking(
      baseServiceInput(booking, {
        serviceSequence: 2,
        generationKey: `gen-b-${randomUUID().slice(0, 8)}`,
        serviceNumber: createServiceNumberFromToken(randomUUID()),
      })
    ).service;
    expect(a.bookingId).toBe(b.bookingId);
    expect(a.serviceSequence).toBe(1);
    expect(b.serviceSequence).toBe(2);
  });

  it("does not mutate previous instance on real transition", () => {
    const service = createPlannedService();
    const ready = markServiceReadyForAssignment(
      service,
      new Date("2026-08-02T13:00:00.000Z")
    ).service;
    expect(service.status).toBe("PLANNED");
    expect(service.version).toBe(0);
    expect(ready.status).toBe("READY_FOR_ASSIGNMENT");
    expect(ready).not.toBe(service);
  });
});
