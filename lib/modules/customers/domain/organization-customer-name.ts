import { DomainValidationError } from "./errors";

declare const organizationCustomerNameBrand: unique symbol;

/**
 * Minimal legal/display name for an ORGANIZATION Customer.
 * Commercial counterparty name — not platform Organization.
 */
export type OrganizationCustomerName = string & {
  readonly [organizationCustomerNameBrand]: "OrganizationCustomerName";
};

const MAX_LEN = 200;

export function asOrganizationCustomerName(
  value: string
): OrganizationCustomerName {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > MAX_LEN) {
    throw new DomainValidationError("organizationName is invalid");
  }
  return normalized as OrganizationCustomerName;
}

export function serializeOrganizationCustomerName(
  value: OrganizationCustomerName
): string {
  return value;
}
