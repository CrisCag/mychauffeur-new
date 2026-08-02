import { DomainValidationError } from "./errors";

/**
 * Billing party proposal for a Quote (Step 7).
 * No card primary account numbers, CVV, IBAN, tokens, or PSP secrets.
 */
export type QuoteBillingPartyType =
  | "INDIVIDUAL"
  | "COMPANY"
  | "AGENCY"
  | "CORPORATE";

export type QuoteBillingProposal = {
  readonly billingPartyType: QuoteBillingPartyType;
  readonly billingPartyName: string;
  readonly billingCountryCode: string;
  readonly taxId?: string;
  readonly billingCity?: string;
  readonly billingPostalCode?: string;
};

export type QuoteBillingProposalInput = {
  billingPartyType: QuoteBillingPartyType | string;
  billingPartyName: string;
  billingCountryCode: string;
  taxId?: string;
  billingCity?: string;
  billingPostalCode?: string;
};

const BILLING_PARTY_TYPES = [
  "INDIVIDUAL",
  "COMPANY",
  "AGENCY",
  "CORPORATE",
] as const;

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

export function createQuoteBillingProposal(
  input: QuoteBillingProposalInput
): QuoteBillingProposal {
  const billingPartyType = String(input.billingPartyType).trim().toUpperCase();
  if (!(BILLING_PARTY_TYPES as readonly string[]).includes(billingPartyType)) {
    throw new DomainValidationError("billingPartyType is invalid");
  }

  const billingPartyName = input.billingPartyName.trim();
  if (!billingPartyName || billingPartyName.length > 200) {
    throw new DomainValidationError("billingPartyName is invalid");
  }

  const billingCountryCode = input.billingCountryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(billingCountryCode)) {
    throw new DomainValidationError("billingCountryCode is invalid");
  }

  const taxId = normalizeOptionalText(input.taxId, "taxId", 64);
  if (taxId !== undefined && !/^[A-Z0-9./-]+$/i.test(taxId)) {
    throw new DomainValidationError("taxId is invalid");
  }

  const billingCity = normalizeOptionalText(
    input.billingCity,
    "billingCity",
    100
  );
  const billingPostalCode = normalizeOptionalText(
    input.billingPostalCode,
    "billingPostalCode",
    32
  );

  return Object.freeze({
    billingPartyType: billingPartyType as QuoteBillingPartyType,
    billingPartyName,
    billingCountryCode,
    ...(taxId !== undefined ? { taxId: taxId.toUpperCase() } : {}),
    ...(billingCity !== undefined ? { billingCity } : {}),
    ...(billingPostalCode !== undefined
      ? { billingPostalCode: billingPostalCode.toUpperCase() }
      : {}),
  });
}

export function cloneQuoteBillingProposal(
  proposal: QuoteBillingProposal
): QuoteBillingProposal {
  return createQuoteBillingProposal({ ...proposal });
}

export function serializeQuoteBillingProposal(
  proposal: QuoteBillingProposal
): Readonly<Record<string, string>> {
  const out: Record<string, string> = {
    billingPartyType: proposal.billingPartyType,
    billingPartyName: proposal.billingPartyName,
    billingCountryCode: proposal.billingCountryCode,
  };
  if (proposal.taxId !== undefined) {
    out.taxId = proposal.taxId;
  }
  if (proposal.billingCity !== undefined) {
    out.billingCity = proposal.billingCity;
  }
  if (proposal.billingPostalCode !== undefined) {
    out.billingPostalCode = proposal.billingPostalCode;
  }
  return Object.freeze(out);
}
