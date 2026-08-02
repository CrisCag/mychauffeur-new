import { DomainValidationError } from "./errors";
import type { ServiceType } from "./service-type";
import {
  cloneLocationSnapshot,
  createLocationSnapshot,
  serializeLocationSnapshot,
  type LocationSnapshot,
  type LocationSnapshotInput,
} from "./location-snapshot";
import {
  cloneStopSnapshot,
  createStopSnapshot,
  serializeStopSnapshot,
  type StopSnapshot,
  type StopSnapshotInput,
} from "./stop-snapshot";

export type RoutePlanSnapshot = {
  readonly pickup: LocationSnapshot;
  readonly dropoff: LocationSnapshot | null;
  readonly stops: readonly StopSnapshot[];
  readonly estimatedDistanceMeters?: number;
  readonly estimatedDurationMinutes?: number;
  readonly routeEstimateProviderRef?: string;
  readonly routeEstimateVersion?: string;
};

export type RoutePlanSnapshotInput = {
  pickup: LocationSnapshot | LocationSnapshotInput;
  dropoff?: LocationSnapshot | LocationSnapshotInput | null;
  stops?: readonly StopSnapshotInput[];
  estimatedDistanceMeters?: number | null;
  estimatedDurationMinutes?: number | null;
  routeEstimateProviderRef?: string;
  routeEstimateVersion?: string;
};

function asLocation(
  value: LocationSnapshot | LocationSnapshotInput
): LocationSnapshot {
  if (Object.isFrozen(value) && "displayLabel" in value) {
    return cloneLocationSnapshot(value as LocationSnapshot);
  }
  return createLocationSnapshot(value as LocationSnapshotInput);
}

export function createRoutePlanSnapshot(
  input: RoutePlanSnapshotInput,
  serviceType: ServiceType
): RoutePlanSnapshot {
  const pickup = asLocation(input.pickup);

  let dropoff: LocationSnapshot | null = null;
  if (input.dropoff !== undefined && input.dropoff !== null) {
    dropoff = asLocation(input.dropoff);
  }
  if (serviceType === "TRANSFER" && dropoff === null) {
    throw new DomainValidationError("TRANSFER requires dropoff");
  }

  const rawStops = input.stops ?? [];
  const stops = rawStops.map((stop, index) =>
    createStopSnapshot({
      ...stop,
      sequence: stop.sequence ?? index + 1,
    })
  );
  for (let i = 0; i < stops.length; i += 1) {
    if (stops[i].sequence !== i + 1) {
      throw new DomainValidationError("stops must be consecutive from 1");
    }
  }

  let estimatedDistanceMeters: number | undefined;
  if (
    input.estimatedDistanceMeters !== undefined &&
    input.estimatedDistanceMeters !== null
  ) {
    if (
      !Number.isSafeInteger(input.estimatedDistanceMeters) ||
      input.estimatedDistanceMeters < 0
    ) {
      throw new DomainValidationError("estimatedDistanceMeters is invalid");
    }
    estimatedDistanceMeters = input.estimatedDistanceMeters;
  }

  let estimatedDurationMinutes: number | undefined;
  if (
    input.estimatedDurationMinutes !== undefined &&
    input.estimatedDurationMinutes !== null
  ) {
    if (
      !Number.isSafeInteger(input.estimatedDurationMinutes) ||
      input.estimatedDurationMinutes < 1
    ) {
      throw new DomainValidationError("estimatedDurationMinutes is invalid");
    }
    estimatedDurationMinutes = input.estimatedDurationMinutes;
  }

  const routeEstimateProviderRef = input.routeEstimateProviderRef
    ?.trim()
    ? input.routeEstimateProviderRef.trim().slice(0, 128)
    : undefined;
  const routeEstimateVersion = input.routeEstimateVersion?.trim()
    ? input.routeEstimateVersion.trim().slice(0, 64)
    : undefined;

  return Object.freeze({
    pickup,
    dropoff,
    stops: Object.freeze(stops.map((s) => cloneStopSnapshot(s))),
    ...(estimatedDistanceMeters !== undefined
      ? { estimatedDistanceMeters }
      : {}),
    ...(estimatedDurationMinutes !== undefined
      ? { estimatedDurationMinutes }
      : {}),
    ...(routeEstimateProviderRef !== undefined
      ? { routeEstimateProviderRef }
      : {}),
    ...(routeEstimateVersion !== undefined ? { routeEstimateVersion } : {}),
  });
}

export function cloneRoutePlanSnapshot(
  plan: RoutePlanSnapshot,
  serviceType: ServiceType
): RoutePlanSnapshot {
  return createRoutePlanSnapshot(
    {
      pickup: plan.pickup,
      dropoff: plan.dropoff,
      stops: plan.stops.map((s) => ({
        sequence: s.sequence,
        location: s.location,
        plannedDurationMinutes: s.plannedDurationMinutes,
        optional: s.optional,
        commercialStopRef: s.commercialStopRef,
      })),
      estimatedDistanceMeters: plan.estimatedDistanceMeters,
      estimatedDurationMinutes: plan.estimatedDurationMinutes,
      routeEstimateProviderRef: plan.routeEstimateProviderRef,
      routeEstimateVersion: plan.routeEstimateVersion,
    },
    serviceType
  );
}

export function serializeRoutePlanSnapshot(
  plan: RoutePlanSnapshot
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    pickup: serializeLocationSnapshot(plan.pickup),
    dropoff: plan.dropoff ? serializeLocationSnapshot(plan.dropoff) : null,
    stops: Object.freeze(plan.stops.map((s) => serializeStopSnapshot(s))),
    ...(plan.estimatedDistanceMeters !== undefined
      ? { estimatedDistanceMeters: plan.estimatedDistanceMeters }
      : {}),
    ...(plan.estimatedDurationMinutes !== undefined
      ? { estimatedDurationMinutes: plan.estimatedDurationMinutes }
      : {}),
    ...(plan.routeEstimateProviderRef !== undefined
      ? { routeEstimateProviderRef: plan.routeEstimateProviderRef }
      : {}),
    ...(plan.routeEstimateVersion !== undefined
      ? { routeEstimateVersion: plan.routeEstimateVersion }
      : {}),
  });
}

function locationsEqual(
  a: LocationSnapshot,
  b: LocationSnapshot
): boolean {
  return (
    a.displayLabel === b.displayLabel &&
    a.addressLine === b.addressLine &&
    a.city === b.city &&
    a.region === b.region &&
    a.postalCode === b.postalCode &&
    a.countryCode === b.countryCode &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude &&
    a.timezone === b.timezone &&
    a.meetingPointNote === b.meetingPointNote &&
    a.externalPlaceRef === b.externalPlaceRef
  );
}

/** Structural equality of normalized RoutePlan snapshots (no JSON). */
export function routePlansEqual(
  a: RoutePlanSnapshot,
  b: RoutePlanSnapshot
): boolean {
  if (a.stops.length !== b.stops.length) {
    return false;
  }
  for (let i = 0; i < a.stops.length; i += 1) {
    const sa = a.stops[i];
    const sb = b.stops[i];
    if (
      sa.sequence !== sb.sequence ||
      sa.optional !== sb.optional ||
      sa.plannedDurationMinutes !== sb.plannedDurationMinutes ||
      sa.commercialStopRef !== sb.commercialStopRef ||
      !locationsEqual(sa.location, sb.location)
    ) {
      return false;
    }
  }
  const dropoffEqual =
    a.dropoff === null && b.dropoff === null
      ? true
      : a.dropoff !== null &&
        b.dropoff !== null &&
        locationsEqual(a.dropoff, b.dropoff);
  return (
    locationsEqual(a.pickup, b.pickup) &&
    dropoffEqual &&
    a.estimatedDistanceMeters === b.estimatedDistanceMeters &&
    a.estimatedDurationMinutes === b.estimatedDurationMinutes &&
    a.routeEstimateProviderRef === b.routeEstimateProviderRef &&
    a.routeEstimateVersion === b.routeEstimateVersion
  );
}
