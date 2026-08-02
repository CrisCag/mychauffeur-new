import { DomainValidationError } from "./errors";

declare const serviceSequenceBrand: unique symbol;

export type ServiceSequence = number & {
  readonly [serviceSequenceBrand]: "ServiceSequence";
};

export function asServiceSequence(value: number): ServiceSequence {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new DomainValidationError("serviceSequence is invalid");
  }
  return value as ServiceSequence;
}
