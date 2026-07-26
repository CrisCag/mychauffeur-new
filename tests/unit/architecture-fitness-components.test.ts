import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const COMPONENTS_ROOT = path.join(REPO_ROOT, "components");

/**
 * Known Step-0 architecture debt under components/.
 * Do not expand this list casually; remove entries when imports are fixed.
 */
const KNOWN_COMPONENT_IMPORT_DEBT: readonly string[] = [
  "components/driver/driver-trip-detail.tsx → @/lib/platform/trip-ops-store",
  "components/driver/driver-trips-list.tsx → @/lib/platform/trip-ops-store",
];

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
    if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      files.push(full);
    }
  }

  return files;
}

function detectForbiddenImports(filePath: string): string[] {
  const relative = path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
  const source = readFileSync(filePath, "utf8");
  const hits: string[] = [];
  const lines = source.split("\n");

  for (const line of lines) {
    if (/^\s*\/\//.test(line) || /^\s*\*/.test(line)) continue;
    if (
      /trip-ops-store/.test(line) &&
      (/from\s+["']/.test(line) || /require\s*\(/.test(line))
    ) {
      hits.push(`${relative} → @/lib/platform/trip-ops-store`);
    }
    if (
      /booking-requests/.test(line) &&
      (/from\s+["']/.test(line) || /require\s*\(/.test(line))
    ) {
      hits.push(`${relative} → @/lib/booking-requests`);
    }
  }

  return [...new Set(hits)];
}

describe("architecture fitness — components import boundary", () => {
  it("documents forbidden direct imports from components/ (known debt allowed)", () => {
    const files = listSourceFiles(COMPONENTS_ROOT);
    const violations = files.flatMap(detectForbiddenImports);

    // Unexpected new debt must fail; known Step-0 debt is documented.
    const unexpected = violations.filter(
      (v) => !KNOWN_COMPONENT_IMPORT_DEBT.includes(v)
    );
    const missingKnown = KNOWN_COMPONENT_IMPORT_DEBT.filter(
      (v) => !violations.includes(v)
    );

    expect(
      unexpected,
      `New forbidden component imports detected:\n${unexpected.join("\n")}`
    ).toEqual([]);

    // If known debt is cleaned up, update KNOWN_COMPONENT_IMPORT_DEBT.
    expect(
      missingKnown,
      `Known debt entries are stale (imports already removed):\n${missingKnown.join("\n")}`
    ).toEqual([]);

    expect(violations.sort()).toEqual([...KNOWN_COMPONENT_IMPORT_DEBT].sort());
  });
});
