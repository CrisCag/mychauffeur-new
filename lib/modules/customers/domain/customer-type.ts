export const CUSTOMER_TYPES = ["INDIVIDUAL", "ORGANIZATION"] as const;

export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export function isCustomerType(value: string): value is CustomerType {
  return (CUSTOMER_TYPES as readonly string[]).includes(value);
}
