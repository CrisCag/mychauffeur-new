import { createHash } from "node:crypto";
import {
  asBookingId,
  confirmBooking,
  createBooking,
  createBookingNumberFromToken,
  requestBookingConfirmation,
} from "@/lib/modules/bookings";
import {
  acceptQuote,
  asQuoteId,
  createQuote,
  createQuoteNumberFromToken,
  issueQuote,
} from "@/lib/modules/quotes";
import {
  asServiceId,
  createServiceNumberFromToken,
  generateServiceFromConfirmedBooking,
} from "@/lib/modules/services";
import {
  DEMO_DESTINATION,
  DEMO_ORIGIN,
  DEMO_POLICY,
  DEMO_PRICES,
  DEMO_ROUTE_ESTIMATE,
  demoPriceProposalInput,
  isDemoVehicleCategory,
  isDemoVehicleCompatible,
  locationInputFromFixture,
  type DemoVehicleCategory,
} from "../fixtures";
import {
  DemoIdempotencyConflictError,
  DemoOrchestrationError,
  DemoValidationError,
} from "../errors";
import {
  mapBillingProposalToSnapshotInput,
  mapContactProposalToSnapshotInput,
  mapPolicyProposalToSnapshotInput,
  mapPriceProposalToSnapshotInput,
} from "../mapping";
import type { DemoSubmissionResultDto } from "../dto";
import type { DemoStore } from "../store";

export type SubmitDemoTransferInput = {
  submissionKey: string;
  vehicleCategory: DemoVehicleCategory;
  scheduledPickupAtIso: string;
  passengerCount: number;
  luggageCount: number;
  guestDisplayName: string;
  guestEmail: string;
  guestPhone: string;
};

function assertDemoGuest(input: SubmitDemoTransferInput): void {
  const name = input.guestDisplayName.trim();
  const email = input.guestEmail.trim().toLowerCase();
  const phone = input.guestPhone.trim();
  if (!name || name.length > 200) {
    throw new DemoValidationError("guest name is invalid");
  }
  if (!/demo/i.test(name)) {
    throw new DemoValidationError("guest name must include Demo");
  }
  if (!email.endsWith(".test") || !/^[^\s@]+@[^\s@]+\.test$/.test(email)) {
    throw new DemoValidationError("guest email must use .test domain");
  }
  if (!/^\+?[\d][\d\s().-]{4,30}$/.test(phone)) {
    throw new DemoValidationError("guest phone is invalid");
  }
  if (
    !Number.isSafeInteger(input.passengerCount) ||
    input.passengerCount < 1 ||
    input.passengerCount > 8
  ) {
    throw new DemoValidationError("passengerCount is invalid");
  }
  if (
    !Number.isSafeInteger(input.luggageCount) ||
    input.luggageCount < 0 ||
    input.luggageCount > 12
  ) {
    throw new DemoValidationError("luggageCount is invalid");
  }
  if (!isDemoVehicleCategory(String(input.vehicleCategory))) {
    throw new DemoValidationError("vehicleCategory is invalid");
  }
  if (
    !isDemoVehicleCompatible(
      input.vehicleCategory,
      input.passengerCount,
      input.luggageCount
    )
  ) {
    throw new DemoValidationError(
      "vehicle category incompatible with passenger/luggage counts"
    );
  }
  const pickup = new Date(input.scheduledPickupAtIso);
  if (Number.isNaN(pickup.getTime())) {
    throw new DemoValidationError("scheduledPickupAt is invalid");
  }
  const key = input.submissionKey.trim();
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(key)) {
    throw new DemoValidationError("submissionKey is invalid");
  }
}

function fingerprint(input: SubmitDemoTransferInput): string {
  const canonical = JSON.stringify({
    vehicleCategory: input.vehicleCategory,
    scheduledPickupAtIso: input.scheduledPickupAtIso,
    passengerCount: input.passengerCount,
    luggageCount: input.luggageCount,
    guestDisplayName: input.guestDisplayName.trim(),
    guestEmail: input.guestEmail.trim().toLowerCase(),
    guestPhone: input.guestPhone.trim(),
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function appendAudit(
  store: DemoStore,
  entry: {
    source: "Quote" | "Booking" | "Service";
    type: string;
    opaqueId: string;
    publicRef?: string;
    at: Date;
  }
): void {
  store.auditLog.push(
    Object.freeze({
      source: entry.source,
      type: entry.type,
      opaqueId: entry.opaqueId,
      ...(entry.publicRef !== undefined ? { publicRef: entry.publicRef } : {}),
      occurredAtIso: entry.at.toISOString(),
    })
  );
}

/**
 * Orchestrates Quote → Booking CONFIRMED → Service PLANNED for the founder demo.
 *
 * Consistency limitation (explicit, non-production):
 * steps are sequential without a Unit of Work. Inputs are pre-validated before
 * the first write. On mid-flight failure the demo does not claim success;
 * use resetDemoSession for recovery. Matching submissionKey retries are idempotent.
 */
export async function submitDemoTransfer(
  store: DemoStore,
  raw: SubmitDemoTransferInput
): Promise<DemoSubmissionResultDto> {
  assertDemoGuest(raw);
  const submissionKey = raw.submissionKey.trim();
  const fp = fingerprint(raw);

  const existingBookingId =
    store.readModel.findBookingIdBySubmissionKey(submissionKey);
  if (existingBookingId) {
    const projection = store.readModel.getProjection(existingBookingId);
    if (!projection) {
      throw new DemoOrchestrationError();
    }
    if (projection.payloadFingerprint !== fp) {
      throw new DemoIdempotencyConflictError();
    }
    const booking = await store.bookingRepository.findById(
      store.tenantId,
      store.organizationId,
      asBookingId(projection.bookingId)
    );
    const service = await store.serviceRepository.findById(
      store.tenantId,
      store.organizationId,
      asServiceId(projection.serviceId)
    );
    if (!booking || !service) {
      throw new DemoOrchestrationError();
    }
    const price = DEMO_PRICES[projection.vehicleCategory];
    return Object.freeze({
      submissionKey,
      created: false,
      quoteId: projection.quoteId,
      quoteNumber: projection.quoteNumber,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingStatus: booking.status,
      serviceId: service.id,
      serviceNumber: service.serviceNumber,
      serviceStatus: service.status,
      vehicleCategory: projection.vehicleCategory,
      priceTotalMinor: price.totalCustomerAmountMinor,
      currency: "EUR",
      originLabel: projection.originLabel,
      destinationLabel: projection.destinationLabel,
      scheduledPickupAtIso: projection.scheduledPickupAtIso,
      processLocalNoticeIt:
        "Dati conservati solo nel processo locale — si resettano al riavvio.",
      processLocalNoticeEn:
        "Data is kept only in the local process — reset on restart.",
    });
  }

  const scheduledPickupAt = new Date(raw.scheduledPickupAtIso);
  const priceInput = demoPriceProposalInput(raw.vehicleCategory);
  const guestName = raw.guestDisplayName.trim();
  const guestEmail = raw.guestEmail.trim().toLowerCase();
  const guestPhone = raw.guestPhone.trim();

  // Pre-validate commercial proposals before any write.
  const commercialProposals = {
    priceProposal: priceInput,
    policyProposal: { ...DEMO_POLICY },
    contactProposal: {
      bookerDisplayName: guestName,
      bookerEmail: guestEmail,
      bookerPhone: guestPhone,
      primaryPassengerDisplayName: guestName,
    },
    billingProposal: {
      billingPartyType: "INDIVIDUAL",
      billingPartyName: guestName,
      billingCountryCode: "IT",
    },
  };

  const t0 = store.clock.now();
  const quoteId = store.newId();
  const quoteToken = `DEMO${quoteId.replace(/-/g, "").slice(0, 12)}`;
  const { quote: draftQuote, events: draftEvents } = createQuote({
    id: asQuoteId(quoteId),
    tenantId: store.tenantId,
    organizationId: store.organizationId,
    quoteNumber: createQuoteNumberFromToken(quoteToken),
    mode: "MANUAL",
    createdByActorId: store.actorId,
    guestCustomerSnapshot: {
      displayName: guestName,
      email: guestEmail,
      phone: guestPhone,
    },
    createdAt: t0,
  });
  await store.quoteRepository.save(draftQuote);
  for (const e of draftEvents) {
    appendAudit(store, {
      source: "Quote",
      type: e.type,
      opaqueId: draftQuote.id,
      publicRef: draftQuote.quoteNumber,
      at: e.occurredAt,
    });
  }

  const issuedAt = store.clock.advanceMs(1);
  const expiresAt = new Date(issuedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { quote: issuedQuote, events: issueEvents } = issueQuote(
    draftQuote,
    commercialProposals,
    issuedAt,
    expiresAt
  );
  await store.quoteRepository.save(issuedQuote, draftQuote.version);
  for (const e of issueEvents) {
    appendAudit(store, {
      source: "Quote",
      type: e.type,
      opaqueId: issuedQuote.id,
      publicRef: issuedQuote.quoteNumber,
      at: e.occurredAt,
    });
  }

  const acceptAt = store.clock.advanceMs(1);
  const acceptanceCommandId = `accept-${submissionKey}`;
  const tipVersion = issuedQuote.versions[issuedQuote.versions.length - 1];
  const { quote: acceptedQuote, events: acceptEvents } = acceptQuote(
    issuedQuote,
    tipVersion.versionNumber,
    acceptanceCommandId,
    acceptAt
  );
  await store.quoteRepository.save(acceptedQuote, issuedQuote.version);
  for (const e of acceptEvents) {
    appendAudit(store, {
      source: "Quote",
      type: e.type,
      opaqueId: acceptedQuote.id,
      publicRef: acceptedQuote.quoteNumber,
      at: e.occurredAt,
    });
  }

  const acceptedVersion = acceptedQuote.versions.find(
    (v) => v.status === "ACCEPTED"
  );
  if (
    !acceptedVersion?.priceProposal ||
    !acceptedVersion.policyProposal ||
    !acceptedVersion.contactProposal ||
    !acceptedVersion.billingProposal
  ) {
    throw new DemoOrchestrationError();
  }

  const bookingId = store.newId();
  const bookingToken = `DEMO${bookingId.replace(/-/g, "").slice(0, 12)}`;
  const bookingCreatedAt = store.clock.advanceMs(1);
  let booking = createBooking({
    id: asBookingId(bookingId),
    tenantId: store.tenantId,
    organizationId: store.organizationId,
    bookingNumber: createBookingNumberFromToken(bookingToken),
    bookedByActorId: store.actorId,
    guestCustomerSnapshot: {
      displayName: guestName,
      email: guestEmail,
      phone: guestPhone,
    },
    source: "B2C_WEB",
    createdAt: bookingCreatedAt,
    updatedAt: bookingCreatedAt,
  });
  await store.bookingRepository.save(booking);
  appendAudit(store, {
    source: "Booking",
    type: "Booking.Created",
    opaqueId: booking.id,
    publicRef: booking.bookingNumber,
    at: bookingCreatedAt,
  });

  const pendingAt = store.clock.advanceMs(1);
  booking = requestBookingConfirmation(booking, pendingAt);
  await store.bookingRepository.save(booking, 0);
  appendAudit(store, {
    source: "Booking",
    type: "Booking.PendingConfirmation",
    opaqueId: booking.id,
    publicRef: booking.bookingNumber,
    at: pendingAt,
  });

  const confirmAt = store.clock.advanceMs(1);
  booking = confirmBooking(
    booking,
    {
      priceSnapshot: mapPriceProposalToSnapshotInput(
        acceptedVersion.priceProposal
      ),
      policySnapshot: mapPolicyProposalToSnapshotInput(
        acceptedVersion.policyProposal
      ),
      contactSnapshot: mapContactProposalToSnapshotInput(
        acceptedVersion.contactProposal
      ),
      billingSnapshot: mapBillingProposalToSnapshotInput(
        acceptedVersion.billingProposal
      ),
    },
    confirmAt
  );
  await store.bookingRepository.save(booking, 1);
  appendAudit(store, {
    source: "Booking",
    type: "Booking.Confirmed",
    opaqueId: booking.id,
    publicRef: booking.bookingNumber,
    at: confirmAt,
  });

  const serviceId = store.newId();
  const serviceToken = `DEMO${serviceId.replace(/-/g, "").slice(0, 12)}`;
  const generationKey = `demo-leg1-${submissionKey}`.slice(0, 128);
  const serviceCreatedAt = store.clock.advanceMs(1);
  const serviceResult = await generateServiceFromConfirmedBooking(
    {
      bookingRepository: store.bookingRepository,
      serviceRepository: store.serviceRepository,
    },
    {
      id: serviceId,
      tenantId: store.tenantId,
      organizationId: store.organizationId,
      bookingId: booking.id,
      serviceNumber: createServiceNumberFromToken(serviceToken),
      serviceSequence: 1,
      generationKey,
      serviceType: "TRANSFER",
      routePlan: {
        pickup: locationInputFromFixture(DEMO_ORIGIN),
        dropoff: locationInputFromFixture(DEMO_DESTINATION),
        stops: [],
        estimatedDistanceMeters: DEMO_ROUTE_ESTIMATE.estimatedDistanceMeters,
        estimatedDurationMinutes: DEMO_ROUTE_ESTIMATE.estimatedDurationMinutes,
      },
      schedule: {
        scheduledPickupAt,
        timezone: DEMO_ORIGIN.timezone,
        pickupWindowMinutes: 15,
      },
      requirements: {
        passengerCount: raw.passengerCount,
        luggageCount: raw.luggageCount,
        requestedVehicleCategory: raw.vehicleCategory,
        accessibilityRequired: false,
        meetAndGreetRequired: false,
        flightAwarePickup: false,
      },
      operationalContact: {
        primaryPassengerDisplayName: guestName,
        phone: guestPhone,
        email: guestEmail,
      },
      createdAt: serviceCreatedAt,
    }
  );
  for (const e of serviceResult.events) {
    appendAudit(store, {
      source: "Service",
      type: e.type,
      opaqueId: serviceResult.service.id,
      publicRef: serviceResult.service.serviceNumber,
      at: e.occurredAt,
    });
  }

  store.readModel.record({
    submissionKey,
    tenantId: store.tenantId,
    organizationId: store.organizationId,
    quoteId: acceptedQuote.id,
    quoteNumber: acceptedQuote.quoteNumber,
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber,
    serviceId: serviceResult.service.id,
    serviceNumber: serviceResult.service.serviceNumber,
    vehicleCategory: raw.vehicleCategory,
    passengerCount: raw.passengerCount,
    luggageCount: raw.luggageCount,
    originLabel: DEMO_ORIGIN.displayLabel,
    destinationLabel: DEMO_DESTINATION.displayLabel,
    scheduledPickupAtIso: scheduledPickupAt.toISOString(),
    createdAtIso: booking.createdAt.toISOString(),
    payloadFingerprint: fp,
  });

  const price = DEMO_PRICES[raw.vehicleCategory];
  return Object.freeze({
    submissionKey,
    created: true,
    quoteId: acceptedQuote.id,
    quoteNumber: acceptedQuote.quoteNumber,
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingStatus: booking.status,
    serviceId: serviceResult.service.id,
    serviceNumber: serviceResult.service.serviceNumber,
    serviceStatus: serviceResult.service.status,
    vehicleCategory: raw.vehicleCategory,
    priceTotalMinor: price.totalCustomerAmountMinor,
    currency: "EUR",
    originLabel: DEMO_ORIGIN.displayLabel,
    destinationLabel: DEMO_DESTINATION.displayLabel,
    scheduledPickupAtIso: scheduledPickupAt.toISOString(),
    processLocalNoticeIt:
      "Dati conservati solo nel processo locale — si resettano al riavvio.",
    processLocalNoticeEn:
      "Data is kept only in the local process — reset on restart.",
  });
}
