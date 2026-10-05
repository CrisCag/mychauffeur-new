import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202610050002_os_foundation_service_execution.sql"
);

describe("OS Foundation service execution migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .replace(/\s+/g, " ")
    .toLowerCase();

  it("extends only Service execution lifecycle", () => {
    expect(normalized).toContain("alter table services");
    expect(normalized).toContain("add column execution_started_at");
    expect(normalized).toContain("add column completed_at");
    expect(normalized).toContain("'in_execution'");
    expect(normalized).toContain("'completed'");
    expect(normalized).not.toMatch(/alter table assignments|alter table trips|alter table bookings/);
  });

  it("enforces status, timestamp coupling, and ordering", () => {
    expect(normalized).toContain("ck_services_status");
    expect(normalized).toContain("ck_services_execution_coupling");
    expect(normalized).toContain("ck_services_completion_coupling");
    expect(normalized).toContain("ck_services_execution_timestamp_order");
  });

  it("does not add pricing, payments, dispatch, GPS, or permissive security", () => {
    expect(normalized).not.toMatch(/\bprice\b|\bcost\b|\bpayment\b|\bpayout\b/);
    expect(normalized).not.toMatch(/\bdispatch\b|\branking\b|\boffer\b/);
    expect(normalized).not.toMatch(/\bgps\b|\blatitude\b|\blongitude\b/);
    expect(normalized).not.toMatch(/\bcreate\s+policy\b|\bgrant\b|security\s+definer/);
  });

  it("preserves RLS and is explicitly non-applied", () => {
    expect(sql.toLowerCase()).toContain("rls remains enabled and forced");
    expect(sql.toLowerCase()).toContain("must not be treated as applied");
  });
});
