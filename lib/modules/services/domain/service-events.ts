/**
 * Domain events for Service Aggregate (Step 9).
 * Namespace Service.* — no broker/outbox. No PII in payloads.
 */

export type ServiceDomainEventType =
  | "Service.Created"
  | "Service.ReadyForAssignment"
  | "Service.ScheduleAdjusted"
  | "Service.RequirementsAdjusted"
  | "Service.Cancelled";

export type ServiceDomainEvent = {
  readonly type: ServiceDomainEventType;
  readonly serviceId: string;
  readonly tenantId: string;
  readonly organizationId: string;
  readonly bookingId: string;
  readonly serviceSequence: number;
  readonly status?: string;
  readonly cancelReasonCode?: string;
  readonly occurredAt: Date;
};

export function createServiceDomainEvent(
  input: Omit<ServiceDomainEvent, "occurredAt"> & { occurredAt: Date }
): ServiceDomainEvent {
  return Object.freeze({
    type: input.type,
    serviceId: input.serviceId,
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    bookingId: input.bookingId,
    serviceSequence: input.serviceSequence,
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.cancelReasonCode !== undefined
      ? { cancelReasonCode: input.cancelReasonCode }
      : {}),
    occurredAt: new Date(input.occurredAt.getTime()),
  });
}
