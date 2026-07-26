export type UserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED";

export const USER_STATUSES: readonly UserStatus[] = [
  "ACTIVE",
  "SUSPENDED",
  "DISABLED",
] as const;

export function isUserStatus(value: string): value is UserStatus {
  return (USER_STATUSES as readonly string[]).includes(value);
}
