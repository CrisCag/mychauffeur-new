import { AssignmentDomainValidationError } from "./errors";

type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type AssignmentId = Brand<string, "AssignmentId">;
export type AssignmentServiceId = Brand<string, "AssignmentServiceId">;
export type AssignmentDriverId = Brand<string, "AssignmentDriverId">;
export type AssignmentVehicleId = Brand<string, "AssignmentVehicleId">;
export type PartnerOrganizationId = Brand<string, "PartnerOrganizationId">;

function asIdentifier<T>(value: string, field: string): T {
  const normalized = value.trim();
  if (!normalized) {
    throw new AssignmentDomainValidationError(`${field} is required`);
  }
  if (normalized.length > 128) {
    throw new AssignmentDomainValidationError(`${field} is invalid`);
  }
  return normalized as T;
}

export const asAssignmentId = (value: string): AssignmentId =>
  asIdentifier<AssignmentId>(value, "assignmentId");
export const asAssignmentServiceId = (value: string): AssignmentServiceId =>
  asIdentifier<AssignmentServiceId>(value, "serviceId");
export const asAssignmentDriverId = (value: string): AssignmentDriverId =>
  asIdentifier<AssignmentDriverId>(value, "driverId");
export const asAssignmentVehicleId = (value: string): AssignmentVehicleId =>
  asIdentifier<AssignmentVehicleId>(value, "vehicleId");
export const asPartnerOrganizationId = (
  value: string
): PartnerOrganizationId =>
  asIdentifier<PartnerOrganizationId>(value, "partnerOrganizationId");
