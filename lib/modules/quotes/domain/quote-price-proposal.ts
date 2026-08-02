import { DomainValidationError } from "./errors";

/**
 * Customer-facing quote price proposal (Step 7).
 * Tip / margin / payout / internal commission excluded.
 * Amounts are safe integer minor units only.
 */
export type QuotePriceProposal = {
  readonly currency: string;
  readonly pricingVersion: string;
  readonly baseAmountMinor: number;
  readonly taxAmountMinor: number;
  readonly vatAmountMinor: number;
  readonly supplementsAmountMinor: number;
  readonly discountsAmountMinor: number;
  readonly totalCustomerAmountMinor: number;
};

export type QuotePriceProposalInput = {
  currency: string;
  pricingVersion: string;
  baseAmountMinor: number;
  taxAmountMinor?: number;
  vatAmountMinor?: number;
  supplementsAmountMinor?: number;
  discountsAmountMinor?: number;
  totalCustomerAmountMinor: number;
};

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function assertMinorAmount(value: number, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new DomainValidationError(`${field} is invalid`);
  }
  return value;
}

export function createQuotePriceProposal(
  input: QuotePriceProposalInput
): QuotePriceProposal {
  const currency = input.currency.trim().toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new DomainValidationError("currency is invalid");
  }

  const pricingVersion = input.pricingVersion.trim();
  if (!pricingVersion || pricingVersion.length > 64) {
    throw new DomainValidationError("pricingVersion is invalid");
  }

  const baseAmountMinor = assertMinorAmount(
    input.baseAmountMinor,
    "baseAmountMinor"
  );
  const taxAmountMinor = assertMinorAmount(
    input.taxAmountMinor ?? 0,
    "taxAmountMinor"
  );
  const vatAmountMinor = assertMinorAmount(
    input.vatAmountMinor ?? 0,
    "vatAmountMinor"
  );
  const supplementsAmountMinor = assertMinorAmount(
    input.supplementsAmountMinor ?? 0,
    "supplementsAmountMinor"
  );
  const discountsAmountMinor = assertMinorAmount(
    input.discountsAmountMinor ?? 0,
    "discountsAmountMinor"
  );
  const totalCustomerAmountMinor = assertMinorAmount(
    input.totalCustomerAmountMinor,
    "totalCustomerAmountMinor"
  );

  const expected =
    baseAmountMinor +
    taxAmountMinor +
    vatAmountMinor +
    supplementsAmountMinor -
    discountsAmountMinor;
  if (
    !Number.isSafeInteger(expected) ||
    expected < 0 ||
    totalCustomerAmountMinor !== expected
  ) {
    throw new DomainValidationError("totalCustomerAmountMinor is inconsistent");
  }

  return Object.freeze({
    currency,
    pricingVersion,
    baseAmountMinor,
    taxAmountMinor,
    vatAmountMinor,
    supplementsAmountMinor,
    discountsAmountMinor,
    totalCustomerAmountMinor,
  });
}

export function cloneQuotePriceProposal(
  proposal: QuotePriceProposal
): QuotePriceProposal {
  return createQuotePriceProposal({ ...proposal });
}

export function serializeQuotePriceProposal(
  proposal: QuotePriceProposal
): Readonly<Record<string, string | number>> {
  return Object.freeze({
    currency: proposal.currency,
    pricingVersion: proposal.pricingVersion,
    baseAmountMinor: proposal.baseAmountMinor,
    taxAmountMinor: proposal.taxAmountMinor,
    vatAmountMinor: proposal.vatAmountMinor,
    supplementsAmountMinor: proposal.supplementsAmountMinor,
    discountsAmountMinor: proposal.discountsAmountMinor,
    totalCustomerAmountMinor: proposal.totalCustomerAmountMinor,
  });
}
