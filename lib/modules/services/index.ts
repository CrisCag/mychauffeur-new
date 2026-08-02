export type { ServiceId } from "./domain/service-id";
export { asServiceId } from "./domain/service-id";

export type { ServiceNumber } from "./domain/service-number";
export {
  asServiceNumber,
  normalizeServiceNumber,
  createServiceNumberFromToken,
} from "./domain/service-number";

export type { ServiceType } from "./domain/service-type";
export { SERVICE_TYPES, isServiceType } from "./domain/service-type";

export type { ServiceStatus } from "./domain/service-status";
export {
  SERVICE_STATUSES,
  isServiceStatus,
  isTerminalServiceStatus,
} from "./domain/service-status";

export type { ServiceSequence } from "./domain/service-sequence";
export { asServiceSequence } from "./domain/service-sequence";

export type { ServiceGenerationKey } from "./domain/service-generation-key";
export { asServiceGenerationKey } from "./domain/service-generation-key";

export type { ServiceBookingId } from "./domain/service-booking-id";
export { asServiceBookingId } from "./domain/service-booking-id";

export type { ServiceCancellationReason } from "./domain/service-cancellation-reason";
export {
  SERVICE_CANCELLATION_REASONS,
  isServiceCancellationReason,
} from "./domain/service-cancellation-reason";

export type {
  LocationSnapshot,
  LocationSnapshotInput,
} from "./domain/location-snapshot";
export {
  createLocationSnapshot,
  cloneLocationSnapshot,
  serializeLocationSnapshot,
  normalizeTimezoneToken,
} from "./domain/location-snapshot";

export type {
  StopSnapshot,
  StopSnapshotInput,
} from "./domain/stop-snapshot";
export {
  createStopSnapshot,
  cloneStopSnapshot,
  serializeStopSnapshot,
} from "./domain/stop-snapshot";

export type {
  RoutePlanSnapshot,
  RoutePlanSnapshotInput,
} from "./domain/route-plan-snapshot";
export {
  createRoutePlanSnapshot,
  cloneRoutePlanSnapshot,
  serializeRoutePlanSnapshot,
  routePlansEqual,
} from "./domain/route-plan-snapshot";

export type {
  ServiceSchedule,
  ServiceScheduleInput,
} from "./domain/service-schedule";
export {
  MAX_PICKUP_WINDOW_MINUTES,
  createServiceSchedule,
  cloneServiceSchedule,
  schedulesEqual,
} from "./domain/service-schedule";

export type {
  ServiceRequirements,
  ServiceRequirementsInput,
  RequestedVehicleCategory,
} from "./domain/service-requirements";
export {
  REQUESTED_VEHICLE_CATEGORIES,
  isRequestedVehicleCategory,
  createServiceRequirements,
  cloneServiceRequirements,
  requirementsEqual,
} from "./domain/service-requirements";

export type {
  OperationalContactSnapshot,
  OperationalContactSnapshotInput,
} from "./domain/operational-contact-snapshot";
export {
  createOperationalContactSnapshot,
  cloneOperationalContactSnapshot,
  operationalContactsEqual,
} from "./domain/operational-contact-snapshot";

export type {
  Service,
  ServiceOperationResult,
  CreateServiceFromConfirmedBookingInput,
  RehydrateServiceInput,
  AdjustPlannedServiceScheduleInput,
  AdjustPlannedServiceRequirementsInput,
} from "./domain/service";
/**
 * Domain factory createServiceFromConfirmedBooking is intentionally NOT
 * re-exported: Application must verify Booking CONFIRMED via repository port.
 * Tests may deep-import from domain/service.
 */
export {
  rehydrateService,
  markServiceReadyForAssignment,
  adjustPlannedServiceSchedule,
  adjustPlannedServiceRequirements,
  cancelService,
} from "./domain/service";

export type {
  ServiceDomainEvent,
  ServiceDomainEventType,
} from "./domain/service-events";
export { createServiceDomainEvent } from "./domain/service-events";

export {
  DomainValidationError,
  InvalidServiceIdError,
  InvalidServiceNumberError,
  InvalidServiceStateTransitionError,
  ServiceVersionConflictError,
  ServiceNotFoundError,
  DuplicateServiceNumberError,
  DuplicateServiceGenerationKeyError,
  DuplicateServiceSequenceError,
  ServiceBookingNotEligibleError,
  ServiceCancellationConflictError,
} from "./domain/errors";

export type {
  ServiceRepository,
  ServiceBookingPage,
} from "./application/service-repository";

export type {
  GenerateServiceFromConfirmedBookingCommand,
  GenerateServiceFromConfirmedBookingResult,
  GenerateServiceFromConfirmedBookingDeps,
} from "./application/generate-service-from-confirmed-booking";
export { generateServiceFromConfirmedBooking } from "./application/generate-service-from-confirmed-booking";
