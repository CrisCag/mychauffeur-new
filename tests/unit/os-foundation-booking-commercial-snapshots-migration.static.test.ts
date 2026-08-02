import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020002_os_foundation_booking_commercial_snapshots.sql"
);

const STEP5_MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020001_os_foundation_bookings.sql"
);

describe("OS Foundation booking commercial snapshots migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql.replace(/\s+/g, " ").toLowerCase();
  const step5 = readFileSync(STEP5_MIGRATION_PATH, "utf8");

  it("is incremental and does not rewrite the Step 5 migration file", () => {
    expect(sql).toContain("202608020001");
    expect(normalized).toContain("alter table bookings");
    expect(normalized).not.toContain("create table bookings");
    expect(step5).not.toContain("price_snapshot");
  });

  it("adds the four commercial snapshot columns and commercial_revision", () => {
    expect(normalized).toContain("add column price_snapshot jsonb null");
    expect(normalized).toContain("add column policy_snapshot jsonb null");
    expect(normalized).toContain("add column contact_snapshot jsonb null");
    expect(normalized).toContain("add column billing_snapshot jsonb null");
    expect(normalized).toContain(
      "add column commercial_revision integer not null default 0"
    );
  });

  it("forbids partial snapshots and couples presence to status with revision exactly 0 or 1", () => {
    expect(normalized).toContain("ck_bookings_commercial_snapshots_all_or_none");
    expect(normalized).toContain("ck_bookings_commercial_snapshots_by_status");
    expect(normalized).toMatch(
      /status\s*=\s*'confirmed'[\s\S]*commercial_revision\s*=\s*1/
    );
    expect(normalized).toMatch(
      /status\s*=\s*'cancelled'[\s\S]*commercial_revision\s*=\s*0/
    );
    expect(normalized).toMatch(
      /status\s*=\s*'cancelled'[\s\S]*commercial_revision\s*=\s*1/
    );
    expect(normalized).toMatch(
      /status\s+in\s*\(\s*'draft'\s*,\s*'pending_confirmation'\s*,\s*'expired'\s*\)/
    );
    expect(normalized).toContain("commercial_revision = 0");
    expect(normalized).toContain("commercial_revision = 1");
    expect(normalized).not.toContain("commercial_revision >= 1");
  });

  it("documents append-only BookingRevision limits without fake triggers or SECURITY DEFINER", () => {
    expect(sql.toLowerCase()).toContain("append-only");
    expect(sql.toLowerCase()).toContain("cannot");
    expect(normalized).not.toMatch(/create\s+trigger/);
    expect(normalized).not.toMatch(/create\s+(or\s+replace\s+)?function/);
    expect(normalized).not.toMatch(/security\s+definer/);
    expect(normalized).not.toMatch(/create\s+table\s+booking_revisions/);
  });

  it("keeps RLS enable and force without permissive policies", () => {
    expect(normalized).toContain(
      "alter table bookings enable row level security"
    );
    expect(normalized).toContain(
      "alter table bookings force row level security"
    );
    expect(normalized).not.toMatch(/\bcreate\s+policy\b/);
    expect(normalized).not.toMatch(/disable row level security/);
    expect(normalized).not.toMatch(/to\s+anon/);
    expect(normalized).not.toMatch(/using\s*\(\s*true\s*\)/);
  });

  it("does not introduce payment card, ledger, or quote engine columns", () => {
    expect(normalized).not.toMatch(/\bcard_number\b/);
    expect(normalized).not.toMatch(/\bpan\b/);
    expect(normalized).not.toMatch(/\bpayment_token\b/);
    expect(normalized).not.toMatch(/\bledger_entry\b/);
    expect(normalized).not.toMatch(/\bquote_engine\b/);
  });

  it("documents that migration must not be treated as applied", () => {
    expect(sql.toLowerCase()).toContain("must not be treated");
    expect(sql.toLowerCase()).toContain("as applied");
  });
});
