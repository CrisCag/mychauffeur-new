/**
 * Domain events for Customer Aggregate (Step 8).
 * Semantically named Customer.* — no broker/outbox in this step.
 * Payloads must not include PII (names, email, phone).
 */

export type CustomerDomainEventType =
  | "Customer.Created"
  | "Customer.ProfileUpdated"
  | "Customer.IdentityLinked"
  | "Customer.IdentityUnlinked"
  | "Customer.Deactivated"
  | "Customer.Reactivated"
  | "Customer.Anonymized";

export type CustomerDomainEvent = {
  readonly type: CustomerDomainEventType;
  readonly customerId: string;
  readonly tenantId: string;
  readonly organizationId: string;
  readonly customerType?: string;
  readonly status?: string;
  readonly occurredAt: Date;
};

export function createCustomerDomainEvent(
  input: Omit<CustomerDomainEvent, "occurredAt"> & { occurredAt: Date }
): CustomerDomainEvent {
  return Object.freeze({
    type: input.type,
    customerId: input.customerId,
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    ...(input.customerType !== undefined
      ? { customerType: input.customerType }
      : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    occurredAt: new Date(input.occurredAt.getTime()),
  });
}
