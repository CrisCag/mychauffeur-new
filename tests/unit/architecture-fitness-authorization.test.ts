import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const AUTHORIZATION_DIR = path.join(
  REPO_ROOT,
  "lib/modules/platform/security/authorization"
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
    if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

describe("architecture fitness — Authorization Engine", () => {
  it("does not import Next.js, Supabase, Infrastructure, UI, or env", () => {
    for (const file of listSourceFiles(AUTHORIZATION_DIR)) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/from\s+["']next/);
      expect(source).not.toMatch(/@supabase|supabase-js/);
      expect(source).not.toMatch(/identity\/infrastructure|organizations\/infrastructure/);
      expect(source).not.toMatch(/from\s+["']@\/components/);
      expect(source).not.toMatch(/process\.env/);
      expect(source).not.toMatch(/JSON\.parse/);
      expect(source).not.toMatch(/readFileSync|fs\.|node:fs/);
    }
  });

  it("does not hardcode Role → Permission mapping or wildcards", () => {
    for (const file of listSourceFiles(AUTHORIZATION_DIR)) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/OWNER\s*:\s*\[/);
      expect(source).not.toMatch(/DISPATCHER\s*:\s*\[/);
      expect(source).not.toMatch(/roleToPermission|ROLE_PERMISSION_MAP/i);
      expect(source).not.toMatch(/grantedPermissions\.includes\(["']\*["']\)/);
      expect(source).not.toMatch(/endsWith\(["']\.\*["']\)/);
    }
  });

  it("evaluateAuthorization is exported as a pure engine entry point", () => {
    const index = readFileSync(path.join(AUTHORIZATION_DIR, "index.ts"), "utf8");
    expect(index).toContain("evaluateAuthorization");
    expect(index).toContain("createAuthorizationPolicy");
    expect(index).not.toContain("InMemory");
  });
});
