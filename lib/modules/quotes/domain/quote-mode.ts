export const QUOTE_MODES = [
  "INSTANT",
  "MANUAL",
  "REQUEST_TO_QUOTE",
] as const;

export type QuoteMode = (typeof QUOTE_MODES)[number];

export function isQuoteMode(value: string): value is QuoteMode {
  return (QUOTE_MODES as readonly string[]).includes(value);
}
