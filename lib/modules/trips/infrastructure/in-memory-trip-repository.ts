import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { TripRepository } from "../application/trip-repository";
import { rehydrateTrip, type Trip } from "../domain/trip";
import {
  CurrentTripConflictError,
  TripDomainValidationError,
  TripVersionConflictError,
} from "../domain/errors";
import type { TripId, TripServiceId } from "../domain/identifiers";
import { isCurrentTripStatus } from "../domain/trip-status";

export class InMemoryTripRepository implements TripRepository {
  private readonly byId = new Map<string, Trip>();
  private readonly currentByService = new Map<string, string>();

  private idKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    tripId: TripId
  ): string {
    return `${tenantId}::${organizationId}::${tripId}`;
  }

  private serviceKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceId: TripServiceId
  ): string {
    return `${tenantId}::${organizationId}::${serviceId}`;
  }

  private clone(trip: Trip): Trip {
    return rehydrateTrip({
      ...trip,
      enRouteAt: trip.enRouteAt ? new Date(trip.enRouteAt.getTime()) : null,
      arrivedAt: trip.arrivedAt ? new Date(trip.arrivedAt.getTime()) : null,
      startedAt: trip.startedAt ? new Date(trip.startedAt.getTime()) : null,
      completedAt: trip.completedAt ? new Date(trip.completedAt.getTime()) : null,
      endedAt: trip.endedAt ? new Date(trip.endedAt.getTime()) : null,
      createdAt: new Date(trip.createdAt.getTime()),
      updatedAt: new Date(trip.updatedAt.getTime()),
    });
  }

  async save(trip: Trip, expectedVersion?: number): Promise<void> {
    const key = this.idKey(trip.tenantId, trip.organizationId, trip.id);
    const serviceKey = this.serviceKey(
      trip.tenantId,
      trip.organizationId,
      trip.serviceId
    );
    const existing = this.byId.get(key);

    if (!existing) {
      if (expectedVersion !== undefined) throw new TripVersionConflictError();
      this.assertNoCurrentConflict(trip, key, serviceKey);
      this.byId.set(key, this.clone(trip));
      if (isCurrentTripStatus(trip.status)) this.currentByService.set(serviceKey, key);
      return;
    }

    if (
      expectedVersion === undefined ||
      existing.version !== expectedVersion ||
      trip.version !== existing.version + 1
    ) {
      throw new TripVersionConflictError();
    }
    if (
      existing.id !== trip.id ||
      existing.tenantId !== trip.tenantId ||
      existing.organizationId !== trip.organizationId ||
      existing.serviceId !== trip.serviceId ||
      existing.assignmentId !== trip.assignmentId
    ) {
      throw new TripDomainValidationError("Trip identity is immutable");
    }

    this.assertNoCurrentConflict(trip, key, serviceKey);
    this.byId.set(key, this.clone(trip));
    if (isCurrentTripStatus(trip.status)) {
      this.currentByService.set(serviceKey, key);
    } else if (this.currentByService.get(serviceKey) === key) {
      this.currentByService.delete(serviceKey);
    }
  }

  private assertNoCurrentConflict(
    trip: Trip,
    tripKey: string,
    serviceKey: string
  ): void {
    if (!isCurrentTripStatus(trip.status)) return;
    const occupied = this.currentByService.get(serviceKey);
    if (occupied && occupied !== tripKey) throw new CurrentTripConflictError();
  }

  async findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    tripId: TripId
  ): Promise<Trip | null> {
    const found = this.byId.get(this.idKey(tenantId, organizationId, tripId));
    return found ? this.clone(found) : null;
  }

  async findCurrentByServiceId(
    tenantId: TenantId,
    organizationId: OrganizationId,
    serviceId: TripServiceId
  ): Promise<Trip | null> {
    const key = this.currentByService.get(
      this.serviceKey(tenantId, organizationId, serviceId)
    );
    if (!key) return null;
    const found = this.byId.get(key);
    return found ? this.clone(found) : null;
  }
}
