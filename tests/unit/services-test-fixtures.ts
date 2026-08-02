import { randomUUID } from "node:crypto";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import {
  asBookingId,
  asCustomerId,
  confirmBooking,
  createBooking,
  createBookingNumberFromToken,
  requestBookingConfirmation,
  type Booking,
} from "@/lib/modules/bookings";
import {
  createServiceNumberFromToken,
  type CreateServiceFromConfirmedBookingInput,
  type Service,
} from "@/lib/modules/services";
import { createServiceFromConfirmedBooking } from "@/lib/modules/services/domain/service";

export function sampleCommercialInput() {
  return {
    priceSnapshot: {
      currency: "eur",
      pricingVersion: "pv-1",
      baseAmountMinor: 10000,
      taxAmountMinor: 0,
      vatAmountMinor: 2200,
      supplementsAmountMinor: 500,
      discountsAmountMinor: 200,
      totalCustomerAmountMinor: 12500,
    },
    policySnapshot: {
      cancellationPolicyCode: "cancel.std",
      waitingPolicyCode: "wait.15",
      noShowPolicyCode: "noshow.std",
      modificationPolicyCode: "mod.std",
      paymentTermsCode: "prepaid",
      refundReadiness: "policy_ref",
      nightSupplementApplicable: true,
      holidaySupplementApplicable: false,
    },
    contactSnapshot: {
      bookerDisplayName: "Booker Name",
      bookerEmail: "booker@example.com",
      primaryPassengerDisplayName: "Passenger",
    },
    billingSnapshot: {
      billingPartyType: "individual",
      billingPartyName: "Booker Name",
      billingCountryCode: "it",
      taxId: "it123",
      billingCity: "Roma",
      billingPostalCode: "00100",
    },
  };
}

export function buildConfirmedBooking(overrides?: {
  tenantId?: ReturnType<typeof asTenantId>;
  organizationId?: ReturnType<typeof asOrganizationId>;
}): Booking {
  const tenantId = overrides?.tenantId ?? asTenantId(randomUUID());
  const organizationId =
    overrides?.organizationId ?? asOrganizationId(randomUUID());
  const draft = createBooking({
    id: asBookingId(randomUUID()),
    tenantId,
    organizationId,
    bookedByActorId: asActorId(randomUUID()),
    bookingNumber: createBookingNumberFromToken(randomUUID()),
    customerId: asCustomerId(randomUUID()),
    source: "B2C_WEB",
  });
  const pending = requestBookingConfirmation(draft);
  return confirmBooking(pending, sampleCommercialInput());
}

export function pickupLocation() {
  return {
    displayLabel: "Hotel Lobby",
    addressLine: "Via Roma 1",
    city: "Perugia",
    countryCode: "it",
    latitude: 43.11,
    longitude: 12.38,
    timezone: "Europe/Rome",
  };
}

export function dropoffLocation() {
  return {
    displayLabel: "Airport Terminal",
    city: "Roma",
    countryCode: "IT",
    latitude: 41.8,
    longitude: 12.25,
  };
}

export function baseServiceInput(
  booking: Booking,
  overrides?: Partial<CreateServiceFromConfirmedBookingInput>
): CreateServiceFromConfirmedBookingInput {
  return {
    id: randomUUID(),
    tenantId: booking.tenantId,
    organizationId: booking.organizationId,
    serviceNumber: createServiceNumberFromToken(randomUUID()),
    bookingId: booking.id,
    serviceSequence: 1,
    generationKey: `gen-${randomUUID().slice(0, 12)}`,
    serviceType: "TRANSFER",
    routePlan: {
      pickup: pickupLocation(),
      dropoff: dropoffLocation(),
      stops: [],
    },
    schedule: {
      scheduledPickupAt: new Date("2026-09-01T08:00:00.000Z"),
      timezone: "Europe/Rome",
      requestedArrivalAt: new Date("2026-09-01T10:00:00.000Z"),
      pickupWindowMinutes: 15,
    },
    requirements: {
      passengerCount: 2,
      luggageCount: 2,
      requestedVehicleCategory: "SEDAN",
      accessibilityRequired: false,
      meetAndGreetRequired: true,
      flightAwarePickup: false,
    },
    operationalContact: {
      primaryPassengerDisplayName: "Guest Passenger",
      phone: "+39 333 1234567",
    },
    createdAt: new Date("2026-08-02T12:00:00.000Z"),
    ...overrides,
  };
}

export function createPlannedService(
  booking?: Booking,
  overrides?: Partial<CreateServiceFromConfirmedBookingInput>
): Service {
  const b = booking ?? buildConfirmedBooking();
  return createServiceFromConfirmedBooking(baseServiceInput(b, overrides))
    .service;
}
