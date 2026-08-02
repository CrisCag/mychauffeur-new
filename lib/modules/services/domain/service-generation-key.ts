import { DomainValidationError } from "./errors";

declare const serviceGenerationKeyBrand: unique symbol;

/**
 * Opaque idempotency key for Service generation within tenant+organization.
 * No PII. Not derived from email/phone/address.
 */
export type ServiceGenerationKey = string & {
  readonly [serviceGenerationKeyBrand]: "ServiceGenerationKey";
};

const PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

export function asServiceGenerationKey(value: string): ServiceGenerationKey {
  const normalized = value.trim();
  if (!PATTERN.test(normalized)) {
    throw new DomainValidationError("generationKey is invalid");
  }
  return normalized as ServiceGenerationKey;
}
