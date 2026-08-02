import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const BOOKINGS_DOMAIN = path.join(REPO_ROOT, "lib/modules/bookings/domain");
const BOOKINGS_APPLICATION = path.join(
  REPO_ROOT,
  "lib/modules/bookings/application"
);
const BOOKINGS_ROOT = path.join(REPO_ROOT, "lib/modules/bookings");

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

describe("architecture fitness — bookings module boundaries", () => {
  it("lives under lib/modules/bookings (plural)", () => {
    expect(statSync(BOOKINGS_ROOT).isDirectory()).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, "lib/modules/booking"))).toBe(false);
  });

  it("Domain and Application do not import Next.js, Supabase, or Infrastructure", () => {
    const files = [
      ...listSourceFiles(BOOKINGS_DOMAIN),
      ...listSourceFiles(BOOKINGS_APPLICATION),
    ];

    assertNoForbiddenImports(files, [
      /@supabase/,
      /supabase-js/,
      /from\s+["']next/,
      /from\s+["']next\//,
      /bookings\/infrastructure/,
      /booking-requests/,
      /trip-ops-store/,
      /operational-trips/,
    ]);
  });

  it("Domain Aggregate has no Role hardcoded, Permission logic, findAll, or Dispatch/Payment imports", () => {
    const files = listSourceFiles(BOOKINGS_DOMAIN);
    assertNoForbiddenImports(files, [
      /\bfindAll\b/,
      /["']OWNER["']/,
      /["']DISPATCHER["']/,
      /["']DRIVER["']/,
      /modules\/platform\/security/,
      /modules\/dispatch/,
      /CUSTOMER_DRIVER_PARTNER_SUPPORT/,
      /payment-provider/i,
      /pricing-engine/i,
      /quote-engine/i,
      /from\s+["']fs["']/,
      /readFileSync/,
      /writeFileSync/,
    ]);
  });

  it("Domain commercial snapshots do not model card numbers, tokens, or runtime JSON SoT", () => {
    const files = listSourceFiles(BOOKINGS_DOMAIN);
    assertNoForbiddenImports(files, [
      /\bcardNumber\b/,
      /paymentToken/i,
      /\bcvv\b/i,
      /trip-ops-store/,
      /booking-requests\.json/,
    ]);
  });
});
