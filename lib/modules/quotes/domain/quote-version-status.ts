export const QUOTE_VERSION_STATUSES = [
  "DRAFT",
  "ISSUED",
  "ACCEPTED",
  "EXPIRED",
  "WITHDRAWN",
  "REJECTED",
  "SUPERSEDED",
] as const;

export type QuoteVersionStatus = (typeof QUOTE_VERSION_STATUSES)[number];

export const TERMINAL_QUOTE_VERSION_STATUSES = [
  "ACCEPTED",
  "EXPIRED",
  "WITHDRAWN",
  "REJECTED",
  "SUPERSEDED",
] as const;

export type TerminalQuoteVersionStatus =
  (typeof TERMINAL_QUOTE_VERSION_STATUSES)[number];

export function isQuoteVersionStatus(
  value: string
): value is QuoteVersionStatus {
  return (QUOTE_VERSION_STATUSES as readonly string[]).includes(value);
}

export function isTerminalQuoteVersionStatus(
  status: QuoteVersionStatus
): status is TerminalQuoteVersionStatus {
  return (TERMINAL_QUOTE_VERSION_STATUSES as readonly string[]).includes(status);
}

/** Statuses whose commercial proposals and identity are append-only immutable. */
export function isIssuedOrLaterStatus(status: QuoteVersionStatus): boolean {
  return status !== "DRAFT";
}
