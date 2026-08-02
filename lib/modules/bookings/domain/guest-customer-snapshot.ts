import { DomainValidationError } from "./errors";

/**
 * Minimal GuestCustomerSnapshot for Step 5.
 * Full Passenger / Contact models remain deferred (MC-OS-032).
 */
export type GuestCustomerSnapshot = {
  readonly displayName?: string;
  readonly email?: string;
  readonly phone?: string;
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
  const normalized = normalizeOptionalText(email, "guest email", 254);
  if (normalized === undefined) {
    return undefined;
  }
  const lowered = normalized.toLowerCase();
  // Minimal shape check — not full RFC validation; no PII in errors.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowered)) {
    throw new DomainValidationError("guest email is invalid");
  }
  return lowered;
}

export function createGuestCustomerSnapshot(input: {
  displayName?: string;
  email?: string;
  phone?: string;
}): GuestCustomerSnapshot {
  const displayName = normalizeOptionalText(
    input.displayName,
    "guest displayName",
    200
  );
  const email = normalizeEmail(input.email);
  const phone = normalizeOptionalText(input.phone, "guest phone", 32);

  if (!displayName && !email && !phone) {
    throw new DomainValidationError("guestCustomerSnapshot is empty");
  }

  return Object.freeze({
    ...(displayName !== undefined ? { displayName } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(phone !== undefined ? { phone } : {}),
  });
}
