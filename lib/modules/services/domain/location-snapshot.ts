import { DomainValidationError } from "./errors";

/** Prudent IANA-like timezone token (not a full tzdb). */
const IANA_LIKE =
  /^(UTC|GMT|[A-Za-z]+\/[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+)?)$/;

export type LocationSnapshot = {
  readonly displayLabel: string;
  readonly addressLine?: string;
  readonly city?: string;
  readonly region?: string;
  readonly postalCode?: string;
  readonly countryCode?: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly timezone?: string;
  readonly meetingPointNote?: string;
  readonly externalPlaceRef?: string;
};

export type LocationSnapshotInput = {
  displayLabel: string;
  addressLine?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string;
  meetingPointNote?: string;
  externalPlaceRef?: string;
};

function normalizeOptionalText(
  value: string | undefined,
  field: string,
  maxLen: number
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return undefined;
  }
  if (normalized.length > maxLen) {
    throw new DomainValidationError(`${field} is too long`);
  }
  return normalized;
}

function normalizeRequiredLabel(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > 200) {
    throw new DomainValidationError("displayLabel is invalid");
  }
  return normalized;
}

export function normalizeTimezoneToken(value: string): string {
  const normalized = value.trim();
  if (!IANA_LIKE.test(normalized) || normalized.length > 64) {
    throw new DomainValidationError("timezone is invalid");
  }
  return normalized;
}

export function createLocationSnapshot(
  input: LocationSnapshotInput
): LocationSnapshot {
  const displayLabel = normalizeRequiredLabel(input.displayLabel);
  const addressLine = normalizeOptionalText(input.addressLine, "addressLine", 300);
  const city = normalizeOptionalText(input.city, "city", 100);
  const region = normalizeOptionalText(input.region, "region", 100);
  const postalCode = normalizeOptionalText(input.postalCode, "postalCode", 32);
  const countryRaw = normalizeOptionalText(input.countryCode, "countryCode", 2);
  const countryCode = countryRaw ? countryRaw.toUpperCase() : undefined;
  if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) {
    throw new DomainValidationError("countryCode is invalid");
  }

  const latProvided = input.latitude !== undefined && input.latitude !== null;
  const lngProvided = input.longitude !== undefined && input.longitude !== null;
  if (latProvided !== lngProvided) {
    throw new DomainValidationError("latitude and longitude must be all-or-none");
  }
  let latitude: number | undefined;
  let longitude: number | undefined;
  if (latProvided && lngProvided) {
    if (
      typeof input.latitude !== "number" ||
      typeof input.longitude !== "number" ||
      !Number.isFinite(input.latitude) ||
      !Number.isFinite(input.longitude) ||
      input.latitude < -90 ||
      input.latitude > 90 ||
      input.longitude < -180 ||
      input.longitude > 180
    ) {
      throw new DomainValidationError("coordinates are invalid");
    }
    latitude = input.latitude;
    longitude = input.longitude;
  }

  const timezone = input.timezone
    ? normalizeTimezoneToken(input.timezone)
    : undefined;
  const meetingPointNote = normalizeOptionalText(
    input.meetingPointNote,
    "meetingPointNote",
    300
  );
  const externalPlaceRef = normalizeOptionalText(
    input.externalPlaceRef,
    "externalPlaceRef",
    128
  );

  return Object.freeze({
    displayLabel,
    ...(addressLine !== undefined ? { addressLine } : {}),
    ...(city !== undefined ? { city } : {}),
    ...(region !== undefined ? { region } : {}),
    ...(postalCode !== undefined ? { postalCode } : {}),
    ...(countryCode !== undefined ? { countryCode } : {}),
    ...(latitude !== undefined ? { latitude } : {}),
    ...(longitude !== undefined ? { longitude } : {}),
    ...(timezone !== undefined ? { timezone } : {}),
    ...(meetingPointNote !== undefined ? { meetingPointNote } : {}),
    ...(externalPlaceRef !== undefined ? { externalPlaceRef } : {}),
  });
}

export function cloneLocationSnapshot(
  location: LocationSnapshot
): LocationSnapshot {
  return createLocationSnapshot({ ...location });
}

export function serializeLocationSnapshot(
  location: LocationSnapshot
): Readonly<Record<string, string | number>> {
  return Object.freeze({
    displayLabel: location.displayLabel,
    ...(location.addressLine !== undefined
      ? { addressLine: location.addressLine }
      : {}),
    ...(location.city !== undefined ? { city: location.city } : {}),
    ...(location.region !== undefined ? { region: location.region } : {}),
    ...(location.postalCode !== undefined
      ? { postalCode: location.postalCode }
      : {}),
    ...(location.countryCode !== undefined
      ? { countryCode: location.countryCode }
      : {}),
    ...(location.latitude !== undefined ? { latitude: location.latitude } : {}),
    ...(location.longitude !== undefined
      ? { longitude: location.longitude }
      : {}),
    ...(location.timezone !== undefined ? { timezone: location.timezone } : {}),
    ...(location.meetingPointNote !== undefined
      ? { meetingPointNote: location.meetingPointNote }
      : {}),
    ...(location.externalPlaceRef !== undefined
      ? { externalPlaceRef: location.externalPlaceRef }
      : {}),
  });
}
