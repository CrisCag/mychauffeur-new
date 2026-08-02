import type { AcceptanceCommandId } from "./acceptance-command-id";
import type { QuoteBillingProposal } from "./quote-billing-proposal";
import {
  cloneQuoteBillingProposal,
  createQuoteBillingProposal,
  type QuoteBillingProposalInput,
} from "./quote-billing-proposal";
import type { QuoteContactProposal } from "./quote-contact-proposal";
import {
  cloneQuoteContactProposal,
  createQuoteContactProposal,
  type QuoteContactProposalInput,
} from "./quote-contact-proposal";
import type { QuotePolicyProposal } from "./quote-policy-proposal";
import {
  cloneQuotePolicyProposal,
  createQuotePolicyProposal,
  type QuotePolicyProposalInput,
} from "./quote-policy-proposal";
import type { QuotePriceProposal } from "./quote-price-proposal";
import {
  cloneQuotePriceProposal,
  createQuotePriceProposal,
  type QuotePriceProposalInput,
} from "./quote-price-proposal";
import type { QuoteVersionStatus } from "./quote-version-status";
import {
  isIssuedOrLaterStatus,
  isQuoteVersionStatus,
} from "./quote-version-status";
import { DomainValidationError } from "./errors";

export type QuoteVersionNumber = number;

export type QuoteVersion = {
  readonly versionNumber: QuoteVersionNumber;
  readonly status: QuoteVersionStatus;
  readonly priceProposal: QuotePriceProposal | null;
  readonly policyProposal: QuotePolicyProposal | null;
  readonly contactProposal: QuoteContactProposal | null;
  readonly billingProposal: QuoteBillingProposal | null;
  readonly issuedAt: Date | null;
  readonly expiresAt: Date | null;
  readonly acceptedAt: Date | null;
  readonly acceptanceCommandId: AcceptanceCommandId | null;
  readonly rejectedAt: Date | null;
  readonly withdrawnAt: Date | null;
  readonly expiredAt: Date | null;
  readonly supersededAt: Date | null;
};

export type QuoteCommercialProposalsInput = {
  priceProposal: QuotePriceProposal | QuotePriceProposalInput;
  policyProposal: QuotePolicyProposal | QuotePolicyProposalInput;
  contactProposal: QuoteContactProposal | QuoteContactProposalInput;
  billingProposal: QuoteBillingProposal | QuoteBillingProposalInput;
};

function copyDate(value: Date | null): Date | null {
  return value ? new Date(value.getTime()) : null;
}

function countProposals(version: QuoteVersion): number {
  return [
    version.priceProposal,
    version.policyProposal,
    version.contactProposal,
    version.billingProposal,
  ].filter((value) => value !== null && value !== undefined).length;
}

export function assertQuoteVersionInvariants(version: QuoteVersion): void {
  if (!Number.isInteger(version.versionNumber) || version.versionNumber < 1) {
    throw new DomainValidationError("versionNumber is invalid");
  }
  if (!isQuoteVersionStatus(version.status)) {
    throw new DomainValidationError("Invalid QuoteVersionStatus");
  }

  const present = countProposals(version);
  if (present !== 0 && present !== 4) {
    throw new DomainValidationError("Quote proposals must be all-or-none");
  }

  if (version.status === "DRAFT") {
    if (present !== 0) {
      throw new DomainValidationError("DRAFT QuoteVersion cannot carry proposals");
    }
    if (
      version.issuedAt ||
      version.expiresAt ||
      version.acceptedAt ||
      version.acceptanceCommandId ||
      version.rejectedAt ||
      version.withdrawnAt ||
      version.expiredAt ||
      version.supersededAt
    ) {
      throw new DomainValidationError("DRAFT QuoteVersion timestamps are invalid");
    }
    return;
  }

  // Issued or later: proposals required
  if (present !== 4) {
    throw new DomainValidationError("Issued QuoteVersion requires proposals");
  }
  if (!version.issuedAt || !version.expiresAt) {
    throw new DomainValidationError("issuedAt and expiresAt are required");
  }
  if (version.issuedAt.getTime() >= version.expiresAt.getTime()) {
    throw new DomainValidationError("expiresAt must be after issuedAt");
  }

  if (version.status === "ACCEPTED") {
    if (!version.acceptedAt || !version.acceptanceCommandId) {
      throw new DomainValidationError("ACCEPTED requires acceptance fields");
    }
  } else if (version.acceptedAt || version.acceptanceCommandId) {
    throw new DomainValidationError(
      "acceptance fields are only allowed when ACCEPTED"
    );
  }

  if (version.status === "REJECTED") {
    if (!version.rejectedAt) {
      throw new DomainValidationError("rejectedAt is required when REJECTED");
    }
  } else if (version.rejectedAt) {
    throw new DomainValidationError("rejectedAt is only allowed when REJECTED");
  }

  if (version.status === "WITHDRAWN") {
    if (!version.withdrawnAt) {
      throw new DomainValidationError("withdrawnAt is required when WITHDRAWN");
    }
  } else if (version.withdrawnAt) {
    throw new DomainValidationError("withdrawnAt is only allowed when WITHDRAWN");
  }

  if (version.status === "EXPIRED") {
    if (!version.expiredAt) {
      throw new DomainValidationError("expiredAt is required when EXPIRED");
    }
  } else if (version.expiredAt) {
    throw new DomainValidationError("expiredAt is only allowed when EXPIRED");
  }

  if (version.status === "SUPERSEDED") {
    if (!version.supersededAt) {
      throw new DomainValidationError("supersededAt is required when SUPERSEDED");
    }
  } else if (version.supersededAt) {
    throw new DomainValidationError(
      "supersededAt is only allowed when SUPERSEDED"
    );
  }
}

export function freezeQuoteVersion(version: QuoteVersion): QuoteVersion {
  assertQuoteVersionInvariants(version);
  return Object.freeze({
    versionNumber: version.versionNumber,
    status: version.status,
    priceProposal: version.priceProposal
      ? cloneQuotePriceProposal(version.priceProposal)
      : null,
    policyProposal: version.policyProposal
      ? cloneQuotePolicyProposal(version.policyProposal)
      : null,
    contactProposal: version.contactProposal
      ? cloneQuoteContactProposal(version.contactProposal)
      : null,
    billingProposal: version.billingProposal
      ? cloneQuoteBillingProposal(version.billingProposal)
      : null,
    issuedAt: copyDate(version.issuedAt),
    expiresAt: copyDate(version.expiresAt),
    acceptedAt: copyDate(version.acceptedAt),
    acceptanceCommandId: version.acceptanceCommandId,
    rejectedAt: copyDate(version.rejectedAt),
    withdrawnAt: copyDate(version.withdrawnAt),
    expiredAt: copyDate(version.expiredAt),
    supersededAt: copyDate(version.supersededAt),
  });
}

export function createDraftQuoteVersion(
  versionNumber: QuoteVersionNumber
): QuoteVersion {
  return freezeQuoteVersion({
    versionNumber,
    status: "DRAFT",
    priceProposal: null,
    policyProposal: null,
    contactProposal: null,
    billingProposal: null,
    issuedAt: null,
    expiresAt: null,
    acceptedAt: null,
    acceptanceCommandId: null,
    rejectedAt: null,
    withdrawnAt: null,
    expiredAt: null,
    supersededAt: null,
  });
}

export function createCommercialProposals(
  input: QuoteCommercialProposalsInput
): {
  priceProposal: QuotePriceProposal;
  policyProposal: QuotePolicyProposal;
  contactProposal: QuoteContactProposal;
  billingProposal: QuoteBillingProposal;
} {
  return {
    priceProposal: createQuotePriceProposal(input.priceProposal),
    policyProposal: createQuotePolicyProposal(input.policyProposal),
    contactProposal: createQuoteContactProposal(input.contactProposal),
    billingProposal: createQuoteBillingProposal(input.billingProposal),
  };
}

/**
 * Structural equality for append-only history checks (proposals + identity fields).
 * Status transitions on an issued row are allowed; proposal rewrite is not.
 */
export function quoteVersionProposalsEqual(
  a: QuoteVersion,
  b: QuoteVersion
): boolean {
  if (a.versionNumber !== b.versionNumber) {
    return false;
  }
  if (isIssuedOrLaterStatus(a.status) || isIssuedOrLaterStatus(b.status)) {
    // Once either side left DRAFT, proposals must match exactly when both have them.
    const aJson = JSON.stringify({
      p: a.priceProposal,
      o: a.policyProposal,
      c: a.contactProposal,
      b: a.billingProposal,
      issuedAt: a.issuedAt?.toISOString() ?? null,
      expiresAt: a.expiresAt?.toISOString() ?? null,
    });
    const bJson = JSON.stringify({
      p: b.priceProposal,
      o: b.policyProposal,
      c: b.contactProposal,
      b: b.billingProposal,
      issuedAt: b.issuedAt?.toISOString() ?? null,
      expiresAt: b.expiresAt?.toISOString() ?? null,
    });
    if (aJson !== bJson) {
      return false;
    }
  }
  return true;
}
