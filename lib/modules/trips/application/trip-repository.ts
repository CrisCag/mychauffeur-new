import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { Trip } from "../domain/trip";
import type { TripId, TripServiceId } from "../domain/identifiers";

export interface TripRepository {
  save(trip: Trip, expectedVersion?: number): Promise<void>;

  findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    tripId: TripId
  ): Promise<Trip | null>;

  findCurrentByServiceId(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceId: TripServiceId
  ): Promise<Trip | null>;
}
