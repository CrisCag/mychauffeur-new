import { DomainValidationError } from "./errors";
import { normalizeTimezoneToken } from "./location-snapshot";

/** Maximum pickup flexibility window (12 hours). */
export const MAX_PICKUP_WINDOW_MINUTES = 12 * 60;

export type ServiceSchedule = {
  readonly scheduledPickupAt: Date;
  readonly timezone: string;
  readonly requestedArrivalAt: Date | null;
  readonly pickupWindowMinutes: number | null;
};

export type ServiceScheduleInput = {
  scheduledPickupAt: Date;
  timezone: string;
  requestedArrivalAt?: Date | null;
  pickupWindowMinutes?: number | null;
};

function assertClock(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new DomainValidationError(`${field} is invalid`);
  }
  return new Date(value.getTime());
}

export function createServiceSchedule(
  input: ServiceScheduleInput
): ServiceSchedule {
  const scheduledPickupAt = assertClock(
    input.scheduledPickupAt,
    "scheduledPickupAt"
  );
  const timezone = normalizeTimezoneToken(input.timezone);

  let requestedArrivalAt: Date | null = null;
  if (
    input.requestedArrivalAt !== undefined &&
    input.requestedArrivalAt !== null
  ) {
    requestedArrivalAt = assertClock(
      input.requestedArrivalAt,
      "requestedArrivalAt"
    );
    if (requestedArrivalAt.getTime() <= scheduledPickupAt.getTime()) {
      throw new DomainValidationError(
        "requestedArrivalAt must be after scheduledPickupAt"
      );
    }
  }

  let pickupWindowMinutes: number | null = null;
  if (
    input.pickupWindowMinutes !== undefined &&
    input.pickupWindowMinutes !== null
  ) {
    if (
      !Number.isSafeInteger(input.pickupWindowMinutes) ||
      input.pickupWindowMinutes < 0 ||
      input.pickupWindowMinutes > MAX_PICKUP_WINDOW_MINUTES
    ) {
      throw new DomainValidationError("pickupWindowMinutes is invalid");
    }
    pickupWindowMinutes = input.pickupWindowMinutes;
  }

  return Object.freeze({
    scheduledPickupAt,
    timezone,
    requestedArrivalAt,
    pickupWindowMinutes,
  });
}

export function cloneServiceSchedule(schedule: ServiceSchedule): ServiceSchedule {
  return createServiceSchedule({
    scheduledPickupAt: schedule.scheduledPickupAt,
    timezone: schedule.timezone,
    requestedArrivalAt: schedule.requestedArrivalAt,
    pickupWindowMinutes: schedule.pickupWindowMinutes,
  });
}

export function schedulesEqual(a: ServiceSchedule, b: ServiceSchedule): boolean {
  return (
    a.scheduledPickupAt.getTime() === b.scheduledPickupAt.getTime() &&
    a.timezone === b.timezone &&
    (a.requestedArrivalAt?.getTime() ?? null) ===
      (b.requestedArrivalAt?.getTime() ?? null) &&
    a.pickupWindowMinutes === b.pickupWindowMinutes
  );
}
