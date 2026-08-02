import { InvalidServiceIdError } from "./errors";

declare const serviceIdBrand: unique symbol;

export type ServiceId = string & { readonly [serviceIdBrand]: "ServiceId" };

export function asServiceId(value: string): ServiceId {
  const normalized = value.trim();
  if (!normalized || normalized.length > 64) {
    throw new InvalidServiceIdError();
  }
  return normalized as ServiceId;
}
