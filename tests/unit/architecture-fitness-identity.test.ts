import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const IDENTITY_DOMAIN = path.join(REPO_ROOT, "lib/modules/identity/domain");
const IDENTITY_APPLICATION = path.join(
  REPO_ROOT,
  "lib/modules/identity/application"
);
const IDENTITY_PUBLIC_INDEX = path.join(
  REPO_ROOT,
  "lib/modules/identity/index.ts"
);
const APP_API = path.join(REPO_ROOT, "app/api");

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

describe("architecture fitness — identity module boundaries", () => {
  it("Domain does not import Supabase, Next.js, or infrastructure", () => {
    for (const file of listSourceFiles(IDENTITY_DOMAIN)) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/@supabase|supabase-js/);
      expect(source).not.toMatch(/from\s+["']next/);
      expect(source).not.toMatch(/identity\/infrastructure/);
      expect(source).not.toMatch(/password|refresh_token/);
    }
  });

  it("Application does not depend on concrete adapters or NextRequest", () => {
    for (const file of listSourceFiles(IDENTITY_APPLICATION)) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/DevelopmentAuthenticationProvider/);
      expect(source).not.toMatch(/InMemory/);
      expect(source).not.toMatch(/from\s+["']next\/server["']/);
      expect(source).not.toMatch(/import\s+type\s+\{[^}]*NextRequest/);
      expect(source).not.toMatch(/from\s+["']next["']/);
      expect(source).not.toMatch(/@supabase/);
    }
  });

  it("public identity index does not export Development stub or in-memory adapters", () => {
    const source = readFileSync(IDENTITY_PUBLIC_INDEX, "utf8");
    expect(source).not.toContain("DevelopmentAuthenticationProvider");
    expect(source).not.toContain("InMemoryPersonRepository");
    expect(source).not.toContain("InMemoryUserRepository");
    expect(source).not.toContain("InMemoryExternalIdentityRepository");
    expect(source).not.toContain("InMemoryOrganizationMembershipRepository");
    expect(source).not.toContain("InMemoryRoleRepository");
    expect(source).not.toContain("InMemoryPermissionRepository");
    expect(source).not.toContain("InMemoryMembershipRoleRepository");
    expect(source).not.toContain("InMemoryRolePermissionRepository");
    expect(source).not.toContain("InMemoryPermissionResolver");
  });

  it("PermissionResolver remains a Port without concrete adapter imports in application", () => {
    const resolverPort = path.join(
      IDENTITY_APPLICATION,
      "permission-resolver.ts"
    );
    const source = readFileSync(resolverPort, "utf8");
    expect(source).not.toMatch(/InMemory/);
    expect(source).not.toMatch(/@supabase|supabase-js/);
    expect(source).not.toMatch(/from\s+["']next/);
    expect(source).toContain("resolvePermissions");
  });

  it("Domain authorization model does not introduce wildcard permissions", () => {
    for (const file of listSourceFiles(IDENTITY_DOMAIN)) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/\*\.\*|permission:\s*["']\*["']/);
    }
  });

  it("API routes do not import DevelopmentAuthenticationProvider", () => {
    for (const file of listSourceFiles(APP_API)) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("DevelopmentAuthenticationProvider");
      expect(source).not.toContain("lib/modules/identity/infrastructure");
    }
  });
});
