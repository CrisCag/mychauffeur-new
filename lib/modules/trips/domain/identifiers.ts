import { TripDomainValidationError } from "./errors";

type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type TripId = Brand<string, "TripId">;
export type TripServiceId = Brand<string, "TripServiceId">;
export type TripAssignmentId = Brand<string, "TripAssignmentId">;

function asIdentifier<T>(value: string, field: string): T {
  const normalized = value.trim();
  if (!normalized || normalized.length > 128) {
    throw new TripDomainValidationError(`${field} is invalid`);
  }
  return normalized as T;
}

export const asTripId = (value: string): TripId =>
  asIdentifier<TripId>(value, "tripId");
export const asTripServiceId = (value: string): TripServiceId =>
  asIdentifier<TripServiceId>(value, "serviceId");
export const asTripAssignmentId = (value: string): TripAssignmentId =>
  asIdentifier<TripAssignmentId>(value, "assignmentId");
