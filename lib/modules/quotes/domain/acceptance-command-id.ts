import { DomainValidationError } from "./errors";

declare const acceptanceCommandIdBrand: unique symbol;

/**
 * Opaque acceptance command identifier for idempotent accept.
 * No PII. Validated length/charset only.
 */
export type AcceptanceCommandId = string & {
  readonly [acceptanceCommandIdBrand]: "AcceptanceCommandId";
};

const ACCEPTANCE_COMMAND_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

export function asAcceptanceCommandId(value: string): AcceptanceCommandId {
  const normalized = value.trim();
  if (!ACCEPTANCE_COMMAND_ID_PATTERN.test(normalized)) {
    throw new DomainValidationError("acceptanceCommandId is invalid");
  }
  return normalized as AcceptanceCommandId;
}
