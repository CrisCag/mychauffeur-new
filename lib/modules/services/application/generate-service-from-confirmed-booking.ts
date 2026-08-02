import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { BookingRepository } from "@/lib/modules/bookings";
import { asBookingId } from "@/lib/modules/bookings";
import {
  createServiceFromConfirmedBooking,
  type CreateServiceFromConfirmedBookingInput,
  type Service,
  type ServiceOperationResult,
} from "../domain/service";
import { asServiceGenerationKey } from "../domain/service-generation-key";
import { asServiceNumber } from "../domain/service-number";
import { asServiceSequence } from "../domain/service-sequence";
import { isServiceType } from "../domain/service-type";
import {
  createRoutePlanSnapshot,
  routePlansEqual,
} from "../domain/route-plan-snapshot";
import {
  createOperationalContactSnapshot,
  operationalContactsEqual,
} from "../domain/operational-contact-snapshot";
import {
  DuplicateServiceGenerationKeyError,
  DuplicateServiceNumberError,
  DuplicateServiceSequenceError,
  ServiceBookingNotEligibleError,
  ServiceNotFoundError,
} from "../domain/errors";
import type { ServiceRepository } from "./service-repository";

/**
 * Application command: generate one Service from a CONFIRMED Booking.
 * Creates and saves a single Service per command (idempotent via generationKey).
 * Batch multi-Service atomic orchestration is future debt — not implemented.
 *
 * Replay policy: same generationKey returns the existing Service when BookingId,
 * ServiceNumber, sequence, type, scope, RoutePlan and operational contact match.
 * Command ServiceId is ignored on replay (existing id is authoritative).
 * Schedule/requirements may differ after PLANNED adjustments — not compared on replay.
 */
export type GenerateServiceFromConfirmedBookingCommand = Omit<
  CreateServiceFromConfirmedBookingInput,
  "tenantId" | "organizationId" | "bookingId"
> & {
  tenantId: TenantId;
  organizationId: OrganizationId;
  bookingId: string;
};

export type GenerateServiceFromConfirmedBookingResult = {
  readonly service: Service;
  readonly events: ServiceOperationResult["events"];
  readonly created: boolean;
};

export type GenerateServiceFromConfirmedBookingDeps = {
  bookingRepository: BookingRepository;
  serviceRepository: ServiceRepository;
};

function assertGenerationReplayMatches(
  existing: Service,
  command: GenerateServiceFromConfirmedBookingCommand,
  bookingId: string
): void {
  if (!isServiceType(String(command.serviceType))) {
    throw new DuplicateServiceGenerationKeyError();
  }
  const serviceNumber = asServiceNumber(String(command.serviceNumber));
  const serviceSequence = asServiceSequence(command.serviceSequence);
  const serviceType = command.serviceType;

  if (
    existing.serviceNumber !== serviceNumber ||
    String(existing.bookingId) !== String(bookingId) ||
    existing.serviceSequence !== serviceSequence ||
    existing.serviceType !== serviceType ||
    existing.tenantId !== command.tenantId ||
    existing.organizationId !== command.organizationId
  ) {
    throw new DuplicateServiceGenerationKeyError();
  }

  const commandRoutePlan = createRoutePlanSnapshot(
    command.routePlan,
    serviceType
  );
  if (!routePlansEqual(existing.routePlan, commandRoutePlan)) {
    throw new DuplicateServiceGenerationKeyError();
  }

  const commandContact = createOperationalContactSnapshot(
    command.operationalContact
  );
  if (!operationalContactsEqual(existing.operationalContact, commandContact)) {
    throw new DuplicateServiceGenerationKeyError();
  }
}

/**
 * Verifies Booking via port (CONFIRMED + scope), then creates one Service.
 * Domain Service Aggregate never imports bookings.
 */
export async function generateServiceFromConfirmedBooking(
  deps: GenerateServiceFromConfirmedBookingDeps,
  command: GenerateServiceFromConfirmedBookingCommand
): Promise<GenerateServiceFromConfirmedBookingResult> {
  const tenantId = command.tenantId;
  const organizationId = command.organizationId;
  const bookingId = asBookingId(command.bookingId);
  const generationKey = asServiceGenerationKey(String(command.generationKey));

  const existing = await deps.serviceRepository.findByGenerationKey(
    tenantId,
    organizationId,
    generationKey
  );
  if (existing) {
    assertGenerationReplayMatches(existing, command, bookingId);
    return {
      service: existing,
      events: Object.freeze([]),
      created: false,
    };
  }

  const booking = await deps.bookingRepository.findById(
    tenantId,
    organizationId,
    bookingId
  );
  if (!booking) {
    throw new ServiceNotFoundError("Booking not found");
  }
  if (
    booking.tenantId !== tenantId ||
    booking.organizationId !== organizationId
  ) {
    throw new ServiceNotFoundError("Booking not found");
  }
  if (booking.status !== "CONFIRMED") {
    throw new ServiceBookingNotEligibleError();
  }

  const { service, events } = createServiceFromConfirmedBooking({
    ...command,
    tenantId,
    organizationId,
    bookingId: booking.id,
    generationKey,
  });

  try {
    await deps.serviceRepository.save(service);
  } catch (error) {
    const isUniquenessRace =
      error instanceof DuplicateServiceGenerationKeyError ||
      error instanceof DuplicateServiceNumberError ||
      error instanceof DuplicateServiceSequenceError;
    if (!isUniquenessRace) {
      throw error;
    }
    // Concurrent create may win on any uniqueness index — resolve via generationKey.
    const raced = await deps.serviceRepository.findByGenerationKey(
      tenantId,
      organizationId,
      generationKey
    );
    if (!raced) {
      throw error;
    }
    assertGenerationReplayMatches(raced, command, bookingId);
    return {
      service: raced,
      events: Object.freeze([]),
      created: false,
    };
  }

  return {
    service,
    events,
    created: true,
  };
}
