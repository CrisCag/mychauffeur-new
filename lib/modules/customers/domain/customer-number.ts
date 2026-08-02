import { InvalidCustomerNumberError } from "./errors";

declare const customerNumberBrand: unique symbol;

/**
 * Public customer reference — distinct from CustomerId.
 * Not a sequential integer. Contains no PII.
 * Format: CU- + 8..32 uppercase alphanumeric characters.
 */
export type CustomerNumber = string & {
  readonly [customerNumberBrand]: "CustomerNumber";
};

const CUSTOMER_NUMBER_PATTERN = /^CU-[A-Z0-9]{8,32}$/;

export function normalizeCustomerNumber(value: string): string {
  return value.trim().toUpperCase();
}

export function asCustomerNumber(value: string): CustomerNumber {
  const normalized = normalizeCustomerNumber(value);
  if (!CUSTOMER_NUMBER_PATTERN.test(normalized)) {
    throw new InvalidCustomerNumberError();
  }
  return normalized as CustomerNumber;
}

export function createCustomerNumberFromToken(token: string): CustomerNumber {
  const compact = token.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (compact.length < 8) {
    throw new InvalidCustomerNumberError();
  }
  return asCustomerNumber(`CU-${compact.slice(0, 16)}`);
}
