import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import {
  asBookingId,
  asCustomerId,
  cancelBooking,
  createBooking,
  createBookingNumberFromToken,
  expireBooking,
  requestBookingConfirmation,
} from "@/lib/modules/bookings";
import { InMemoryBookingRepository } from "@/lib/modules/bookings/infrastructure";
import {
  asServiceBookingId,
  createServiceNumberFromToken,
  DuplicateServiceGenerationKeyError,
  generateServiceFromConfirmedBooking,
  ServiceBookingNotEligibleError,
  ServiceNotFoundError,
} from "@/lib/modules/services";
import { InMemoryServiceRepository } from "@/lib/modules/services/infrastructure";
import {
  baseServiceInput,
  buildConfirmedBooking,
  dropoffLocation,
  pickupLocation,
} from "./services-test-fixtures";

describe("generateServiceFromConfirmedBooking — Application", () => {
  it("creates Service from CONFIRMED Booking and persists once", async () => {
    const bookingRepo = new InMemoryBookingRepository();
    const serviceRepo = new InMemoryServiceRepository();
    const booking = buildConfirmedBooking();
    await bookingRepo.save(booking);

    const input = baseServiceInput(booking);
    const result = await generateServiceFromConfirmedBooking(
      { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
      input
    );
    expect(result.created).toBe(true);
    expect(result.service.status).toBe("PLANNED");
    expect(result.events[0].type).toBe("Service.Created");

    const loaded = await serviceRepo.findById(
      booking.tenantId,
      booking.organizationId,
      result.service.id
    );
    expect(loaded?.serviceNumber).toBe(result.service.serviceNumber);
  });

  it("returns idempotent result for same generationKey with matching payload", async () => {
    const bookingRepo = new InMemoryBookingRepository();
    const serviceRepo = new InMemoryServiceRepository();
    const booking = buildConfirmedBooking();
    await bookingRepo.save(booking);
    const input = baseServiceInput(booking);

    const first = await generateServiceFromConfirmedBooking(
      { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
      input
    );
    const second = await generateServiceFromConfirmedBooking(
      { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
      {
        ...input,
        id: randomUUID(),
      }
    );
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.service.id).toBe(first.service.id);
    expect(second.events).toHaveLength(0);
  });

  it("rejects same generationKey with different ServiceNumber or RoutePlan", async () => {
    const bookingRepo = new InMemoryBookingRepository();
    const serviceRepo = new InMemoryServiceRepository();
    const booking = buildConfirmedBooking();
    await bookingRepo.save(booking);
    const input = baseServiceInput(booking);

    await generateServiceFromConfirmedBooking(
      { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
      input
    );

    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        {
          ...input,
          serviceNumber: createServiceNumberFromToken(randomUUID()),
        }
      )
    ).rejects.toBeInstanceOf(DuplicateServiceGenerationKeyError);

    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        {
          ...input,
          routePlan: {
            pickup: pickupLocation(),
            dropoff: { ...dropoffLocation(), displayLabel: "Other Terminal" },
            stops: [],
          },
        }
      )
    ).rejects.toBeInstanceOf(DuplicateServiceGenerationKeyError);

    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        {
          ...input,
          serviceNumber: createServiceNumberFromToken(randomUUID()),
        }
      )
    ).rejects.toSatisfy(
      (err: Error) =>
        err instanceof DuplicateServiceGenerationKeyError &&
        !/gen-/i.test(err.message) &&
        !/Guest Passenger|\+39/i.test(err.message)
    );
  });

  it("resolves concurrent same generationKey matching payloads without duplicates", async () => {
    const bookingRepo = new InMemoryBookingRepository();
    const serviceRepo = new InMemoryServiceRepository();
    const booking = buildConfirmedBooking();
    await bookingRepo.save(booking);
    const input = baseServiceInput(booking);

    const [a, b] = await Promise.all([
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        { ...input, id: randomUUID() }
      ),
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        { ...input, id: randomUUID() }
      ),
    ]);

    expect(a.service.id).toBe(b.service.id);
    expect([a.created, b.created].filter(Boolean)).toHaveLength(1);

    const page = await serviceRepo.findByBookingId(
      booking.tenantId,
      booking.organizationId,
      asServiceBookingId(booking.id),
      { limit: 10 }
    );
    expect(page.items).toHaveLength(1);
  });

  it("rejects concurrent same generationKey with conflicting ServiceNumber", async () => {
    const bookingRepo = new InMemoryBookingRepository();
    const serviceRepo = new InMemoryServiceRepository();
    const booking = buildConfirmedBooking();
    await bookingRepo.save(booking);
    const input = baseServiceInput(booking);
    const conflicting = {
      ...input,
      id: randomUUID(),
      serviceNumber: createServiceNumberFromToken(randomUUID()),
    };

    const results = await Promise.allSettled([
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        input
      ),
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        conflicting
      ),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled.length + rejected.length).toBe(2);
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);
    if (rejected.length > 0) {
      expect(rejected[0].status).toBe("rejected");
      if (rejected[0].status === "rejected") {
        expect(rejected[0].reason).toBeInstanceOf(
          DuplicateServiceGenerationKeyError
        );
      }
    }

    const page = await serviceRepo.findByBookingId(
      booking.tenantId,
      booking.organizationId,
      asServiceBookingId(booking.id),
      { limit: 10 }
    );
    expect(page.items).toHaveLength(1);
  });

  it("rejects DRAFT / PENDING / CANCELLED / EXPIRED without leakage", async () => {
    const bookingRepo = new InMemoryBookingRepository();
    const serviceRepo = new InMemoryServiceRepository();
    const tenantId = asTenantId(randomUUID());
    const organizationId = asOrganizationId(randomUUID());

    const draft = createBooking({
      id: asBookingId(randomUUID()),
      tenantId,
      organizationId,
      bookedByActorId: asActorId(randomUUID()),
      bookingNumber: createBookingNumberFromToken(randomUUID()),
      customerId: asCustomerId(randomUUID()),
      source: "B2C_WEB",
    });
    await bookingRepo.save(draft);
    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        baseServiceInput(draft)
      )
    ).rejects.toBeInstanceOf(ServiceBookingNotEligibleError);

    const pending = requestBookingConfirmation(
      createBooking({
        id: asBookingId(randomUUID()),
        tenantId,
        organizationId,
        bookedByActorId: asActorId(randomUUID()),
        bookingNumber: createBookingNumberFromToken(randomUUID()),
        customerId: asCustomerId(randomUUID()),
        source: "B2C_WEB",
      })
    );
    await bookingRepo.save(pending);
    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        baseServiceInput(pending)
      )
    ).rejects.toBeInstanceOf(ServiceBookingNotEligibleError);

    const confirmed = buildConfirmedBooking({ tenantId, organizationId });
    const cancelled = cancelBooking(
      confirmed,
      new Date(confirmed.updatedAt.getTime() + 1)
    );
    await bookingRepo.save(cancelled);
    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        baseServiceInput(cancelled)
      )
    ).rejects.toBeInstanceOf(ServiceBookingNotEligibleError);

    const pending2 = requestBookingConfirmation(
      createBooking({
        id: asBookingId(randomUUID()),
        tenantId,
        organizationId,
        bookedByActorId: asActorId(randomUUID()),
        bookingNumber: createBookingNumberFromToken(randomUUID()),
        customerId: asCustomerId(randomUUID()),
        source: "B2C_WEB",
      })
    );
    const expired = expireBooking(
      pending2,
      new Date(pending2.updatedAt.getTime() + 1)
    );
    await bookingRepo.save(expired);
    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        baseServiceInput(expired)
      )
    ).rejects.toBeInstanceOf(ServiceBookingNotEligibleError);
  });

  it("rejects missing / cross-scope Booking without leakage", async () => {
    const bookingRepo = new InMemoryBookingRepository();
    const serviceRepo = new InMemoryServiceRepository();
    const booking = buildConfirmedBooking();
    await bookingRepo.save(booking);

    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        baseServiceInput(booking, {
          bookingId: asBookingId(randomUUID()),
        })
      )
    ).rejects.toBeInstanceOf(ServiceNotFoundError);

    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        baseServiceInput(booking, {
          tenantId: asTenantId(randomUUID()),
        })
      )
    ).rejects.toBeInstanceOf(ServiceNotFoundError);

    await expect(
      generateServiceFromConfirmedBooking(
        { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
        baseServiceInput(booking, {
          organizationId: asOrganizationId(randomUUID()),
        })
      )
    ).rejects.toBeInstanceOf(ServiceNotFoundError);
  });

  it("creates sequential Services for one Booking with distinct generationKeys", async () => {
    const bookingRepo = new InMemoryBookingRepository();
    const serviceRepo = new InMemoryServiceRepository();
    const booking = buildConfirmedBooking();
    await bookingRepo.save(booking);

    const first = await generateServiceFromConfirmedBooking(
      { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
      baseServiceInput(booking, {
        serviceSequence: 1,
        generationKey: `gen-leg-1-${randomUUID().slice(0, 8)}`,
      })
    );
    const second = await generateServiceFromConfirmedBooking(
      { bookingRepository: bookingRepo, serviceRepository: serviceRepo },
      baseServiceInput(booking, {
        serviceSequence: 2,
        generationKey: `gen-leg-2-${randomUUID().slice(0, 8)}`,
      })
    );
    expect(first.created).toBe(true);
    expect(second.created).toBe(true);
    expect(first.service.bookingId).toBe(second.service.bookingId);

    const page = await serviceRepo.findByBookingId(
      booking.tenantId,
      booking.organizationId,
      asServiceBookingId(booking.id),
      { limit: 10 }
    );
    expect(page.items.map((s) => s.serviceSequence)).toEqual([1, 2]);
  });
});
