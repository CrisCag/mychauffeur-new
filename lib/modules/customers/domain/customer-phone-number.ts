import { DomainValidationError } from "./errors";

declare const customerPhoneNumberBrand: unique symbol;

/**
 * Optional contact phone on Customer profile.
 * Not verified by Customer Domain. Never used for auth/auto-link/merge.
 */
export type CustomerPhoneNumber = string & {
  readonly [customerPhoneNumberBrand]: "CustomerPhoneNumber";
};

const MAX_LEN = 32;

export function asCustomerPhoneNumber(value: string): CustomerPhoneNumber {
  const collapsed = value.trim().replace(/\s+/g, " ");
  if (!collapsed || collapsed.length > MAX_LEN) {
    throw new DomainValidationError("phone is invalid");
  }
  if (!/^\+?[\d][\d\s().-]{4,30}$/.test(collapsed)) {
    throw new DomainValidationError("phone is invalid");
  }
  return collapsed as CustomerPhoneNumber;
}

export function serializeCustomerPhoneNumber(
  value: CustomerPhoneNumber
): string {
  return value;
}
