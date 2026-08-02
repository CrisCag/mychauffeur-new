import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { Quote, QuoteId } from "../domain/quote";
import type { QuoteNumber } from "../domain/quote-number";

/**
 * Persistence Port for Quote Aggregate (Step 7).
 * Every read/write is tenant-safe AND organization-scoped.
 * No findAll / global listing / cross-tenant or cross-organization queries.
 *
 * Optimistic concurrency:
 * - Insert: omit expectedVersion.
 * - Update: expectedVersion MUST equal persisted version; quote.version MUST be +1
 *   except Domain-level idempotent accept retry (same acceptanceCommandId) which
 *   does not call save with a bumped version — callers should skip save on no-op.
 * - Failed save must not mutate the persisted row.
 *
 * Append-only: repository MUST reject mutation/removal/reorder of issued history.
 */
export interface QuoteRepository {
  save(quote: Quote, expectedVersion?: number): Promise<void>;

  findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    quoteId: QuoteId
  ): Promise<Quote | null>;

  findByQuoteNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    quoteNumber: QuoteNumber
  ): Promise<Quote | null>;

  existsByQuoteNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    quoteNumber: QuoteNumber
  ): Promise<boolean>;
}
