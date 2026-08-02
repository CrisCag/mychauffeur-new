export const SERVICE_TYPES = ["TRANSFER", "HOURLY"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export function isServiceType(value: string): value is ServiceType {
  return (SERVICE_TYPES as readonly string[]).includes(value);
}
