import type { Quote } from "./quote";
import type { QuoteVersion } from "./quote-version";
import type { QuoteVersionStatus } from "./quote-version-status";
import {
  isIssuedOrLaterStatus,
  isTerminalQuoteVersionStatus,
} from "./quote-version-status";
import { QuoteHistoryImmutableError } from "./errors";

function dateIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function proposalsEqual(
  a: QuoteVersion["priceProposal"],
  b: QuoteVersion["priceProposal"]
): boolean {
  if (a === null && b === null) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  return (
    a.currency === b.currency &&
    a.pricingVersion === b.pricingVersion &&
    a.baseAmountMinor === b.baseAmountMinor &&
    a.taxAmountMinor === b.taxAmountMinor &&
    a.vatAmountMinor === b.vatAmountMinor &&
    a.supplementsAmountMinor === b.supplementsAmountMinor &&
    a.discountsAmountMinor === b.discountsAmountMinor &&
    a.totalCustomerAmountMinor === b.totalCustomerAmountMinor
  );
}

function policyEqual(
  a: QuoteVersion["policyProposal"],
  b: QuoteVersion["policyProposal"]
): boolean {
  if (a === null && b === null) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  return (
    a.cancellationPolicyCode === b.cancellationPolicyCode &&
    a.waitingPolicyCode === b.waitingPolicyCode &&
    a.noShowPolicyCode === b.noShowPolicyCode &&
    a.modificationPolicyCode === b.modificationPolicyCode &&
    a.paymentTermsCode === b.paymentTermsCode &&
    a.refundReadiness === b.refundReadiness &&
    a.nightSupplementApplicable === b.nightSupplementApplicable &&
    a.holidaySupplementApplicable === b.holidaySupplementApplicable
  );
}

function contactEqual(
  a: QuoteVersion["contactProposal"],
  b: QuoteVersion["contactProposal"]
): boolean {
  if (a === null && b === null) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  return (
    a.bookerDisplayName === b.bookerDisplayName &&
    a.bookerEmail === b.bookerEmail &&
    a.bookerPhone === b.bookerPhone &&
    a.primaryPassengerDisplayName === b.primaryPassengerDisplayName
  );
}

function billingEqual(
  a: QuoteVersion["billingProposal"],
  b: QuoteVersion["billingProposal"]
): boolean {
  if (a === null && b === null) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  return (
    a.billingPartyType === b.billingPartyType &&
    a.billingPartyName === b.billingPartyName &&
    a.billingCountryCode === b.billingCountryCode &&
    a.taxId === b.taxId &&
    a.billingCity === b.billingCity &&
    a.billingPostalCode === b.billingPostalCode
  );
}

/** Allowed status transitions for an already-persisted version row. */
const ALLOWED_PERSISTED_TRANSITIONS: Readonly<
  Record<QuoteVersionStatus, readonly QuoteVersionStatus[]>
> = {
  DRAFT: ["ISSUED"],
  ISSUED: ["ACCEPTED", "EXPIRED", "WITHDRAWN", "REJECTED", "SUPERSEDED"],
  ACCEPTED: [],
  EXPIRED: [],
  WITHDRAWN: [],
  REJECTED: [],
  SUPERSEDED: [],
};

function assertCommercialPayloadFrozen(
  prev: QuoteVersion,
  next: QuoteVersion
): void {
  if (prev.versionNumber !== next.versionNumber) {
    throw new QuoteHistoryImmutableError();
  }
  if (!proposalsEqual(prev.priceProposal, next.priceProposal)) {
    throw new QuoteHistoryImmutableError();
  }
  if (!policyEqual(prev.policyProposal, next.policyProposal)) {
    throw new QuoteHistoryImmutableError();
  }
  if (!contactEqual(prev.contactProposal, next.contactProposal)) {
    throw new QuoteHistoryImmutableError();
  }
  if (!billingEqual(prev.billingProposal, next.billingProposal)) {
    throw new QuoteHistoryImmutableError();
  }
  if (dateIso(prev.issuedAt) !== dateIso(next.issuedAt)) {
    throw new QuoteHistoryImmutableError();
  }
  if (dateIso(prev.expiresAt) !== dateIso(next.expiresAt)) {
    throw new QuoteHistoryImmutableError();
  }
}

function assertTerminalMetadataFrozen(
  prev: QuoteVersion,
  next: QuoteVersion
): void {
  // Once set, acceptance/reject/withdraw/expiry/supersede metadata cannot change.
  if (prev.acceptanceCommandId !== null) {
    if (
      prev.acceptanceCommandId !== next.acceptanceCommandId ||
      dateIso(prev.acceptedAt) !== dateIso(next.acceptedAt)
    ) {
      throw new QuoteHistoryImmutableError();
    }
  }
  if (prev.rejectedAt !== null && dateIso(prev.rejectedAt) !== dateIso(next.rejectedAt)) {
    throw new QuoteHistoryImmutableError();
  }
  if (
    prev.withdrawnAt !== null &&
    dateIso(prev.withdrawnAt) !== dateIso(next.withdrawnAt)
  ) {
    throw new QuoteHistoryImmutableError();
  }
  if (prev.expiredAt !== null && dateIso(prev.expiredAt) !== dateIso(next.expiredAt)) {
    throw new QuoteHistoryImmutableError();
  }
  if (
    prev.supersededAt !== null &&
    dateIso(prev.supersededAt) !== dateIso(next.supersededAt)
  ) {
    throw new QuoteHistoryImmutableError();
  }
}

function assertAllowedStatusTransition(
  prev: QuoteVersion,
  next: QuoteVersion
): void {
  if (prev.status === next.status) {
    return;
  }
  if (isTerminalQuoteVersionStatus(prev.status)) {
    throw new QuoteHistoryImmutableError();
  }
  if (!ALLOWED_PERSISTED_TRANSITIONS[prev.status].includes(next.status)) {
    throw new QuoteHistoryImmutableError();
  }
}

/** Status-coupled terminal metadata — forbids forging acceptance on ISSUED etc. */
function assertStatusCoupledMetadata(version: QuoteVersion): void {
  if (version.status === "ACCEPTED") {
    if (!version.acceptedAt || !version.acceptanceCommandId) {
      throw new QuoteHistoryImmutableError();
    }
  } else if (version.acceptedAt || version.acceptanceCommandId) {
    throw new QuoteHistoryImmutableError();
  }

  if (version.status === "REJECTED") {
    if (!version.rejectedAt) {
      throw new QuoteHistoryImmutableError();
    }
  } else if (version.rejectedAt) {
    throw new QuoteHistoryImmutableError();
  }

  if (version.status === "WITHDRAWN") {
    if (!version.withdrawnAt) {
      throw new QuoteHistoryImmutableError();
    }
  } else if (version.withdrawnAt) {
    throw new QuoteHistoryImmutableError();
  }

  if (version.status === "EXPIRED") {
    if (!version.expiredAt) {
      throw new QuoteHistoryImmutableError();
    }
  } else if (version.expiredAt) {
    throw new QuoteHistoryImmutableError();
  }

  if (version.status === "SUPERSEDED") {
    if (!version.supersededAt) {
      throw new QuoteHistoryImmutableError();
    }
  } else if (version.supersededAt) {
    throw new QuoteHistoryImmutableError();
  }
}

/**
 * Enforce real append-only history for persisted QuoteVersions.
 * Structural comparison — not JSON key-order dependent.
 *
 * Allowed:
 * - append consecutive new versions
 * - Domain transitions on the active ISSUED/DRAFT tip
 * - ISSUED → SUPERSEDED when a later version is issued
 *
 * Forbidden: remove/reorder/replace, rewrite proposals/timestamps/acceptance,
 * status regression, illegal transitions.
 */
export function assertAppendOnlyQuoteHistory(
  existing: Quote,
  incoming: Quote
): void {
  if (incoming.versions.length < existing.versions.length) {
    throw new QuoteHistoryImmutableError();
  }

  for (let i = 0; i < existing.versions.length; i += 1) {
    const prev = existing.versions[i];
    const next = incoming.versions[i];
    if (!next) {
      throw new QuoteHistoryImmutableError();
    }

    if (prev.versionNumber !== next.versionNumber || next.versionNumber !== i + 1) {
      throw new QuoteHistoryImmutableError();
    }

    assertAllowedStatusTransition(prev, next);
    assertStatusCoupledMetadata(next);

    if (isIssuedOrLaterStatus(prev.status)) {
      assertCommercialPayloadFrozen(prev, next);
      assertTerminalMetadataFrozen(prev, next);
      if (next.status === "DRAFT") {
        throw new QuoteHistoryImmutableError();
      }
    } else if (prev.status === "DRAFT" && next.status === "DRAFT") {
      // DRAFT tip may stay DRAFT without payload; still freeze empty commercial fields.
      assertCommercialPayloadFrozen(prev, next);
    } else if (prev.status === "DRAFT" && next.status === "ISSUED") {
      // Issue fills proposals — only allowed from DRAFT; commercial freeze starts after.
      if (
        next.priceProposal === null ||
        next.policyProposal === null ||
        next.contactProposal === null ||
        next.billingProposal === null ||
        next.issuedAt === null ||
        next.expiresAt === null ||
        next.issuedAt.getTime() >= next.expiresAt.getTime()
      ) {
        throw new QuoteHistoryImmutableError();
      }
    }
  }

  for (let i = existing.versions.length; i < incoming.versions.length; i += 1) {
    if (incoming.versions[i].versionNumber !== i + 1) {
      throw new QuoteHistoryImmutableError();
    }
  }

  // At most one new version appended per save (foundation safety).
  if (incoming.versions.length > existing.versions.length + 1) {
    throw new QuoteHistoryImmutableError();
  }
}
