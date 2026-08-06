import { asBookingId } from "@/lib/modules/bookings";
import {
  asServiceId,
  cancelService,
  markServiceReadyForAssignment,
  type ServiceCancellationReason,
} from "@/lib/modules/services";
import {
  DEMO_ORGANIZATION_ID,
  DEMO_READ_MODEL_MAX_LIMIT,
  DEMO_TENANT_ID,
} from "../constants";
import type {
  DemoAuditEventDto,
  DemoBookingDetailDto,
  DemoBookingListItemDto,
  DemoBookingPageDto,
  DemoOpsKpisDto,
} from "../dto";
import { DemoNotAvailableError, DemoValidationError } from "../errors";
import type { DemoStore } from "../store";

function assertDemoScope(store: DemoStore): void {
  if (
    store.tenantId !== DEMO_TENANT_ID ||
    store.organizationId !== DEMO_ORGANIZATION_ID
  ) {
    throw new DemoNotAvailableError();
  }
}

async function toListItem(
  store: DemoStore,
  bookingId: string
): Promise<DemoBookingListItemDto | null> {
  const projection = store.readModel.getProjection(bookingId);
  if (!projection) {
    return null;
  }
  if (
    projection.tenantId !== store.tenantId ||
    projection.organizationId !== store.organizationId
  ) {
    return null;
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
    return null;
  }
  return Object.freeze({
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber,
    bookingStatus: booking.status,
    quoteNumber: projection.quoteNumber,
    serviceId: service.id,
    serviceNumber: service.serviceNumber,
    serviceStatus: service.status,
    originLabel: projection.originLabel,
    destinationLabel: projection.destinationLabel,
    scheduledPickupAtIso: projection.scheduledPickupAtIso,
    vehicleCategory: projection.vehicleCategory,
    passengerCount: projection.passengerCount,
    luggageCount: projection.luggageCount,
    createdAtIso: projection.createdAtIso,
  });
}

export async function getDemoOpsKpis(
  store: DemoStore
): Promise<DemoOpsKpisDto> {
  assertDemoScope(store);
  const page = await listDemoBookings(store, {
    limit: DEMO_READ_MODEL_MAX_LIMIT,
    cursor: null,
  });
  let servicesPlanned = 0;
  let readyForAssignment = 0;
  let cancelled = 0;
  for (const item of page.items) {
    if (item.serviceStatus === "PLANNED") servicesPlanned += 1;
    if (item.serviceStatus === "READY_FOR_ASSIGNMENT") readyForAssignment += 1;
    if (item.serviceStatus === "CANCELLED") cancelled += 1;
  }
  return Object.freeze({
    bookingsCreated: page.items.length,
    servicesPlanned,
    readyForAssignment,
    cancelled,
  });
}

export async function listDemoBookings(
  store: DemoStore,
  options?: { limit?: number; cursor?: string | null }
): Promise<DemoBookingPageDto> {
  assertDemoScope(store);
  const { ids, nextCursor } = store.readModel.listBookingIds(options);
  const items: DemoBookingListItemDto[] = [];
  for (const id of ids) {
    const item = await toListItem(store, id);
    if (item) {
      items.push(item);
    }
  }
  return Object.freeze({
    items: Object.freeze(items),
    nextCursor,
  });
}

export async function getDemoBookingDetail(
  store: DemoStore,
  bookingId: string
): Promise<DemoBookingDetailDto | null> {
  assertDemoScope(store);
  const list = await toListItem(store, bookingId);
  if (!list) {
    return null;
  }
  const booking = await store.bookingRepository.findById(
    store.tenantId,
    store.organizationId,
    asBookingId(bookingId)
  );
  const service = await store.serviceRepository.findById(
    store.tenantId,
    store.organizationId,
    asServiceId(list.serviceId)
  );
  if (!booking || !service) {
    return null;
  }

  const events: DemoAuditEventDto[] = store.auditLog
    .filter(
      (e) =>
        e.opaqueId === booking.id ||
        e.opaqueId === service.id ||
        e.publicRef === list.quoteNumber ||
        e.publicRef === booking.bookingNumber ||
        e.publicRef === service.serviceNumber
    )
    .map((e) =>
      Object.freeze({
        source: e.source,
        type: e.type,
        opaqueId: e.opaqueId,
        ...(e.publicRef !== undefined ? { publicRef: e.publicRef } : {}),
        occurredAtIso: e.occurredAtIso,
      })
    );

  return Object.freeze({
    list,
    guestDisplayName:
      booking.guestCustomerSnapshot?.displayName ??
      booking.contactSnapshot?.bookerDisplayName ??
      "—",
    guestEmail:
      booking.guestCustomerSnapshot?.email ??
      booking.contactSnapshot?.bookerEmail ??
      "—",
    guestPhone:
      booking.guestCustomerSnapshot?.phone ??
      booking.contactSnapshot?.bookerPhone ??
      "—",
    passengers: service.requirements.passengerCount,
    luggage: service.requirements.luggageCount ?? 0,
    priceTotalMinor:
      booking.priceSnapshot?.totalCustomerAmountMinor ?? 0,
    currency: booking.priceSnapshot?.currency ?? "EUR",
    pricingVersion: booking.priceSnapshot?.pricingVersion ?? "demo",
    policyCancellationCode:
      booking.policySnapshot?.cancellationPolicyCode ?? "—",
    routePickupLabel: service.routePlan.pickup.displayLabel,
    routeDropoffLabel: service.routePlan.dropoff?.displayLabel ?? "—",
    timezone: service.schedule.timezone,
    estimatedDistanceMeters:
      service.routePlan.estimatedDistanceMeters ?? null,
    estimatedDurationMinutes:
      service.routePlan.estimatedDurationMinutes ?? null,
    cancelReasonCode: service.cancelReasonCode ?? null,
    events: Object.freeze(events),
  });
}

export async function markDemoServiceReady(
  store: DemoStore,
  serviceId: string
): Promise<DemoBookingListItemDto> {
  assertDemoScope(store);
  const service = await store.serviceRepository.findById(
    store.tenantId,
    store.organizationId,
    asServiceId(serviceId)
  );
  if (!service) {
    throw new DemoValidationError("service not found");
  }
  const at = store.clock.advanceMs(1);
  const { service: next, events } = markServiceReadyForAssignment(service, at);
  if (events.length > 0) {
    await store.serviceRepository.save(next, service.version);
    for (const e of events) {
      store.auditLog.push(
        Object.freeze({
          source: "Service" as const,
          type: e.type,
          opaqueId: next.id,
          publicRef: next.serviceNumber,
          occurredAtIso: e.occurredAt.toISOString(),
        })
      );
    }
  }
  const item = await toListItem(store, next.bookingId);
  if (!item) {
    throw new DemoValidationError("projection missing");
  }
  return item;
}

export async function cancelDemoService(
  store: DemoStore,
  serviceId: string,
  reason: ServiceCancellationReason = "OPERATIONAL"
): Promise<DemoBookingListItemDto> {
  assertDemoScope(store);
  const service = await store.serviceRepository.findById(
    store.tenantId,
    store.organizationId,
    asServiceId(serviceId)
  );
  if (!service) {
    throw new DemoValidationError("service not found");
  }
  const at = store.clock.advanceMs(1);
  const { service: next, events } = cancelService(service, reason, at);
  if (events.length > 0) {
    await store.serviceRepository.save(next, service.version);
    for (const e of events) {
      store.auditLog.push(
        Object.freeze({
          source: "Service" as const,
          type: e.type,
          opaqueId: next.id,
          publicRef: next.serviceNumber,
          occurredAtIso: e.occurredAt.toISOString(),
        })
      );
    }
  }
  const item = await toListItem(store, next.bookingId);
  if (!item) {
    throw new DemoValidationError("projection missing");
  }
  return item;
}

export function resetDemoSession(store: DemoStore): void {
  assertDemoScope(store);
  store.reset();
}
