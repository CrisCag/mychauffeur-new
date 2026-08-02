import { DomainValidationError } from "./errors";

/**
 * Customer-facing commercial price freeze (MC-OS-032 §53 / PRM).
 * Tip excluded. Partner margin / assignment budget / commission / payout excluded.
 * Amounts are safe integer minor units only. No floating-point money. No secrets.
 */
export type PriceSnapshot = {
  readonly currency: string;
  readonly pricingVersion: string;
  readonly baseAmountMinor: number;
  readonly taxAmountMinor: number;
  readonly vatAmountMinor: number;
  readonly supplementsAmountMinor: number;
  readonly discountsAmountMinor: number;
  readonly totalCustomerAmountMinor: number;
};

export type PriceSnapshotInput = {
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

/**
 * Non-negative safe integer minor units.
 * Rejects NaN, Infinity, floats, negatives, and unsafe integers.
 */
function assertMinorAmount(value: number, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new DomainValidationError(`${field} is invalid`);
  }
  return value;
}

export function createPriceSnapshot(input: PriceSnapshotInput): PriceSnapshot {
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

  // total = base + taxes + vat + supplements - discounts (all minor units >= 0)
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

export function clonePriceSnapshot(snapshot: PriceSnapshot): PriceSnapshot {
  return createPriceSnapshot({ ...snapshot });
}

/** Plain JSON-serializable copy for persistence (not a runtime SoT). */
export function serializePriceSnapshot(
  snapshot: PriceSnapshot
): Readonly<Record<string, string | number>> {
  return Object.freeze({
    currency: snapshot.currency,
    pricingVersion: snapshot.pricingVersion,
    baseAmountMinor: snapshot.baseAmountMinor,
    taxAmountMinor: snapshot.taxAmountMinor,
    vatAmountMinor: snapshot.vatAmountMinor,
    supplementsAmountMinor: snapshot.supplementsAmountMinor,
    discountsAmountMinor: snapshot.discountsAmountMinor,
    totalCustomerAmountMinor: snapshot.totalCustomerAmountMinor,
  });
}
