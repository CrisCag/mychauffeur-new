import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { QuoteRepository } from "../application/quote-repository";
import type { Quote, QuoteId } from "../domain/quote";
import { rehydrateQuote } from "../domain/quote";
import { assertAppendOnlyQuoteHistory } from "../domain/quote-history";
import type { QuoteNumber } from "../domain/quote-number";
import {
  DomainValidationError,
  DuplicateQuoteNumberError,
  QuoteVersionConflictError,
} from "../domain/errors";

/**
 * In-memory QuoteRepository for foundation tests.
 * NOT production-ready. No JSON file persistence.
 *
 * Append-only: assertAppendOnlyQuoteHistory compares persisted vs incoming
 * structurally (proposals, timestamps, acceptance metadata, allowed transitions).
 */
export class InMemoryQuoteRepository implements QuoteRepository {
  private readonly byId = new Map<string, Quote>();
  private readonly byNumber = new Map<string, string>();

  private idKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    quoteId: QuoteId
  ): string {
    return `${tenantId}::${organizationId}::${quoteId}`;
  }

  private numberKey(
    tenantId: TenantId,
    organizationId: OrganizationId,
    quoteNumber: QuoteNumber
  ): string {
    return `${tenantId}::${organizationId}::${quoteNumber}`;
  }

  private clone(quote: Quote): Quote {
    return rehydrateQuote({
      id: quote.id,
      tenantId: quote.tenantId,
      organizationId: quote.organizationId,
      quoteNumber: quote.quoteNumber,
      mode: quote.mode,
      createdByActorId: quote.createdByActorId,
      customerId: quote.customerId,
      guestCustomerSnapshot: quote.guestCustomerSnapshot
        ? { ...quote.guestCustomerSnapshot }
        : null,
      versions: quote.versions.map((v) => ({
        ...v,
        priceProposal: v.priceProposal ? { ...v.priceProposal } : null,
        policyProposal: v.policyProposal ? { ...v.policyProposal } : null,
        contactProposal: v.contactProposal ? { ...v.contactProposal } : null,
        billingProposal: v.billingProposal ? { ...v.billingProposal } : null,
        issuedAt: v.issuedAt ? new Date(v.issuedAt.getTime()) : null,
        expiresAt: v.expiresAt ? new Date(v.expiresAt.getTime()) : null,
        acceptedAt: v.acceptedAt ? new Date(v.acceptedAt.getTime()) : null,
        rejectedAt: v.rejectedAt ? new Date(v.rejectedAt.getTime()) : null,
        withdrawnAt: v.withdrawnAt ? new Date(v.withdrawnAt.getTime()) : null,
        expiredAt: v.expiredAt ? new Date(v.expiredAt.getTime()) : null,
        supersededAt: v.supersededAt
          ? new Date(v.supersededAt.getTime())
          : null,
      })),
      createdAt: new Date(quote.createdAt.getTime()),
      updatedAt: new Date(quote.updatedAt.getTime()),
      version: quote.version,
    });
  }

  async save(quote: Quote, expectedVersion?: number): Promise<void> {
    const key = this.idKey(quote.tenantId, quote.organizationId, quote.id);
    const existing = this.byId.get(key);

    if (!existing) {
      if (expectedVersion !== undefined) {
        throw new QuoteVersionConflictError();
      }
      const numberKey = this.numberKey(
        quote.tenantId,
        quote.organizationId,
        quote.quoteNumber
      );
      const occupied = this.byNumber.get(numberKey);
      if (occupied && occupied !== key) {
        throw new DuplicateQuoteNumberError();
      }
      this.byId.set(key, this.clone(quote));
      this.byNumber.set(numberKey, key);
      return;
    }

    if (expectedVersion === undefined) {
      throw new QuoteVersionConflictError();
    }
    if (existing.version !== expectedVersion) {
      throw new QuoteVersionConflictError();
    }
    if (quote.version !== existing.version + 1) {
      throw new QuoteVersionConflictError();
    }

    if (existing.quoteNumber !== quote.quoteNumber) {
      throw new DomainValidationError("QuoteNumber is immutable");
    }
    if (
      existing.id !== quote.id ||
      existing.tenantId !== quote.tenantId ||
      existing.organizationId !== quote.organizationId ||
      existing.mode !== quote.mode ||
      existing.createdByActorId !== quote.createdByActorId
    ) {
      throw new DomainValidationError("Quote identity scope is immutable");
    }

    assertAppendOnlyQuoteHistory(existing, quote);

    this.byId.set(key, this.clone(quote));
  }

  async findById(
    tenantId: TenantId,
    organizationId: OrganizationId,
    quoteId: QuoteId
  ): Promise<Quote | null> {
    const found = this.byId.get(this.idKey(tenantId, organizationId, quoteId));
    if (!found) {
      return null;
    }
    if (
      found.tenantId !== tenantId ||
      found.organizationId !== organizationId
    ) {
      return null;
    }
    return this.clone(found);
  }

  async findByQuoteNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    quoteNumber: QuoteNumber
  ): Promise<Quote | null> {
    const idKey = this.byNumber.get(
      this.numberKey(tenantId, organizationId, quoteNumber)
    );
    if (!idKey) {
      return null;
    }
    const found = this.byId.get(idKey);
    if (!found) {
      return null;
    }
    if (
      found.tenantId !== tenantId ||
      found.organizationId !== organizationId
    ) {
      return null;
    }
    return this.clone(found);
  }

  async existsByQuoteNumber(
    tenantId: TenantId,
    organizationId: OrganizationId,
    quoteNumber: QuoteNumber
  ): Promise<boolean> {
    const found = await this.findByQuoteNumber(
      tenantId,
      organizationId,
      quoteNumber
    );
    return found !== null;
  }

  clear(): void {
    this.byId.clear();
    this.byNumber.clear();
  }
}
