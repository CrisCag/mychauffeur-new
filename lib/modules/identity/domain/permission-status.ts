export type PermissionStatus = "ACTIVE" | "DISABLED" | "ARCHIVED";

export const PERMISSION_STATUSES: readonly PermissionStatus[] = [
  "ACTIVE",
  "DISABLED",
  "ARCHIVED",
] as const;

export function isPermissionStatus(
  value: string
): value is PermissionStatus {
  return (PERMISSION_STATUSES as readonly string[]).includes(value);
}
