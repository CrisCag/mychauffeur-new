import { InvalidServiceNumberError } from "./errors";

declare const serviceNumberBrand: unique symbol;

/**
 * Public service reference — distinct from ServiceId.
 * Not a sequential integer. Contains no PII.
 * Format: SV- + 8..32 uppercase alphanumeric characters.
 */
export type ServiceNumber = string & {
  readonly [serviceNumberBrand]: "ServiceNumber";
};

const SERVICE_NUMBER_PATTERN = /^SV-[A-Z0-9]{8,32}$/;

export function normalizeServiceNumber(value: string): string {
  return value.trim().toUpperCase();
}

export function asServiceNumber(value: string): ServiceNumber {
  const normalized = normalizeServiceNumber(value);
  if (!SERVICE_NUMBER_PATTERN.test(normalized)) {
    throw new InvalidServiceNumberError();
  }
  return normalized as ServiceNumber;
}

export function createServiceNumberFromToken(token: string): ServiceNumber {
  const compact = token.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (compact.length < 8) {
    throw new InvalidServiceNumberError();
  }
  return asServiceNumber(`SV-${compact.slice(0, 16)}`);
}
