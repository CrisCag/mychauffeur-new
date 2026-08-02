export const CUSTOMER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "ANONYMIZED",
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export function isCustomerStatus(value: string): value is CustomerStatus {
  return (CUSTOMER_STATUSES as readonly string[]).includes(value);
}

export function isTerminalCustomerStatus(status: CustomerStatus): boolean {
  return status === "ANONYMIZED";
}
