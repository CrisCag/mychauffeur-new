import { InvalidQuoteNumberError } from "./errors";

declare const quoteNumberBrand: unique symbol;

/**
 * Public quote reference — distinct from QuoteId.
 * Not a sequential integer. Contains no PII.
 * Format: QT- + 8..32 uppercase alphanumeric characters.
 */
export type QuoteNumber = string & {
  readonly [quoteNumberBrand]: "QuoteNumber";
};

const QUOTE_NUMBER_PATTERN = /^QT-[A-Z0-9]{8,32}$/;

export function normalizeQuoteNumber(value: string): string {
  return value.trim().toUpperCase();
}

export function asQuoteNumber(value: string): QuoteNumber {
  const normalized = normalizeQuoteNumber(value);
  if (!QUOTE_NUMBER_PATTERN.test(normalized)) {
    throw new InvalidQuoteNumberError();
  }
  return normalized as QuoteNumber;
}

export function createQuoteNumberFromToken(token: string): QuoteNumber {
  const compact = token.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (compact.length < 8) {
    throw new InvalidQuoteNumberError();
  }
  return asQuoteNumber(`QT-${compact.slice(0, 16)}`);
}
