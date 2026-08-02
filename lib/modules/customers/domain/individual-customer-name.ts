import { DomainValidationError } from "./errors";

declare const individualCustomerNameBrand: unique symbol;

/**
 * Minimal display name for an INDIVIDUAL Customer.
 * No document IDs or unnecessary PII.
 */
export type IndividualCustomerName = string & {
  readonly [individualCustomerNameBrand]: "IndividualCustomerName";
};

const MAX_LEN = 200;

export function asIndividualCustomerName(value: string): IndividualCustomerName {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > MAX_LEN) {
    throw new DomainValidationError("individualName is invalid");
  }
  return normalized as IndividualCustomerName;
}

export function serializeIndividualCustomerName(
  value: IndividualCustomerName
): string {
  return value;
}
