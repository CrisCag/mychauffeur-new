import { DomainValidationError } from "./errors";

/**
 * Billing party freeze at confirmation (MC-OS-032 §56 / SFOF readiness).
 * FINANCIAL_OWN fields only — no card primary account numbers, tokens, IBAN secrets, or PSP secrets.
 */
export type BillingPartyType =
  | "INDIVIDUAL"
  | "COMPANY"
  | "AGENCY"
  | "CORPORATE";

export type BillingSnapshot = {
  readonly billingPartyType: BillingPartyType;
  readonly billingPartyName: string;
  readonly billingCountryCode: string;
  readonly taxId?: string;
  readonly billingCity?: string;
  readonly billingPostalCode?: string;
};

export type BillingSnapshotInput = {
  billingPartyType: BillingPartyType | string;
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

export function createBillingSnapshot(
  input: BillingSnapshotInput
): BillingSnapshot {
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

  const billingCity = normalizeOptionalText(input.billingCity, "billingCity", 100);
  const billingPostalCode = normalizeOptionalText(
    input.billingPostalCode,
    "billingPostalCode",
    32
  );

  return Object.freeze({
    billingPartyType: billingPartyType as BillingPartyType,
    billingPartyName,
    billingCountryCode,
    ...(taxId !== undefined ? { taxId: taxId.toUpperCase() } : {}),
    ...(billingCity !== undefined ? { billingCity } : {}),
    ...(billingPostalCode !== undefined
      ? { billingPostalCode: billingPostalCode.toUpperCase() }
      : {}),
  });
}

export function cloneBillingSnapshot(
  snapshot: BillingSnapshot
): BillingSnapshot {
  return createBillingSnapshot({ ...snapshot });
}

export function serializeBillingSnapshot(
  snapshot: BillingSnapshot
): Readonly<Record<string, string>> {
  const out: Record<string, string> = {
    billingPartyType: snapshot.billingPartyType,
    billingPartyName: snapshot.billingPartyName,
    billingCountryCode: snapshot.billingCountryCode,
  };
  if (snapshot.taxId !== undefined) {
    out.taxId = snapshot.taxId;
  }
  if (snapshot.billingCity !== undefined) {
    out.billingCity = snapshot.billingCity;
  }
  if (snapshot.billingPostalCode !== undefined) {
    out.billingPostalCode = snapshot.billingPostalCode;
  }
  return Object.freeze(out);
}
