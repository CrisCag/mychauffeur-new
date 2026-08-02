export type {
  Quote,
  QuoteId,
  QuoteCustomerId,
  QuoteOperationResult,
  CreateQuoteInput,
  RehydrateQuoteInput,
} from "./domain/quote";
export {
  asQuoteId,
  asQuoteCustomerId,
  createQuote,
  rehydrateQuote,
  issueQuote,
  openDraftQuoteVersion,
  acceptQuote,
  rejectQuote,
  withdrawQuote,
  expireQuote,
} from "./domain/quote";

export type { QuoteNumber } from "./domain/quote-number";
export {
  asQuoteNumber,
  normalizeQuoteNumber,
  createQuoteNumberFromToken,
} from "./domain/quote-number";

export type { QuoteMode } from "./domain/quote-mode";
export { QUOTE_MODES, isQuoteMode } from "./domain/quote-mode";

export type {
  QuoteVersionStatus,
  TerminalQuoteVersionStatus,
} from "./domain/quote-version-status";
export {
  QUOTE_VERSION_STATUSES,
  TERMINAL_QUOTE_VERSION_STATUSES,
  isQuoteVersionStatus,
  isTerminalQuoteVersionStatus,
  isIssuedOrLaterStatus,
} from "./domain/quote-version-status";

export type { AcceptanceCommandId } from "./domain/acceptance-command-id";
export { asAcceptanceCommandId } from "./domain/acceptance-command-id";

export type {
  QuotePriceProposal,
  QuotePriceProposalInput,
} from "./domain/quote-price-proposal";
export {
  createQuotePriceProposal,
  cloneQuotePriceProposal,
  serializeQuotePriceProposal,
} from "./domain/quote-price-proposal";

export type {
  QuotePolicyProposal,
  QuotePolicyProposalInput,
  QuoteRefundReadiness,
} from "./domain/quote-policy-proposal";
export {
  createQuotePolicyProposal,
  cloneQuotePolicyProposal,
  serializeQuotePolicyProposal,
} from "./domain/quote-policy-proposal";

export type {
  QuoteContactProposal,
  QuoteContactProposalInput,
} from "./domain/quote-contact-proposal";
export {
  createQuoteContactProposal,
  cloneQuoteContactProposal,
  serializeQuoteContactProposal,
} from "./domain/quote-contact-proposal";

export type {
  QuoteBillingProposal,
  QuoteBillingProposalInput,
  QuoteBillingPartyType,
} from "./domain/quote-billing-proposal";
export {
  createQuoteBillingProposal,
  cloneQuoteBillingProposal,
  serializeQuoteBillingProposal,
} from "./domain/quote-billing-proposal";

export type { QuoteGuestCustomerSnapshot } from "./domain/quote-guest-customer-snapshot";
export { createQuoteGuestCustomerSnapshot } from "./domain/quote-guest-customer-snapshot";

export type {
  QuoteVersion,
  QuoteVersionNumber,
  QuoteCommercialProposalsInput,
} from "./domain/quote-version";
export {
  createDraftQuoteVersion,
  freezeQuoteVersion,
  createCommercialProposals,
  assertQuoteVersionInvariants,
} from "./domain/quote-version";

export { assertAppendOnlyQuoteHistory } from "./domain/quote-history";

export type {
  QuoteDomainEvent,
  QuoteDomainEventType,
} from "./domain/quote-events";
export { createQuoteDomainEvent } from "./domain/quote-events";

export {
  DomainValidationError,
  InvalidQuoteIdError,
  InvalidQuoteNumberError,
  InvalidQuoteStateTransitionError,
  MissingQuoteProposalError,
  QuoteExpiredError,
  QuoteAcceptanceConflictError,
  QuoteVersionConflictError,
  QuoteNotFoundError,
  DuplicateQuoteNumberError,
  QuoteHistoryImmutableError,
  MissingQuoteCustomerError,
} from "./domain/errors";

export type { QuoteRepository } from "./application/quote-repository";
