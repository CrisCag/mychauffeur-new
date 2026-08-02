import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import {
  DomainValidationError,
  InvalidServiceStateTransitionError,
  ServiceCancellationConflictError,
} from "./errors";
import {
  cloneOperationalContactSnapshot,
  createOperationalContactSnapshot,
  type OperationalContactSnapshot,
  type OperationalContactSnapshotInput,
} from "./operational-contact-snapshot";
import {
  cloneRoutePlanSnapshot,
  createRoutePlanSnapshot,
  type RoutePlanSnapshot,
  type RoutePlanSnapshotInput,
} from "./route-plan-snapshot";
import { asServiceBookingId, type ServiceBookingId } from "./service-booking-id";
import {
  isServiceCancellationReason,
  type ServiceCancellationReason,
} from "./service-cancellation-reason";
import {
  createServiceDomainEvent,
  type ServiceDomainEvent,
} from "./service-events";
import {
  asServiceGenerationKey,
  type ServiceGenerationKey,
} from "./service-generation-key";
import { asServiceId, type ServiceId } from "./service-id";
import { asServiceNumber, type ServiceNumber } from "./service-number";
import {
  cloneServiceRequirements,
  createServiceRequirements,
  requirementsEqual,
  type ServiceRequirements,
  type ServiceRequirementsInput,
} from "./service-requirements";
import {
  cloneServiceSchedule,
  createServiceSchedule,
  schedulesEqual,
  type ServiceSchedule,
  type ServiceScheduleInput,
} from "./service-schedule";
import { asServiceSequence, type ServiceSequence } from "./service-sequence";
import {
  isServiceStatus,
  isTerminalServiceStatus,
  type ServiceStatus,
} from "./service-status";
import { isServiceType, type ServiceType } from "./service-type";

/**
 * Service Aggregate Root — planned operational performance (Step 9).
 * Distinct from Booking, assignment, live trip execution, and partner matching.
 * Domain does not import bookings. Creation is attested as from CONFIRMED Booking;
 * Application must verify Booking eligibility via repository port.
 * Domain events are Service.* values only — no broker/outbox. No PII in events.
 */
export type Service = {
  readonly id: ServiceId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly serviceNumber: ServiceNumber;
  readonly bookingId: ServiceBookingId;
  readonly serviceSequence: ServiceSequence;
  readonly generationKey: ServiceGenerationKey;
  readonly serviceType: ServiceType;
  readonly status: ServiceStatus;
  readonly routePlan: RoutePlanSnapshot;
  readonly schedule: ServiceSchedule;
  readonly requirements: ServiceRequirements;
  readonly operationalContact: OperationalContactSnapshot | null;
  readonly cancelReasonCode: ServiceCancellationReason | null;
  readonly cancelledAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type ServiceOperationResult = {
  readonly service: Service;
  readonly events: readonly ServiceDomainEvent[];
};

/**
 * Input for attested create from CONFIRMED Booking.
 * Application layer must verify Booking status/scope before calling.
 * There is no public create that bypasses this factory.
 */
export type CreateServiceFromConfirmedBookingInput = {
  id: ServiceId | string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  serviceNumber: ServiceNumber | string;
  bookingId: ServiceBookingId | string;
  serviceSequence: number;
  generationKey: ServiceGenerationKey | string;
  serviceType: ServiceType | string;
  routePlan: RoutePlanSnapshotInput;
  schedule: ServiceScheduleInput;
  requirements: ServiceRequirementsInput;
  operationalContact?: OperationalContactSnapshotInput | null;
  /** Explicit clock — required (no hidden Date.now in Domain). */
  createdAt: Date;
  updatedAt?: Date;
};

export type RehydrateServiceInput = {
  id: ServiceId | string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  serviceNumber: ServiceNumber | string;
  bookingId: ServiceBookingId | string;
  serviceSequence: number;
  generationKey: ServiceGenerationKey | string;
  serviceType: ServiceType | string;
  status: ServiceStatus | string;
  routePlan: RoutePlanSnapshotInput;
  schedule: ServiceScheduleInput;
  requirements: ServiceRequirementsInput;
  operationalContact?: OperationalContactSnapshotInput | null;
  cancelReasonCode?: ServiceCancellationReason | string | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export type AdjustPlannedServiceScheduleInput = {
  scheduledPickupAt?: Date;
  timezone?: string;
  /** omit = unchanged; null = clear */
  requestedArrivalAt?: Date | null;
  /** omit = unchanged; null = clear */
  pickupWindowMinutes?: number | null;
  at: Date;
};

export type AdjustPlannedServiceRequirementsInput = {
  passengerCount?: number;
  luggageCount?: number | null;
  childSeatsCount?: number | null;
  requestedVehicleCategory?: ServiceRequirements["requestedVehicleCategory"];
  accessibilityRequired?: boolean;
  preferredLanguageCode?: string | null;
  meetAndGreetRequired?: boolean;
  flightAwarePickup?: boolean;
  at: Date;
};

function assertNonEmptyId(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new DomainValidationError(`${field} is required`);
  }
  return normalized;
}

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 0) {
    throw new DomainValidationError(
      "Service version must be a non-negative integer"
    );
  }
  return version;
}

function copyDate(value: Date): Date {
  return new Date(value.getTime());
}

function assertClock(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new DomainValidationError(`${field} is invalid`);
  }
  return value;
}

function assertCancellationCoupling(
  status: ServiceStatus,
  cancelReasonCode: ServiceCancellationReason | null,
  cancelledAt: Date | null
): void {
  if (status === "CANCELLED") {
    if (!cancelReasonCode || !cancelledAt) {
      throw new DomainValidationError(
        "CANCELLED requires cancelReasonCode and cancelledAt"
      );
    }
    return;
  }
  if (cancelReasonCode !== null || cancelledAt !== null) {
    throw new DomainValidationError(
      "cancel fields are only allowed when CANCELLED"
    );
  }
}

function freezeService(service: Service): Service {
  assertCancellationCoupling(
    service.status,
    service.cancelReasonCode,
    service.cancelledAt
  );
  return Object.freeze({
    ...service,
    routePlan: cloneRoutePlanSnapshot(service.routePlan, service.serviceType),
    schedule: cloneServiceSchedule(service.schedule),
    requirements: cloneServiceRequirements(service.requirements),
    operationalContact: cloneOperationalContactSnapshot(
      service.operationalContact
    ),
    cancelledAt: service.cancelledAt ? copyDate(service.cancelledAt) : null,
    createdAt: copyDate(service.createdAt),
    updatedAt: copyDate(service.updatedAt),
  });
}

function operationResult(
  service: Service,
  events: readonly ServiceDomainEvent[]
): ServiceOperationResult {
  return {
    service,
    events: Object.freeze([...events]),
  };
}

function bump(
  service: Service,
  updatedAt: Date,
  patch: Partial<Service>
): Service {
  if (service.createdAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }
  if (service.updatedAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError(
      "operation timestamp must be >= previous updatedAt"
    );
  }
  return freezeService({
    ...service,
    ...patch,
    updatedAt,
    version: assertVersion(service.version + 1),
  });
}

/**
 * Creates a Service attested as derived from a CONFIRMED Booking.
 * Application must verify Booking via repository before calling.
 * Forces version 0. Emits Service.Created.
 */
export function createServiceFromConfirmedBooking(
  input: CreateServiceFromConfirmedBookingInput
): ServiceOperationResult {
  const id = asServiceId(String(input.id));
  const tenantId = assertNonEmptyId(input.tenantId, "tenantId") as TenantId;
  const organizationId = assertNonEmptyId(
    input.organizationId,
    "organizationId"
  ) as OrganizationId;
  const serviceNumber = asServiceNumber(String(input.serviceNumber));
  const bookingId = asServiceBookingId(String(input.bookingId));
  const serviceSequence = asServiceSequence(input.serviceSequence);
  const generationKey = asServiceGenerationKey(String(input.generationKey));
  if (!isServiceType(String(input.serviceType))) {
    throw new DomainValidationError("serviceType is invalid");
  }
  const serviceType = input.serviceType as ServiceType;

  const routePlan = createRoutePlanSnapshot(input.routePlan, serviceType);
  const schedule = createServiceSchedule(input.schedule);
  const requirements = createServiceRequirements(input.requirements);
  const operationalContact = createOperationalContactSnapshot(
    input.operationalContact
  );

  const createdAt = assertClock(input.createdAt, "createdAt");
  const updatedAt = assertClock(input.updatedAt ?? createdAt, "updatedAt");
  if (createdAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }

  const service = freezeService({
    id,
    tenantId,
    organizationId,
    serviceNumber,
    bookingId,
    serviceSequence,
    generationKey,
    serviceType,
    status: "PLANNED",
    routePlan,
    schedule,
    requirements,
    operationalContact,
    cancelReasonCode: null,
    cancelledAt: null,
    createdAt,
    updatedAt,
    version: 0,
  });

  return operationResult(service, [
    createServiceDomainEvent({
      type: "Service.Created",
      serviceId: service.id,
      tenantId: service.tenantId,
      organizationId: service.organizationId,
      bookingId: service.bookingId,
      serviceSequence: service.serviceSequence,
      status: service.status,
      occurredAt: createdAt,
    }),
  ]);
}

/** Rehydrate validates all invariants. Does not emit events or bump version. */
export function rehydrateService(input: RehydrateServiceInput): Service {
  const id = asServiceId(String(input.id));
  const tenantId = assertNonEmptyId(input.tenantId, "tenantId") as TenantId;
  const organizationId = assertNonEmptyId(
    input.organizationId,
    "organizationId"
  ) as OrganizationId;
  const serviceNumber = asServiceNumber(String(input.serviceNumber));
  const bookingId = asServiceBookingId(String(input.bookingId));
  const serviceSequence = asServiceSequence(input.serviceSequence);
  const generationKey = asServiceGenerationKey(String(input.generationKey));
  if (!isServiceType(String(input.serviceType))) {
    throw new DomainValidationError("serviceType is invalid");
  }
  if (!isServiceStatus(String(input.status))) {
    throw new DomainValidationError("status is invalid");
  }
  const serviceType = input.serviceType as ServiceType;
  const status = input.status as ServiceStatus;

  const routePlan = createRoutePlanSnapshot(input.routePlan, serviceType);
  const schedule = createServiceSchedule(input.schedule);
  const requirements = createServiceRequirements(input.requirements);
  const operationalContact = createOperationalContactSnapshot(
    input.operationalContact
  );

  let cancelReasonCode: ServiceCancellationReason | null = null;
  if (
    input.cancelReasonCode !== undefined &&
    input.cancelReasonCode !== null
  ) {
    if (!isServiceCancellationReason(String(input.cancelReasonCode))) {
      throw new DomainValidationError("cancelReasonCode is invalid");
    }
    cancelReasonCode = input.cancelReasonCode as ServiceCancellationReason;
  }

  const cancelledAt =
    input.cancelledAt === undefined || input.cancelledAt === null
      ? null
      : assertClock(input.cancelledAt, "cancelledAt");

  const createdAt = assertClock(input.createdAt, "createdAt");
  const updatedAt = assertClock(input.updatedAt, "updatedAt");
  if (createdAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }

  return freezeService({
    id,
    tenantId,
    organizationId,
    serviceNumber,
    bookingId,
    serviceSequence,
    generationKey,
    serviceType,
    status,
    routePlan,
    schedule,
    requirements,
    operationalContact,
    cancelReasonCode,
    cancelledAt,
    createdAt,
    updatedAt,
    version: assertVersion(input.version),
  });
}

/**
 * PLANNED → READY_FOR_ASSIGNMENT.
 * Already READY is idempotent no-op (no bump / no event).
 */
export function markServiceReadyForAssignment(
  service: Service,
  at: Date
): ServiceOperationResult {
  if (service.status === "READY_FOR_ASSIGNMENT") {
    return operationResult(service, []);
  }
  if (service.status !== "PLANNED") {
    throw new InvalidServiceStateTransitionError();
  }

  // Re-validate structural invariants before readiness.
  createRoutePlanSnapshot(
    {
      pickup: service.routePlan.pickup,
      dropoff: service.routePlan.dropoff,
      stops: service.routePlan.stops.map((s) => ({
        sequence: s.sequence,
        location: s.location,
        plannedDurationMinutes: s.plannedDurationMinutes,
        optional: s.optional,
        commercialStopRef: s.commercialStopRef,
      })),
      estimatedDistanceMeters: service.routePlan.estimatedDistanceMeters,
      estimatedDurationMinutes: service.routePlan.estimatedDurationMinutes,
      routeEstimateProviderRef: service.routePlan.routeEstimateProviderRef,
      routeEstimateVersion: service.routePlan.routeEstimateVersion,
    },
    service.serviceType
  );
  createServiceSchedule({
    scheduledPickupAt: service.schedule.scheduledPickupAt,
    timezone: service.schedule.timezone,
    requestedArrivalAt: service.schedule.requestedArrivalAt,
    pickupWindowMinutes: service.schedule.pickupWindowMinutes,
  });
  createServiceRequirements({ ...service.requirements });

  const occurredAt = assertClock(at, "at");
  const next = bump(service, occurredAt, { status: "READY_FOR_ASSIGNMENT" });

  return operationResult(next, [
    createServiceDomainEvent({
      type: "Service.ReadyForAssignment",
      serviceId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      bookingId: next.bookingId,
      serviceSequence: next.serviceSequence,
      status: next.status,
      occurredAt,
    }),
  ]);
}

export function adjustPlannedServiceSchedule(
  service: Service,
  input: AdjustPlannedServiceScheduleInput
): ServiceOperationResult {
  if (service.status !== "PLANNED") {
    throw new InvalidServiceStateTransitionError();
  }
  const at = assertClock(input.at, "at");

  const nextSchedule = createServiceSchedule({
    scheduledPickupAt:
      input.scheduledPickupAt !== undefined
        ? input.scheduledPickupAt
        : service.schedule.scheduledPickupAt,
    timezone:
      input.timezone !== undefined ? input.timezone : service.schedule.timezone,
    requestedArrivalAt:
      input.requestedArrivalAt !== undefined
        ? input.requestedArrivalAt
        : service.schedule.requestedArrivalAt,
    pickupWindowMinutes:
      input.pickupWindowMinutes !== undefined
        ? input.pickupWindowMinutes
        : service.schedule.pickupWindowMinutes,
  });

  if (schedulesEqual(service.schedule, nextSchedule)) {
    return operationResult(service, []);
  }

  const next = bump(service, at, { schedule: nextSchedule });
  return operationResult(next, [
    createServiceDomainEvent({
      type: "Service.ScheduleAdjusted",
      serviceId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      bookingId: next.bookingId,
      serviceSequence: next.serviceSequence,
      status: next.status,
      occurredAt: at,
    }),
  ]);
}

export function adjustPlannedServiceRequirements(
  service: Service,
  input: AdjustPlannedServiceRequirementsInput
): ServiceOperationResult {
  if (service.status !== "PLANNED") {
    throw new InvalidServiceStateTransitionError();
  }
  const at = assertClock(input.at, "at");

  const nextRequirements = createServiceRequirements({
    passengerCount:
      input.passengerCount !== undefined
        ? input.passengerCount
        : service.requirements.passengerCount,
    luggageCount:
      input.luggageCount !== undefined
        ? input.luggageCount
        : service.requirements.luggageCount,
    childSeatsCount:
      input.childSeatsCount !== undefined
        ? input.childSeatsCount
        : service.requirements.childSeatsCount,
    requestedVehicleCategory:
      input.requestedVehicleCategory !== undefined
        ? input.requestedVehicleCategory
        : service.requirements.requestedVehicleCategory,
    accessibilityRequired:
      input.accessibilityRequired !== undefined
        ? input.accessibilityRequired
        : service.requirements.accessibilityRequired,
    preferredLanguageCode:
      input.preferredLanguageCode !== undefined
        ? input.preferredLanguageCode
        : service.requirements.preferredLanguageCode,
    meetAndGreetRequired:
      input.meetAndGreetRequired !== undefined
        ? input.meetAndGreetRequired
        : service.requirements.meetAndGreetRequired,
    flightAwarePickup:
      input.flightAwarePickup !== undefined
        ? input.flightAwarePickup
        : service.requirements.flightAwarePickup,
  });

  if (requirementsEqual(service.requirements, nextRequirements)) {
    return operationResult(service, []);
  }

  const next = bump(service, at, { requirements: nextRequirements });
  return operationResult(next, [
    createServiceDomainEvent({
      type: "Service.RequirementsAdjusted",
      serviceId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      bookingId: next.bookingId,
      serviceSequence: next.serviceSequence,
      status: next.status,
      occurredAt: at,
    }),
  ]);
}

/**
 * Cancel from PLANNED or READY_FOR_ASSIGNMENT. CANCELLED is terminal.
 * Same reason after cancel = no-op; different reason = conflict.
 */
export function cancelService(
  service: Service,
  reason: ServiceCancellationReason | string,
  at: Date
): ServiceOperationResult {
  if (!isServiceCancellationReason(String(reason))) {
    throw new DomainValidationError("cancelReasonCode is invalid");
  }
  const cancelReasonCode = reason as ServiceCancellationReason;
  const occurredAt = assertClock(at, "at");

  if (service.status === "CANCELLED") {
    if (service.cancelReasonCode === cancelReasonCode) {
      return operationResult(service, []);
    }
    throw new ServiceCancellationConflictError();
  }

  if (isTerminalServiceStatus(service.status)) {
    throw new InvalidServiceStateTransitionError();
  }

  if (
    service.status !== "PLANNED" &&
    service.status !== "READY_FOR_ASSIGNMENT"
  ) {
    throw new InvalidServiceStateTransitionError();
  }

  const next = bump(service, occurredAt, {
    status: "CANCELLED",
    cancelReasonCode,
    cancelledAt: copyDate(occurredAt),
  });

  return operationResult(next, [
    createServiceDomainEvent({
      type: "Service.Cancelled",
      serviceId: next.id,
      tenantId: next.tenantId,
      organizationId: next.organizationId,
      bookingId: next.bookingId,
      serviceSequence: next.serviceSequence,
      status: next.status,
      cancelReasonCode,
      occurredAt,
    }),
  ]);
}
