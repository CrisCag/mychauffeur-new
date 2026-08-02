import { DomainValidationError } from "./errors";

/**
 * Minimized contact proposal for a Quote (Step 7).
 * No document IDs, credentials, or unnecessary PII.
 */
export type QuoteContactProposal = {
  readonly bookerDisplayName?: string;
  readonly bookerEmail?: string;
  readonly bookerPhone?: string;
  readonly primaryPassengerDisplayName?: string;
};

export type QuoteContactProposalInput = {
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
  const collapsed = normalized.replace(/\s+/g, " ").trim();
  if (!/^\+?[\d][\d\s().-]{4,30}$/.test(collapsed)) {
    throw new DomainValidationError("bookerPhone is invalid");
  }
  return collapsed;
}

export function createQuoteContactProposal(
  input: QuoteContactProposalInput
): QuoteContactProposal {
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
    throw new DomainValidationError("contactProposal is empty");
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

export function cloneQuoteContactProposal(
  proposal: QuoteContactProposal
): QuoteContactProposal {
  return createQuoteContactProposal({ ...proposal });
}

export function serializeQuoteContactProposal(
  proposal: QuoteContactProposal
): Readonly<Record<string, string>> {
  const out: Record<string, string> = {};
  if (proposal.bookerDisplayName !== undefined) {
    out.bookerDisplayName = proposal.bookerDisplayName;
  }
  if (proposal.bookerEmail !== undefined) {
    out.bookerEmail = proposal.bookerEmail;
  }
  if (proposal.bookerPhone !== undefined) {
    out.bookerPhone = proposal.bookerPhone;
  }
  if (proposal.primaryPassengerDisplayName !== undefined) {
    out.primaryPassengerDisplayName = proposal.primaryPassengerDisplayName;
  }
  return Object.freeze(out);
}
