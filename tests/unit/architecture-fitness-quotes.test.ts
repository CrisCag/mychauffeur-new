import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const QUOTES_DOMAIN = path.join(REPO_ROOT, "lib/modules/quotes/domain");
const QUOTES_APPLICATION = path.join(
  REPO_ROOT,
  "lib/modules/quotes/application"
);
const QUOTES_ROOT = path.join(REPO_ROOT, "lib/modules/quotes");

function listSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...listSourceFiles(full));
      continue;
    }
    if (/\.ts$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function assertNoForbiddenImports(files: string[], forbidden: RegExp[]) {
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const pattern of forbidden) {
      expect(
        source,
        `${path.relative(REPO_ROOT, file)} matches ${pattern}`
      ).not.toMatch(pattern);
    }
  }
}

describe("architecture fitness — quotes module boundaries", () => {
  it("lives under lib/modules/quotes", () => {
    expect(statSync(QUOTES_ROOT).isDirectory()).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, "lib/modules/quote"))).toBe(false);
  });

  it("Domain and Application do not import Next.js, Supabase, Infrastructure, or bookings", () => {
    const files = [
      ...listSourceFiles(QUOTES_DOMAIN),
      ...listSourceFiles(QUOTES_APPLICATION),
    ];

    assertNoForbiddenImports(files, [
      /@supabase/,
      /supabase-js/,
      /from\s+["']next/,
      /from\s+["']next\//,
      /quotes\/infrastructure/,
      /modules\/bookings/,
      /booking-requests/,
      /trip-ops-store/,
    ]);
  });

  it("Domain has no Pricing Engine, Payment, Booking conversion, findAll, or Role logic", () => {
    const files = listSourceFiles(QUOTES_DOMAIN);
    assertNoForbiddenImports(files, [
      /\bfindAll\b/,
      /pricing-engine/i,
      /payment-provider/i,
      /ConvertAcceptedQuoteToBooking/,
      /modules\/dispatch/,
      /["']OWNER["']/,
      /["']DISPATCHER["']/,
      /readFileSync/,
      /writeFileSync/,
    ]);
  });
});
