export type RoleStatus = "ACTIVE" | "DISABLED" | "ARCHIVED";

export const ROLE_STATUSES: readonly RoleStatus[] = [
  "ACTIVE",
  "DISABLED",
  "ARCHIVED",
] as const;

export function isRoleStatus(value: string): value is RoleStatus {
  return (ROLE_STATUSES as readonly string[]).includes(value);
}
