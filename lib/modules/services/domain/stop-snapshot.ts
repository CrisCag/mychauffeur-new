import { DomainValidationError } from "./errors";
import {
  cloneLocationSnapshot,
  createLocationSnapshot,
  serializeLocationSnapshot,
  type LocationSnapshot,
  type LocationSnapshotInput,
} from "./location-snapshot";

export type StopSnapshot = {
  readonly sequence: number;
  readonly location: LocationSnapshot;
  readonly plannedDurationMinutes?: number;
  readonly optional: boolean;
  readonly commercialStopRef?: string;
};

export type StopSnapshotInput = {
  sequence: number;
  location: LocationSnapshot | LocationSnapshotInput;
  plannedDurationMinutes?: number | null;
  optional?: boolean;
  commercialStopRef?: string;
};

export function createStopSnapshot(input: StopSnapshotInput): StopSnapshot {
  if (!Number.isSafeInteger(input.sequence) || input.sequence < 1) {
    throw new DomainValidationError("stop sequence is invalid");
  }
  const location =
    "displayLabel" in input.location &&
    typeof (input.location as LocationSnapshot).displayLabel === "string" &&
    Object.isFrozen(input.location)
      ? cloneLocationSnapshot(input.location as LocationSnapshot)
      : createLocationSnapshot(input.location as LocationSnapshotInput);

  let plannedDurationMinutes: number | undefined;
  if (
    input.plannedDurationMinutes !== undefined &&
    input.plannedDurationMinutes !== null
  ) {
    if (
      !Number.isSafeInteger(input.plannedDurationMinutes) ||
      input.plannedDurationMinutes < 1
    ) {
      throw new DomainValidationError("plannedDurationMinutes is invalid");
    }
    plannedDurationMinutes = input.plannedDurationMinutes;
  }

  const commercialStopRef =
    input.commercialStopRef === undefined
      ? undefined
      : (() => {
          const normalized = input.commercialStopRef.trim();
          if (!normalized) {
            return undefined;
          }
          if (normalized.length > 128) {
            throw new DomainValidationError("commercialStopRef is too long");
          }
          return normalized;
        })();

  let optional = false;
  if (input.optional !== undefined) {
    if (typeof input.optional !== "boolean") {
      throw new DomainValidationError("optional is invalid");
    }
    optional = input.optional;
  }

  return Object.freeze({
    sequence: input.sequence,
    location,
    ...(plannedDurationMinutes !== undefined ? { plannedDurationMinutes } : {}),
    optional,
    ...(commercialStopRef !== undefined ? { commercialStopRef } : {}),
  });
}

export function cloneStopSnapshot(stop: StopSnapshot): StopSnapshot {
  return createStopSnapshot({
    sequence: stop.sequence,
    location: stop.location,
    plannedDurationMinutes: stop.plannedDurationMinutes,
    optional: stop.optional,
    commercialStopRef: stop.commercialStopRef,
  });
}

export function serializeStopSnapshot(
  stop: StopSnapshot
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    sequence: stop.sequence,
    location: serializeLocationSnapshot(stop.location),
    ...(stop.plannedDurationMinutes !== undefined
      ? { plannedDurationMinutes: stop.plannedDurationMinutes }
      : {}),
    optional: stop.optional,
    ...(stop.commercialStopRef !== undefined
      ? { commercialStopRef: stop.commercialStopRef }
      : {}),
  });
}
