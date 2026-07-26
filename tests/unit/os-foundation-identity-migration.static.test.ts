import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202607260002_os_foundation_identity.sql"
);

describe("OS Foundation identity migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql.replace(/\s+/g, " ").toLowerCase();

  it("creates persons, users, and external_identities", () => {
    expect(normalized).toContain("create table persons");
    expect(normalized).toContain("create table users");
    expect(normalized).toContain("create table external_identities");
  });

  it("defines required foreign keys", () => {
    expect(normalized).toMatch(
      /foreign key\s*\(\s*person_id\s*\)\s*references\s+persons/
    );
    expect(normalized).toMatch(
      /foreign key\s*\(\s*user_id\s*\)\s*references\s+users/
    );
  });

  it("enforces unique provider + provider_subject", () => {
    expect(normalized).toContain("uq_external_identities_provider_subject");
    expect(normalized).toMatch(
      /unique\s*\(\s*provider\s*,\s*provider_subject\s*\)/
    );
  });

  it("enables and forces RLS without permissive policies", () => {
    for (const table of ["persons", "users", "external_identities"]) {
      expect(normalized).toContain(
        `alter table ${table} enable row level security`
      );
      expect(normalized).toContain(
        `alter table ${table} force row level security`
      );
    }
    expect(normalized).not.toMatch(/create policy/);
    expect(normalized).not.toMatch(/to\s+anon/);
    expect(normalized).not.toMatch(/to\s+authenticated/);
    expect(normalized).not.toMatch(/using\s*\(\s*true\s*\)/);
  });

  it("does not persist passwords, tokens, Membership, Role, Permission, or Booking", () => {
    expect(normalized).not.toContain("password");
    expect(normalized).not.toContain("password_hash");
    expect(normalized).not.toContain("refresh_token");
    expect(normalized).not.toMatch(/\btoken\b/);
    expect(normalized).not.toContain("create table memberships");
    expect(normalized).not.toContain("create table roles");
    expect(normalized).not.toContain("create table permissions");
    expect(normalized).not.toContain("create table bookings");
    expect(normalized).not.toContain("create table sessions");
  });
});
