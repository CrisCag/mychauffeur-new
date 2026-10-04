export const ASSIGNMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "ACTIVE",
  "COMPLETED",
  "REJECTED",
  "REASSIGNED",
  "CANCELLED",
] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export function isAssignmentStatus(value: string): value is AssignmentStatus {
  return (ASSIGNMENT_STATUSES as readonly string[]).includes(value);
}

export function isCurrentAssignmentStatus(status: AssignmentStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED" || status === "ACTIVE";
}

export function isTerminalAssignmentStatus(status: AssignmentStatus): boolean {
  return (
    status === "COMPLETED" ||
    status === "REJECTED" ||
    status === "REASSIGNED" ||
    status === "CANCELLED"
  );
}
