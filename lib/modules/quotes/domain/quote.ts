import type {
  ActorId,
  OrganizationId,
  TenantId,
} from "@/lib/modules/identity";
import {
  asAcceptanceCommandId,
} from "./acceptance-command-id";
import {
  createQuoteDomainEvent,
  type QuoteDomainEvent,
} from "./quote-events";
import type { QuoteGuestCustomerSnapshot } from "./quote-guest-customer-snapshot";
import { createQuoteGuestCustomerSnapshot } from "./quote-guest-customer-snapshot";
import type { QuoteMode } from "./quote-mode";
import { isQuoteMode } from "./quote-mode";
import type { QuoteNumber } from "./quote-number";
import { asQuoteNumber } from "./quote-number";
import {
  createCommercialProposals,
  createDraftQuoteVersion,
  freezeQuoteVersion,
  type QuoteCommercialProposalsInput,
  type QuoteVersion,
} from "./quote-version";
import {
  isTerminalQuoteVersionStatus,
  type QuoteVersionStatus,
} from "./quote-version-status";
import {
  DomainValidationError,
  InvalidQuoteIdError,
  InvalidQuoteStateTransitionError,
  MissingQuoteCustomerError,
  MissingQuoteProposalError,
  QuoteAcceptanceConflictError,
  QuoteExpiredError,
} from "./errors";

declare const quoteIdBrand: unique symbol;

export type QuoteId = string & { readonly [quoteIdBrand]: "QuoteId" };

export type QuoteCustomerId = string & { readonly __brand?: "QuoteCustomerId" };

export function asQuoteId(value: string): QuoteId {
  const normalized = value.trim();
  if (!normalized || normalized.length > 64) {
    throw new InvalidQuoteIdError();
  }
  return normalized as QuoteId;
}

export function asQuoteCustomerId(value: string): QuoteCustomerId {
  const normalized = value.trim();
  if (!normalized || normalized.length > 64) {
    throw new DomainValidationError("customerId is invalid");
  }
  return normalized as QuoteCustomerId;
}

/**
 * Quote Aggregate Root — commercial pre-Booking foundation (Step 7 / MC-OS-032).
 * Not a Pricing Engine. Does not create or mutate Booking.
 * Domain events are Quote.* values only — no broker/outbox.
 */
export type Quote = {
  readonly id: QuoteId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly quoteNumber: QuoteNumber;
  readonly mode: QuoteMode;
  readonly createdByActorId: ActorId;
  readonly customerId: QuoteCustomerId | null;
  readonly guestCustomerSnapshot: QuoteGuestCustomerSnapshot | null;
  readonly versions: readonly QuoteVersion[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type QuoteOperationResult = {
  readonly quote: Quote;
  readonly events: readonly QuoteDomainEvent[];
};

export type CreateQuoteInput = {
  id: QuoteId;
  tenantId: TenantId;
  organizationId: OrganizationId;
  quoteNumber: QuoteNumber | string;
  mode: QuoteMode;
  createdByActorId: ActorId;
  customerId?: QuoteCustomerId | string | null;
  guestCustomerSnapshot?: {
    displayName?: string;
    email?: string;
    phone?: string;
  } | null;
  /** Explicit clock — required (no hidden Date.now in Domain). */
  createdAt: Date;
  updatedAt?: Date;
};

function assertNonEmptyId(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new DomainValidationError(`${field} is required`);
  }
  return normalized;
}

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 0) {
    throw new DomainValidationError(
      "Quote version must be a non-negative integer"
    );
  }
  return version;
}

function copyDate(value: Date): Date {
  return new Date(value.getTime());
}

function assertCustomerPresence(
  customerId: QuoteCustomerId | null,
  guest: QuoteGuestCustomerSnapshot | null
): void {
  if (!customerId && !guest) {
    throw new MissingQuoteCustomerError();
  }
}

function assertVersionHistory(versions: readonly QuoteVersion[]): void {
  if (versions.length < 1) {
    throw new DomainValidationError("Quote requires at least one version");
  }
  let issuedCount = 0;
  let acceptedCount = 0;
  let draftCount = 0;
  for (let i = 0; i < versions.length; i += 1) {
    const current = versions[i];
    if (current.versionNumber !== i + 1) {
      throw new DomainValidationError("QuoteVersion numbers must be contiguous");
    }
    if (current.status === "ISSUED") {
      issuedCount += 1;
    }
    if (current.status === "ACCEPTED") {
      acceptedCount += 1;
    }
    if (current.status === "DRAFT") {
      draftCount += 1;
    }
  }
  if (issuedCount > 1) {
    throw new DomainValidationError("At most one QuoteVersion may be ISSUED");
  }
  if (acceptedCount > 1) {
    throw new DomainValidationError("At most one QuoteVersion may be ACCEPTED");
  }
  if (draftCount > 1) {
    throw new DomainValidationError("At most one QuoteVersion may be DRAFT");
  }
  if (draftCount === 1 && versions[versions.length - 1].status !== "DRAFT") {
    throw new DomainValidationError("DRAFT QuoteVersion must be the latest");
  }
}

function freezeQuote(quote: Quote): Quote {
  assertVersionHistory(quote.versions);
  return Object.freeze({
    ...quote,
    createdAt: copyDate(quote.createdAt),
    updatedAt: copyDate(quote.updatedAt),
    guestCustomerSnapshot: quote.guestCustomerSnapshot
      ? Object.freeze({ ...quote.guestCustomerSnapshot })
      : null,
    versions: Object.freeze(quote.versions.map((v) => freezeQuoteVersion(v))),
  });
}

function operationResult(
  quote: Quote,
  events: readonly QuoteDomainEvent[]
): QuoteOperationResult {
  return {
    quote,
    events: Object.freeze([...events]),
  };
}

function bump(
  quote: Quote,
  versions: readonly QuoteVersion[],
  updatedAt: Date
): Quote {
  if (quote.createdAt.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }
  return freezeQuote({
    ...quote,
    versions,
    updatedAt,
    version: assertVersion(quote.version + 1),
  });
}

function findVersion(
  quote: Quote,
  versionNumber: number
): { index: number; version: QuoteVersion } {
  const index = quote.versions.findIndex(
    (v) => v.versionNumber === versionNumber
  );
  if (index < 0) {
    throw new DomainValidationError("QuoteVersion not found");
  }
  return { index, version: quote.versions[index] };
}

function replaceVersion(
  versions: readonly QuoteVersion[],
  index: number,
  next: QuoteVersion
): QuoteVersion[] {
  const copy = versions.map((v) => freezeQuoteVersion(v));
  copy[index] = freezeQuoteVersion(next);
  return copy;
}

export function createQuote(input: CreateQuoteInput): QuoteOperationResult {
  const id = asQuoteId(input.id);
  const tenantId = assertNonEmptyId(input.tenantId, "tenantId") as TenantId;
  const organizationId = assertNonEmptyId(
    input.organizationId,
    "organizationId"
  ) as OrganizationId;
  const createdByActorId = assertNonEmptyId(
    input.createdByActorId,
    "createdByActorId"
  ) as ActorId;
  const quoteNumber = asQuoteNumber(String(input.quoteNumber));

  if (!isQuoteMode(input.mode)) {
    throw new DomainValidationError("Invalid QuoteMode");
  }

  const customerId =
    input.customerId === undefined || input.customerId === null
      ? null
      : asQuoteCustomerId(String(input.customerId));
  const guestCustomerSnapshot =
    input.guestCustomerSnapshot === undefined ||
    input.guestCustomerSnapshot === null
      ? null
      : createQuoteGuestCustomerSnapshot(input.guestCustomerSnapshot);
  assertCustomerPresence(customerId, guestCustomerSnapshot);

  const now = input.createdAt;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new DomainValidationError("createdAt is invalid");
  }
  const updatedAt = input.updatedAt ?? now;
  if (!(updatedAt instanceof Date) || Number.isNaN(updatedAt.getTime())) {
    throw new DomainValidationError("updatedAt is invalid");
  }
  if (now.getTime() > updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }

  const quote = freezeQuote({
    id,
    tenantId,
    organizationId,
    quoteNumber,
    mode: input.mode,
    createdByActorId,
    customerId,
    guestCustomerSnapshot,
    versions: [createDraftQuoteVersion(1)],
    createdAt: now,
    updatedAt,
    version: 0,
  });

  return operationResult(quote, [
    createQuoteDomainEvent({
      type: "Quote.DraftCreated",
      quoteId: quote.id,
      tenantId: quote.tenantId,
      organizationId: quote.organizationId,
      versionNumber: 1,
      occurredAt: now,
    }),
  ]);
}

export type RehydrateQuoteInput = {
  id: QuoteId | string;
  tenantId: TenantId;
  organizationId: OrganizationId;
  quoteNumber: QuoteNumber | string;
  mode: QuoteMode | string;
  createdByActorId: ActorId;
  customerId?: QuoteCustomerId | string | null;
  guestCustomerSnapshot?: QuoteGuestCustomerSnapshot | null;
  versions: readonly QuoteVersion[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export function rehydrateQuote(input: RehydrateQuoteInput): Quote {
  const id = asQuoteId(String(input.id));
  const tenantId = assertNonEmptyId(input.tenantId, "tenantId") as TenantId;
  const organizationId = assertNonEmptyId(
    input.organizationId,
    "organizationId"
  ) as OrganizationId;
  const createdByActorId = assertNonEmptyId(
    input.createdByActorId,
    "createdByActorId"
  ) as ActorId;
  const quoteNumber = asQuoteNumber(String(input.quoteNumber));
  if (!isQuoteMode(String(input.mode))) {
    throw new DomainValidationError("Invalid QuoteMode");
  }

  const customerId =
    input.customerId === undefined || input.customerId === null
      ? null
      : asQuoteCustomerId(String(input.customerId));
  const guestCustomerSnapshot =
    input.guestCustomerSnapshot === undefined ||
    input.guestCustomerSnapshot === null
      ? null
      : createQuoteGuestCustomerSnapshot(input.guestCustomerSnapshot);
  assertCustomerPresence(customerId, guestCustomerSnapshot);

  if (input.createdAt.getTime() > input.updatedAt.getTime()) {
    throw new DomainValidationError("createdAt must be <= updatedAt");
  }

  return freezeQuote({
    id,
    tenantId,
    organizationId,
    quoteNumber,
    mode: input.mode as QuoteMode,
    createdByActorId,
    customerId,
    guestCustomerSnapshot,
    versions: input.versions.map((v) => freezeQuoteVersion(v)),
    createdAt: copyDate(input.createdAt),
    updatedAt: copyDate(input.updatedAt),
    version: assertVersion(input.version),
  });
}

/**
 * Issue the current DRAFT tip with complete proposals.
 * Any currently ISSUED version becomes SUPERSEDED in the same transition.
 */
export function issueQuote(
  quote: Quote,
  commercial: QuoteCommercialProposalsInput,
  issuedAt: Date,
  expiresAt: Date
): QuoteOperationResult {
  if (quote.versions.some((v) => v.status === "ACCEPTED")) {
    throw new InvalidQuoteStateTransitionError();
  }
  const tip = quote.versions[quote.versions.length - 1];
  if (tip.status !== "DRAFT") {
    throw new InvalidQuoteStateTransitionError();
  }

  let proposals;
  try {
    proposals = createCommercialProposals(commercial);
  } catch (error) {
    if (error instanceof DomainValidationError) {
      throw error;
    }
    throw new MissingQuoteProposalError();
  }

  if (issuedAt.getTime() >= expiresAt.getTime()) {
    throw new DomainValidationError("expiresAt must be after issuedAt");
  }

  const events: QuoteDomainEvent[] = [];
  let versions = quote.versions.map((v) => freezeQuoteVersion(v));

  const issuedIndex = versions.findIndex((v) => v.status === "ISSUED");
  if (issuedIndex >= 0) {
    versions = replaceVersion(versions, issuedIndex, {
      ...versions[issuedIndex],
      status: "SUPERSEDED",
      supersededAt: issuedAt,
    });
    events.push(
      createQuoteDomainEvent({
        type: "Quote.VersionSuperseded",
        quoteId: quote.id,
        tenantId: quote.tenantId,
        organizationId: quote.organizationId,
        versionNumber: versions[issuedIndex].versionNumber,
        occurredAt: issuedAt,
      })
    );
  }

  const tipIndex = versions.length - 1;
  versions = replaceVersion(versions, tipIndex, {
    ...versions[tipIndex],
    status: "ISSUED",
    ...proposals,
    issuedAt,
    expiresAt,
    acceptedAt: null,
    acceptanceCommandId: null,
    rejectedAt: null,
    withdrawnAt: null,
    expiredAt: null,
    supersededAt: null,
  });

  events.push(
    createQuoteDomainEvent({
      type: "Quote.Issued",
      quoteId: quote.id,
      tenantId: quote.tenantId,
      organizationId: quote.organizationId,
      versionNumber: versions[tipIndex].versionNumber,
      occurredAt: issuedAt,
    })
  );

  return operationResult(bump(quote, versions, issuedAt), events);
}

/**
 * Append a new DRAFT version after the tip left DRAFT (typically after ISSUED).
 * Forbidden when an ACCEPTED version already exists.
 */
export function openDraftQuoteVersion(
  quote: Quote,
  at: Date
): QuoteOperationResult {
  if (quote.versions.some((v) => v.status === "ACCEPTED")) {
    throw new InvalidQuoteStateTransitionError();
  }
  if (quote.versions.some((v) => v.status === "DRAFT")) {
    throw new InvalidQuoteStateTransitionError();
  }

  const nextNumber = quote.versions.length + 1;
  const versions = [
    ...quote.versions.map((v) => freezeQuoteVersion(v)),
    createDraftQuoteVersion(nextNumber),
  ];

  return operationResult(bump(quote, versions, at), [
    createQuoteDomainEvent({
      type: "Quote.DraftVersionOpened",
      quoteId: quote.id,
      tenantId: quote.tenantId,
      organizationId: quote.organizationId,
      versionNumber: nextNumber,
      occurredAt: at,
    }),
  ]);
}

export function acceptQuote(
  quote: Quote,
  versionNumber: number,
  acceptanceCommandIdInput: string,
  at: Date
): QuoteOperationResult {
  const { index, version } = findVersion(quote, versionNumber);

  if (version.status === "ACCEPTED") {
    const acceptanceCommandId = asAcceptanceCommandId(acceptanceCommandIdInput);
    if (version.acceptanceCommandId === acceptanceCommandId) {
      return operationResult(quote, []);
    }
    throw new QuoteAcceptanceConflictError();
  }

  if (version.status !== "ISSUED") {
    throw new InvalidQuoteStateTransitionError();
  }

  const acceptanceCommandId = asAcceptanceCommandId(acceptanceCommandIdInput);

  // Exact expiresAt is not acceptable (at >= expiresAt → expired).
  if (!version.expiresAt || at.getTime() >= version.expiresAt.getTime()) {
    throw new QuoteExpiredError();
  }
  if (quote.versions.some((v) => v.status === "ACCEPTED")) {
    throw new InvalidQuoteStateTransitionError();
  }
  // Same command ID cannot accept a different version in this Aggregate.
  if (
    quote.versions.some(
      (v) =>
        v.acceptanceCommandId === acceptanceCommandId &&
        v.versionNumber !== versionNumber
    )
  ) {
    throw new QuoteAcceptanceConflictError();
  }

  const versions = replaceVersion(quote.versions, index, {
    ...version,
    status: "ACCEPTED",
    acceptedAt: at,
    acceptanceCommandId,
  });

  return operationResult(bump(quote, versions, at), [
    createQuoteDomainEvent({
      type: "Quote.Accepted",
      quoteId: quote.id,
      tenantId: quote.tenantId,
      organizationId: quote.organizationId,
      versionNumber,
      occurredAt: at,
    }),
  ]);
}

function transitionIssuedVersion(
  quote: Quote,
  versionNumber: number,
  to: Extract<
    QuoteVersionStatus,
    "REJECTED" | "WITHDRAWN" | "EXPIRED"
  >,
  at: Date,
  eventType: QuoteDomainEvent["type"]
): QuoteOperationResult {
  const { index, version } = findVersion(quote, versionNumber);
  if (version.status !== "ISSUED") {
    if (isTerminalQuoteVersionStatus(version.status)) {
      throw new InvalidQuoteStateTransitionError();
    }
    throw new InvalidQuoteStateTransitionError();
  }

  const next: QuoteVersion = {
    ...version,
    status: to,
    rejectedAt: to === "REJECTED" ? at : null,
    withdrawnAt: to === "WITHDRAWN" ? at : null,
    expiredAt: to === "EXPIRED" ? at : null,
  };

  const versions = replaceVersion(quote.versions, index, next);
  return operationResult(bump(quote, versions, at), [
    createQuoteDomainEvent({
      type: eventType,
      quoteId: quote.id,
      tenantId: quote.tenantId,
      organizationId: quote.organizationId,
      versionNumber,
      occurredAt: at,
    }),
  ]);
}

export function rejectQuote(
  quote: Quote,
  versionNumber: number,
  at: Date
): QuoteOperationResult {
  return transitionIssuedVersion(
    quote,
    versionNumber,
    "REJECTED",
    at,
    "Quote.Rejected"
  );
}

export function withdrawQuote(
  quote: Quote,
  versionNumber: number,
  at: Date
): QuoteOperationResult {
  return transitionIssuedVersion(
    quote,
    versionNumber,
    "WITHDRAWN",
    at,
    "Quote.Withdrawn"
  );
}

export function expireQuote(
  quote: Quote,
  versionNumber: number,
  at: Date
): QuoteOperationResult {
  const { version } = findVersion(quote, versionNumber);
  if (version.status === "ISSUED" && version.expiresAt) {
    if (at.getTime() < version.expiresAt.getTime()) {
      throw new DomainValidationError("Quote version has not expired yet");
    }
  }
  return transitionIssuedVersion(
    quote,
    versionNumber,
    "EXPIRED",
    at,
    "Quote.Expired"
  );
}
