import { DomainValidationError } from "./errors";

export const REQUESTED_VEHICLE_CATEGORIES = ["SEDAN", "VAN", "OTHER"] as const;

export type RequestedVehicleCategory =
  (typeof REQUESTED_VEHICLE_CATEGORIES)[number];

export function isRequestedVehicleCategory(
  value: string
): value is RequestedVehicleCategory {
  return (REQUESTED_VEHICLE_CATEGORIES as readonly string[]).includes(value);
}

export type ServiceRequirements = {
  readonly passengerCount: number;
  readonly luggageCount: number | null;
  readonly childSeatsCount: number | null;
  readonly requestedVehicleCategory: RequestedVehicleCategory;
  readonly accessibilityRequired: boolean;
  readonly preferredLanguageCode: string | null;
  readonly meetAndGreetRequired: boolean;
  readonly flightAwarePickup: boolean;
};

export type ServiceRequirementsInput = {
  passengerCount: number;
  luggageCount?: number | null;
  childSeatsCount?: number | null;
  requestedVehicleCategory: RequestedVehicleCategory | string;
  accessibilityRequired?: boolean;
  preferredLanguageCode?: string | null;
  meetAndGreetRequired?: boolean;
  flightAwarePickup?: boolean;
};

export function createServiceRequirements(
  input: ServiceRequirementsInput
): ServiceRequirements {
  if (!Number.isSafeInteger(input.passengerCount) || input.passengerCount < 1) {
    throw new DomainValidationError("passengerCount is invalid");
  }
  if (!isRequestedVehicleCategory(String(input.requestedVehicleCategory))) {
    throw new DomainValidationError("requestedVehicleCategory is invalid");
  }

  let luggageCount: number | null = null;
  if (input.luggageCount !== undefined && input.luggageCount !== null) {
    if (!Number.isSafeInteger(input.luggageCount) || input.luggageCount < 0) {
      throw new DomainValidationError("luggageCount is invalid");
    }
    luggageCount = input.luggageCount;
  }

  let childSeatsCount: number | null = null;
  if (input.childSeatsCount !== undefined && input.childSeatsCount !== null) {
    if (
      !Number.isSafeInteger(input.childSeatsCount) ||
      input.childSeatsCount < 0
    ) {
      throw new DomainValidationError("childSeatsCount is invalid");
    }
    childSeatsCount = input.childSeatsCount;
  }

  let preferredLanguageCode: string | null = null;
  if (
    input.preferredLanguageCode !== undefined &&
    input.preferredLanguageCode !== null
  ) {
    const normalized = input.preferredLanguageCode.trim().toLowerCase();
    if (normalized) {
      if (!/^[a-z]{2}(-[a-z0-9]{2,8})?$/.test(normalized) || normalized.length > 16) {
        throw new DomainValidationError("preferredLanguageCode is invalid");
      }
      preferredLanguageCode = normalized;
    }
  }

  return Object.freeze({
    passengerCount: input.passengerCount,
    luggageCount,
    childSeatsCount,
    requestedVehicleCategory: input.requestedVehicleCategory as RequestedVehicleCategory,
    accessibilityRequired: parseOptionalBoolean(
      input.accessibilityRequired,
      "accessibilityRequired",
      false
    ),
    preferredLanguageCode,
    meetAndGreetRequired: parseOptionalBoolean(
      input.meetAndGreetRequired,
      "meetAndGreetRequired",
      false
    ),
    flightAwarePickup: parseOptionalBoolean(
      input.flightAwarePickup,
      "flightAwarePickup",
      false
    ),
  });
}

function parseOptionalBoolean(
  value: boolean | undefined,
  field: string,
  defaultValue: boolean
): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  if (typeof value !== "boolean") {
    throw new DomainValidationError(`${field} is invalid`);
  }
  return value;
}

export function cloneServiceRequirements(
  requirements: ServiceRequirements
): ServiceRequirements {
  return createServiceRequirements({ ...requirements });
}

export function requirementsEqual(
  a: ServiceRequirements,
  b: ServiceRequirements
): boolean {
  return (
    a.passengerCount === b.passengerCount &&
    a.luggageCount === b.luggageCount &&
    a.childSeatsCount === b.childSeatsCount &&
    a.requestedVehicleCategory === b.requestedVehicleCategory &&
    a.accessibilityRequired === b.accessibilityRequired &&
    a.preferredLanguageCode === b.preferredLanguageCode &&
    a.meetAndGreetRequired === b.meetAndGreetRequired &&
    a.flightAwarePickup === b.flightAwarePickup
  );
}
