import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202610050001_os_foundation_trips.sql"
);

describe("OS Foundation trips migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .replace(/\s+/g, " ")
    .toLowerCase();

  it("creates trips with a scope-safe Assignment-Service relation", () => {
    expect(normalized).toContain("create table trips");
    expect(normalized).toContain("uq_assignments_id_service_tenant_org");
    expect(normalized).toMatch(/foreign key\s*\(\s*assignment_id\s*,\s*service_id\s*,\s*tenant_id\s*,\s*organization_id\s*\)/);
    expect(normalized).toMatch(/references assignments\s*\(\s*id\s*,\s*service_id\s*,\s*tenant_id\s*,\s*organization_id\s*\)/);
  });

  it("defines the canonical operational states and lifecycle coupling", () => {
    for (const status of ["scheduled", "en_route", "arrived", "ongoing", "completed", "no_show_customer", "no_show_driver", "cancelled", "disrupted"]) {
      expect(normalized).toContain(`'${status}'`);
    }
    expect(normalized).toContain("ck_trips_terminal_ended");
    expect(normalized).toContain("ck_trips_reason_coupling");
    expect(normalized).toContain("ck_trips_timestamp_dependencies");
    expect(normalized).toContain("ck_trips_timestamp_order");
  });

  it("allows one current Trip per Service", () => {
    expect(normalized).toContain("create unique index uq_trips_current_service");
    expect(normalized).toContain("where status in ('scheduled', 'en_route', 'arrived', 'ongoing')");
  });

  it("does not absorb GPS, pricing, payments, evidence blobs, or dispatch ranking", () => {
    expect(normalized).not.toMatch(/\blatitude\b|\blongitude\b|\bgps\b/);
    expect(normalized).not.toMatch(/\bprice\b|\bcost\b|\bpayment\b|\bpayout\b/);
    expect(normalized).not.toMatch(/\bevidence\b|\bphoto\b|\battachment\b/);
    expect(normalized).not.toMatch(/\branking\b|\bscore\b|\boffer_id\b/);
  });

  it("enables and forces deny-by-default RLS without privileged logic", () => {
    expect(normalized).toContain("alter table trips enable row level security");
    expect(normalized).toContain("alter table trips force row level security");
    expect(normalized).not.toMatch(/\bcreate\s+policy\b/);
    expect(normalized).not.toMatch(/\bgrant\b/);
    expect(normalized).not.toMatch(/security\s+definer|create\s+trigger/);
  });

  it("is explicitly non-applied", () => {
    expect(sql.toLowerCase()).toContain("must not be treated as applied");
  });
});
