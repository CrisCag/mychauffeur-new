import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202607260001_os_foundation_tenants_organizations.sql"
);

describe("OS Foundation tenants/organizations migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql.replace(/\s+/g, " ").toLowerCase();

  it("creates tenants and organizations tables", () => {
    expect(normalized).toContain("create table tenants");
    expect(normalized).toContain("create table organizations");
  });

  it("defines FK organizations → tenants", () => {
    expect(normalized).toMatch(
      /foreign key\s*\(\s*tenant_id\s*\)\s*references\s+tenants/
    );
  });

  it("enables and forces RLS on both tables without permissive anon policies", () => {
    expect(normalized).toContain("alter table tenants enable row level security");
    expect(normalized).toContain("alter table organizations enable row level security");
    expect(normalized).toContain("alter table tenants force row level security");
    expect(normalized).toContain(
      "alter table organizations force row level security"
    );

    expect(normalized).not.toMatch(/create policy/);
    expect(normalized).not.toMatch(/to\s+anon/);
    expect(normalized).not.toMatch(/to\s+authenticated/);
    expect(normalized).not.toMatch(/using\s*\(\s*true\s*\)/);
  });

  it("enforces tenant-scoped unique organization code", () => {
    expect(normalized).toContain("uq_organizations_tenant_code");
    expect(normalized).toMatch(/unique\s*\(\s*tenant_id\s*,\s*code\s*\)/);
  });

  it("does not create Payment, Booking, or User tables", () => {
    expect(normalized).not.toContain("create table payments");
    expect(normalized).not.toContain("create table payment");
    expect(normalized).not.toContain("create table bookings");
    expect(normalized).not.toContain("create table booking");
    expect(normalized).not.toContain("create table users");
    expect(normalized).not.toContain("create table user");
  });
});
