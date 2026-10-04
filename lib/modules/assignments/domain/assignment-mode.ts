export const ASSIGNMENT_MODES = ["INTERNAL", "PARTNER"] as const;

export type AssignmentMode = (typeof ASSIGNMENT_MODES)[number];

export function isAssignmentMode(value: string): value is AssignmentMode {
  return (ASSIGNMENT_MODES as readonly string[]).includes(value);
}
