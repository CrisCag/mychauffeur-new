export const SERVICE_CANCELLATION_REASONS = [
  "CUSTOMER_REQUEST",
  "BOOKING_CANCELLED",
  "OPERATIONAL",
  "DUPLICATE",
  "OTHER",
] as const;

export type ServiceCancellationReason =
  (typeof SERVICE_CANCELLATION_REASONS)[number];

export function isServiceCancellationReason(
  value: string
): value is ServiceCancellationReason {
  return (SERVICE_CANCELLATION_REASONS as readonly string[]).includes(value);
}
