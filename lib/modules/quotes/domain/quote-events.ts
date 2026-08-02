/**
 * Domain events for Quote Aggregate (Step 7).
 * Semantically named Quote.* — no broker/outbox in this step.
 */

export type QuoteDomainEventType =
  | "Quote.DraftCreated"
  | "Quote.Issued"
  | "Quote.Accepted"
  | "Quote.Rejected"
  | "Quote.Withdrawn"
  | "Quote.Expired"
  | "Quote.VersionSuperseded"
  | "Quote.DraftVersionOpened";

export type QuoteDomainEvent = {
  readonly type: QuoteDomainEventType;
  readonly quoteId: string;
  readonly tenantId: string;
  readonly organizationId: string;
  readonly versionNumber?: number;
  readonly occurredAt: Date;
};

export function createQuoteDomainEvent(
  input: Omit<QuoteDomainEvent, "occurredAt"> & { occurredAt: Date }
): QuoteDomainEvent {
  return Object.freeze({
    type: input.type,
    quoteId: input.quoteId,
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    ...(input.versionNumber !== undefined
      ? { versionNumber: input.versionNumber }
      : {}),
    occurredAt: new Date(input.occurredAt.getTime()),
  });
}
