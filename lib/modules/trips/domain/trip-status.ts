export const TRIP_STATUSES = [
  "SCHEDULED",
  "EN_ROUTE",
  "ARRIVED",
  "ONGOING",
  "COMPLETED",
  "NO_SHOW_CUSTOMER",
  "NO_SHOW_DRIVER",
  "CANCELLED",
  "DISRUPTED",
] as const;

export type TripStatus = (typeof TRIP_STATUSES)[number];

export function isTripStatus(value: string): value is TripStatus {
  return (TRIP_STATUSES as readonly string[]).includes(value);
}

export function isCurrentTripStatus(status: TripStatus): boolean {
  return (
    status === "SCHEDULED" ||
    status === "EN_ROUTE" ||
    status === "ARRIVED" ||
    status === "ONGOING"
  );
}

export function isTerminalTripStatus(status: TripStatus): boolean {
  return !isCurrentTripStatus(status);
}
