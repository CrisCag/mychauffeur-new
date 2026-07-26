export type LifecycleStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export const LIFECYCLE_STATUSES: readonly LifecycleStatus[] = [
  "ACTIVE",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export function isLifecycleStatus(value: string): value is LifecycleStatus {
  return (LIFECYCLE_STATUSES as readonly string[]).includes(value);
}
