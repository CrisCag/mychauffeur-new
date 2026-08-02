import { DomainValidationError } from "./errors";

declare const identitySubjectIdBrand: unique symbol;

/**
 * Opaque local reference to an Identity subject (e.g. UserId).
 * Customer Domain does not import Identity Infrastructure.
 */
export type IdentitySubjectId = string & {
  readonly [identitySubjectIdBrand]: "IdentitySubjectId";
};

const PATTERN = /^[A-Za-z0-9._:-]{8,64}$/;

export function asIdentitySubjectId(value: string): IdentitySubjectId {
  const normalized = value.trim();
  if (!PATTERN.test(normalized)) {
    throw new DomainValidationError("identitySubjectId is invalid");
  }
  return normalized as IdentitySubjectId;
}
