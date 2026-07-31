export type MembershipStatus = "ACTIVE" | "SUSPENDED" | "REVOKED";

export const MEMBERSHIP_STATUSES: readonly MembershipStatus[] = [
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
] as const;

export function isMembershipStatus(value: string): value is MembershipStatus {
  return (MEMBERSHIP_STATUSES as readonly string[]).includes(value);
}
