import { DomainValidationError } from "./errors";

/**
 * Minimal guest snapshot for Quote create (Step 7).
 * Independent from bookings GuestCustomerSnapshot.
 */
export type QuoteGuestCustomerSnapshot = {
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowered)) {
    throw new DomainValidationError("guest email is invalid");
  }
  return lowered;
}

export function createQuoteGuestCustomerSnapshot(input: {
  displayName?: string;
  email?: string;
  phone?: string;
}): QuoteGuestCustomerSnapshot {
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
