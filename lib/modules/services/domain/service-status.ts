export const SERVICE_STATUSES = [
  "PLANNED",
  "READY_FOR_ASSIGNMENT",
  "CANCELLED",
] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export function isServiceStatus(value: string): value is ServiceStatus {
  return (SERVICE_STATUSES as readonly string[]).includes(value);
}

export function isTerminalServiceStatus(status: ServiceStatus): boolean {
  return status === "CANCELLED";
}
