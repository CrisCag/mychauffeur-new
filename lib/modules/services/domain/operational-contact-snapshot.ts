import { DomainValidationError } from "./errors";

export type OperationalContactSnapshot = {
  readonly primaryPassengerDisplayName?: string;
  readonly phone?: string;
  readonly email?: string;
};

export type OperationalContactSnapshotInput = {
  primaryPassengerDisplayName?: string;
  phone?: string;
  email?: string;
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

/**
 * Returns null when all fields empty; otherwise a frozen snapshot with ≥1 field.
 */
export function createOperationalContactSnapshot(
  input: OperationalContactSnapshotInput | null | undefined
): OperationalContactSnapshot | null {
  if (input === undefined || input === null) {
    return null;
  }
  const primaryPassengerDisplayName = normalizeOptionalText(
    input.primaryPassengerDisplayName,
    "primaryPassengerDisplayName",
    200
  );
  let email = normalizeOptionalText(input.email, "email", 254);
  if (email !== undefined) {
    email = email.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new DomainValidationError("email is invalid");
    }
  }
  let phone = normalizeOptionalText(input.phone, "phone", 32);
  if (phone !== undefined) {
    phone = phone.replace(/\s+/g, " ").trim();
    if (!/^\+?[\d][\d\s().-]{4,30}$/.test(phone)) {
      throw new DomainValidationError("phone is invalid");
    }
  }

  if (!primaryPassengerDisplayName && !email && !phone) {
    return null;
  }

  return Object.freeze({
    ...(primaryPassengerDisplayName !== undefined
      ? { primaryPassengerDisplayName }
      : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(email !== undefined ? { email } : {}),
  });
}

export function cloneOperationalContactSnapshot(
  contact: OperationalContactSnapshot | null
): OperationalContactSnapshot | null {
  if (!contact) {
    return null;
  }
  return createOperationalContactSnapshot({ ...contact });
}

export function operationalContactsEqual(
  a: OperationalContactSnapshot | null,
  b: OperationalContactSnapshot | null
): boolean {
  if (a === null && b === null) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  return (
    a.primaryPassengerDisplayName === b.primaryPassengerDisplayName &&
    a.phone === b.phone &&
    a.email === b.email
  );
}
