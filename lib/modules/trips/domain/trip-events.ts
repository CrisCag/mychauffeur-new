import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { TripAssignmentId, TripId, TripServiceId } from "./identifiers";
import type { TripStatus } from "./trip-status";

export type TripDomainEventType =
  | "Trip.Created"
  | "Trip.EnRoute"
  | "Trip.Arrived"
  | "Trip.Started"
  | "Trip.Completed"
  | "Trip.CustomerNoShow"
  | "Trip.DriverNoShow"
  | "Trip.Cancelled"
  | "Trip.Disrupted";

export type TripDomainEvent = {
  readonly type: TripDomainEventType;
  readonly tripId: TripId;
  readonly serviceId: TripServiceId;
  readonly assignmentId: TripAssignmentId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly status: TripStatus;
  readonly reasonCode?: string;
  readonly occurredAt: Date;
};

export function createTripDomainEvent(
  input: Omit<TripDomainEvent, "occurredAt"> & { occurredAt: Date }
): TripDomainEvent {
  return Object.freeze({
    ...input,
    occurredAt: new Date(input.occurredAt.getTime()),
  });
}
