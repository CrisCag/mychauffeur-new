import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202610050003_os_foundation_booking_fulfillment.sql"
);

describe("OS Foundation booking fulfillment migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .replace(/\s+/g, " ")
    .toLowerCase();

  it("adds aggregate fulfillment states and timestamps only to bookings", () => {
    expect(normalized).toContain("alter table bookings");
    expect(normalized).toContain("add column fulfillment_started_at");
    expect(normalized).toContain("add column completed_at");
    expect(normalized).toContain("'in_progress'");
    expect(normalized).toContain("'completed'");
    expect(normalized).not.toMatch(/alter table services|alter table assignments|alter table trips/);
  });

  it("preserves confirmed timestamp and commercial snapshots after confirmation", () => {
    expect(normalized).toContain("ck_bookings_confirmed_at_status");
    expect(normalized).toContain("ck_bookings_fulfillment_started_status");
    expect(normalized).toContain("ck_bookings_completed_at_status");
    expect(normalized).toContain("status in ('confirmed', 'in_progress', 'completed')");
    expect(normalized).toContain("commercial_revision = 1");
  });

  it("keeps Trip details and privileged database logic out", () => {
    expect(normalized).toContain("ck_bookings_fulfillment_timestamp_order");
    expect(normalized).not.toMatch(/\ben_route_at\b|\barrived_at\b|\bstarted_at\b/);
    expect(normalized).not.toMatch(/\bdriver_id\b|\bvehicle_id\b|\bassignment_id\b|\btrip_id\b/);
    expect(normalized).not.toMatch(/\bcreate\s+policy\b|\bgrant\b|security\s+definer|create\s+trigger/);
  });

  it("preserves RLS and is explicitly non-applied", () => {
    expect(sql.toLowerCase()).toContain("rls remains enabled and forced");
    expect(sql.toLowerCase()).toContain("must not be treated as applied");
  });
});
