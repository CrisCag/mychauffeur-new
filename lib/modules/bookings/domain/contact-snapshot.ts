import { DomainValidationError } from "./errors";

/**
 * Minimized contact freeze at confirmation (MC-OS-032 §55).
 * No document IDs, no unnecessary PII, no secrets.
 */
export type ContactSnapshot = {
  readonly bookerDisplayName?: string;
  readonly bookerEmail?: string;
  readonly bookerPhone?: string;
  readonly primaryPassengerDisplayName?: string;
};

export type ContactSnapshotInput = {
  bookerDisplayName?: string;
  bookerEmail?: string;
  bookerPhone?: string;
  primaryPassengerDisplayName?: string;
};

function normalizeOptionalText(
  value: string | undefined,
  field: string,
  maxLen: number
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  if (normalized.length > maxLen) {
    throw new DomainValidationError(`${field} is too long`);
  }
  return normalized;
}

function normalizeEmail(email: string | undefined): string | undefined {
  const normalized = normalizeOptionalText(email, "bookerEmail", 254);
  if (normalized === undefined) {
    return undefined;
  }
  const lowered = normalized.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowered)) {
    throw new DomainValidationError("bookerEmail is invalid");
  }
  return lowered;
}

function normalizePhone(phone: string | undefined): string | undefined {
  const normalized = normalizeOptionalText(phone, "bookerPhone", 32);
  if (normalized === undefined) {
    return undefined;
  }
  // Collapse whitespace only — do not invent country codes or digits.
  const collapsed = normalized.replace(/\s+/g, " ").trim();
  if (!/^\+?[\d][\d\s().-]{4,30}$/.test(collapsed)) {
    throw new DomainValidationError("bookerPhone is invalid");
  }
  return collapsed;
}

export function createContactSnapshot(
  input: ContactSnapshotInput
): ContactSnapshot {
  const bookerDisplayName = normalizeOptionalText(
    input.bookerDisplayName,
    "bookerDisplayName",
    200
  );
  const bookerEmail = normalizeEmail(input.bookerEmail);
  const bookerPhone = normalizePhone(input.bookerPhone);
  const primaryPassengerDisplayName = normalizeOptionalText(
    input.primaryPassengerDisplayName,
    "primaryPassengerDisplayName",
    200
  );

  if (
    !bookerDisplayName &&
    !bookerEmail &&
    !bookerPhone &&
    !primaryPassengerDisplayName
  ) {
    throw new DomainValidationError("contactSnapshot is empty");
  }

  return Object.freeze({
    ...(bookerDisplayName !== undefined ? { bookerDisplayName } : {}),
    ...(bookerEmail !== undefined ? { bookerEmail } : {}),
    ...(bookerPhone !== undefined ? { bookerPhone } : {}),
    ...(primaryPassengerDisplayName !== undefined
      ? { primaryPassengerDisplayName }
      : {}),
  });
}

export function cloneContactSnapshot(
  snapshot: ContactSnapshot
): ContactSnapshot {
  return createContactSnapshot({ ...snapshot });
}

export function serializeContactSnapshot(
  snapshot: ContactSnapshot
): Readonly<Record<string, string>> {
  const out: Record<string, string> = {};
  if (snapshot.bookerDisplayName !== undefined) {
    out.bookerDisplayName = snapshot.bookerDisplayName;
  }
  if (snapshot.bookerEmail !== undefined) {
    out.bookerEmail = snapshot.bookerEmail;
  }
  if (snapshot.bookerPhone !== undefined) {
    out.bookerPhone = snapshot.bookerPhone;
  }
  if (snapshot.primaryPassengerDisplayName !== undefined) {
    out.primaryPassengerDisplayName = snapshot.primaryPassengerDisplayName;
  }
  return Object.freeze(out);
}
