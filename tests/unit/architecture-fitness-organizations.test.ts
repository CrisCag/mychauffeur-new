import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const ORG_DOMAIN = path.join(REPO_ROOT, "lib/modules/organizations/domain");
const ORG_APPLICATION = path.join(
  REPO_ROOT,
  "lib/modules/organizations/application"
);

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
      expect(source, `${path.relative(REPO_ROOT, file)} matches ${pattern}`).not.toMatch(
        pattern
      );
    }
  }
}

describe("architecture fitness — organizations module boundaries", () => {
  it("Domain and Application do not import Supabase, Next.js, or infrastructure", () => {
    const files = [
      ...listSourceFiles(ORG_DOMAIN),
      ...listSourceFiles(ORG_APPLICATION),
    ];

    assertNoForbiddenImports(files, [
      /@supabase/,
      /supabase-js/,
      /from\s+["']next/,
      /from\s+["']next\//,
      /organizations\/infrastructure/,
      /booking-requests/,
      /trip-ops-store/,
    ]);
  });
});
