import { DomainValidationError } from "./errors";

declare const customerEmailAddressBrand: unique symbol;

/**
 * Optional contact email on Customer profile.
 * Not verified by Customer Domain. Never used for auth/auto-link/merge.
 */
export type CustomerEmailAddress = string & {
  readonly [customerEmailAddressBrand]: "CustomerEmailAddress";
};

const MAX_LEN = 254;

export function asCustomerEmailAddress(value: string): CustomerEmailAddress {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized.length > MAX_LEN) {
    throw new DomainValidationError("email is invalid");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new DomainValidationError("email is invalid");
  }
  return normalized as CustomerEmailAddress;
}

export function serializeCustomerEmailAddress(
  value: CustomerEmailAddress
): string {
  return value;
}
