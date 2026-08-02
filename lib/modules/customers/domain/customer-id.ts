import { InvalidCustomerIdError } from "./errors";

declare const customerIdBrand: unique symbol;

export type CustomerId = string & { readonly [customerIdBrand]: "CustomerId" };

export function asCustomerId(value: string): CustomerId {
  const normalized = value.trim();
  if (!normalized || normalized.length > 64) {
    throw new InvalidCustomerIdError();
  }
  return normalized as CustomerId;
}
