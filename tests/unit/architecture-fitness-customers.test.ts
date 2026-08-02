import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const CUSTOMERS_DOMAIN = path.join(REPO_ROOT, "lib/modules/customers/domain");
const CUSTOMERS_APPLICATION = path.join(
  REPO_ROOT,
  "lib/modules/customers/application"
);
const CUSTOMERS_ROOT = path.join(REPO_ROOT, "lib/modules/customers");

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

describe("architecture fitness — customers module boundaries", () => {
  it("lives under lib/modules/customers", () => {
    expect(statSync(CUSTOMERS_ROOT).isDirectory()).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, "lib/modules/customer"))).toBe(
      false
    );
  });

  it("Domain and Application do not import Next.js, Supabase, Infrastructure, Booking, Quote, or Identity Infrastructure", () => {
    const files = [
      ...listSourceFiles(CUSTOMERS_DOMAIN),
      ...listSourceFiles(CUSTOMERS_APPLICATION),
    ];

    assertNoForbiddenImports(files, [
      /@supabase/,
      /supabase-js/,
      /from\s+["']next/,
      /from\s+["']next\//,
      /customers\/infrastructure/,
      /modules\/bookings/,
      /modules\/quotes/,
      /identity\/infrastructure/,
      /booking-requests/,
      /trip-ops-store/,
    ]);
  });

  it("Domain has no CRM, merge, email lookup, findAll, Role, or runtime JSON", () => {
    const files = listSourceFiles(CUSTOMERS_DOMAIN);
    assertNoForbiddenImports(files, [
      /\bfindAll\b/,
      /\bfindByEmail\b/,
      /\bfindByPhone\b/,
      /auto[- ]?merge/i,
      /deduplicat/i,
      /\bcrm\b/i,
      /lead[-_ ]?prospect/i,
      /modules\/crm/,
      /pricing-engine/i,
      /payment-provider/i,
      /["']OWNER["']/,
      /["']DISPATCHER["']/,
      /["']CUSTOMER["']/,
      /readFileSync/,
      /writeFileSync/,
      /JSON\.parse/,
      /JSON\.stringify/,
    ]);
  });
});
