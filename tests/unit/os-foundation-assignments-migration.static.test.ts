import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202610040001_os_foundation_assignments.sql"
);

describe("OS Foundation assignments migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .replace(/\s+/g, " ")
    .toLowerCase();

  it("creates assignments and the composite Service reference target", () => {
    expect(normalized).toContain("create table assignments");
    expect(normalized).toContain("uq_services_id_tenant_org");
    expect(normalized).toMatch(/on services\s*\(\s*id\s*,\s*tenant_id\s*,\s*organization_id\s*\)/);
  });

  it("defines scope-safe Service and partner Organization foreign keys", () => {
    expect(normalized).toMatch(/foreign key\s*\(\s*service_id\s*,\s*tenant_id\s*,\s*organization_id\s*\)/);
    expect(normalized).toMatch(/references services\s*\(\s*id\s*,\s*tenant_id\s*,\s*organization_id\s*\)/);
    expect(normalized).toMatch(/foreign key\s*\(\s*partner_organization_id\s*,\s*tenant_id\s*\)/);
    expect(normalized).toMatch(/references organizations\s*\(\s*id\s*,\s*tenant_id\s*\)/);
  });

  it("enforces modes, lifecycle states, executor XOR, and one current Assignment", () => {
    for (const value of ["internal", "partner", "pending", "confirmed", "active", "completed", "rejected", "reassigned", "cancelled"]) {
      expect(normalized).toContain(`'${value}'`);
    }
    expect(normalized).toContain("ck_assignments_executor_xor");
    expect(normalized).toContain("ck_assignments_terminal_ended");
    expect(normalized).toContain("ck_assignments_reason_coupling");
    expect(normalized).toContain("create unique index uq_assignments_current_service");
    expect(normalized).toContain("where status in ('pending', 'confirmed', 'active')");
  });

  it("keeps commercial, payment, tracking, and dispatch concerns out", () => {
    expect(normalized).not.toMatch(/\bprice\b/);
    expect(normalized).not.toMatch(/\bcost\b/);
    expect(normalized).not.toMatch(/\bpayment\b/);
    expect(normalized).not.toMatch(/\boffer\b/);
    expect(normalized).not.toMatch(/\branking\b/);
    expect(normalized).not.toMatch(/\blatitude\b|\blongitude\b|\bgps\b/);
    expect(normalized).not.toMatch(/\bdispatch_id\b|\btrip_id\b/);
  });

  it("enables and forces deny-by-default RLS without policies or privileged logic", () => {
    expect(normalized).toContain("alter table assignments enable row level security");
    expect(normalized).toContain("alter table assignments force row level security");
    expect(normalized).not.toMatch(/\bcreate\s+policy\b/);
    expect(normalized).not.toMatch(/\bgrant\b/);
    expect(normalized).not.toMatch(/security\s+definer/);
    expect(normalized).not.toMatch(/create\s+trigger/);
  });

  it("is explicitly non-applied", () => {
    expect(sql.toLowerCase()).toContain("must not be treated as applied");
  });
});
