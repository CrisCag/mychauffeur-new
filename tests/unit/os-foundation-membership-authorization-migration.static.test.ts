import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202607310001_os_foundation_membership_roles_permissions.sql"
);

describe("OS Foundation membership/roles/permissions migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql.replace(/\s+/g, " ").toLowerCase();

  it("creates the five foundation tables", () => {
    expect(normalized).toContain("create table organization_memberships");
    expect(normalized).toContain("create table roles");
    expect(normalized).toContain("create table permissions");
    expect(normalized).toContain("create table membership_roles");
    expect(normalized).toContain("create table role_permissions");
  });

  it("defines principal foreign keys", () => {
    expect(normalized).toMatch(
      /foreign key\s*\(\s*tenant_id\s*\)\s*references\s+tenants/
    );
    expect(normalized).toMatch(
      /foreign key\s*\(\s*organization_id\s*\)\s*references\s+organizations/
    );
    expect(normalized).toMatch(
      /foreign key\s*\(\s*user_id\s*\)\s*references\s+users/
    );
    expect(normalized).toMatch(
      /foreign key\s*\(\s*membership_id\s*\)\s*references\s+organization_memberships/
    );
    expect(normalized).toMatch(
      /foreign key\s*\(\s*role_id\s*\)\s*references\s+roles/
    );
    expect(normalized).toMatch(
      /foreign key\s*\(\s*permission_id\s*\)\s*references\s+permissions/
    );
  });

  it("enforces uniqueness for membership, permission code, and relations", () => {
    expect(normalized).toContain("uq_organization_memberships_tenant_org_user");
    expect(normalized).toMatch(
      /unique\s*\(\s*tenant_id\s*,\s*organization_id\s*,\s*user_id\s*\)/
    );
    expect(normalized).toContain("uq_permissions_code");
    expect(normalized).toMatch(/unique\s*\(\s*code\s*\)/);
    expect(normalized).toContain("primary key (membership_id, role_id)");
    expect(normalized).toContain("primary key (role_id, permission_id)");
  });

  it("enables and forces RLS without permissive policies", () => {
    for (const table of [
      "organization_memberships",
      "roles",
      "permissions",
      "membership_roles",
      "role_permissions",
    ]) {
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

  it("does not create Booking, Customer, Payment, password, token, or triggers", () => {
    expect(normalized).not.toContain("create table bookings");
    expect(normalized).not.toContain("create table customers");
    expect(normalized).not.toContain("create table payments");
    expect(normalized).not.toContain("password");
    expect(normalized).not.toContain("password_hash");
    expect(normalized).not.toMatch(/\btoken\b/);
    expect(normalized).not.toMatch(/create\s+trigger/);
    expect(normalized).not.toMatch(/create\s+function/);
  });
});
