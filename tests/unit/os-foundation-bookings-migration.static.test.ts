import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020001_os_foundation_bookings.sql"
);

describe("OS Foundation bookings migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql.replace(/\s+/g, " ").toLowerCase();

  it("creates bookings table with required columns", () => {
    expect(normalized).toContain("create table bookings");
    for (const column of [
      "id",
      "tenant_id",
      "organization_id",
      "booking_number",
      "booked_by_actor_id",
      "customer_id",
      "guest_customer_snapshot",
      "source",
      "status",
      "requested_at",
      "confirmed_at",
      "cancelled_at",
      "expired_at",
      "version",
      "created_at",
      "updated_at",
    ]) {
      expect(normalized).toContain(column);
    }
  });

  it("defines status and source checks for Step 5 subset", () => {
    expect(normalized).toContain("ck_bookings_status");
    expect(normalized).toContain("'draft'");
    expect(normalized).toContain("'pending_confirmation'");
    expect(normalized).toContain("'confirmed'");
    expect(normalized).toContain("'cancelled'");
    expect(normalized).toContain("'expired'");
    expect(normalized).not.toContain("'quoted'");
    expect(normalized).not.toContain("'ready_for_service_generation'");

    expect(normalized).toContain("ck_bookings_source");
    expect(normalized).toContain("'b2c_web'");
    expect(normalized).toContain("'partner_referral'");
  });

  it("enforces unique booking number scope and version check", () => {
    expect(normalized).toContain("uq_bookings_tenant_org_booking_number");
    expect(normalized).toMatch(
      /unique\s*\(\s*tenant_id\s*,\s*organization_id\s*,\s*booking_number\s*\)/
    );
    expect(normalized).toContain("ck_bookings_version_non_negative");
    expect(normalized).toMatch(/version\s*>=\s*0/);
    expect(normalized).toContain("ck_bookings_customer_or_guest");
  });

  it("enables and forces RLS without permissive policies", () => {
    expect(normalized).toContain(
      "alter table bookings enable row level security"
    );
    expect(normalized).toContain(
      "alter table bookings force row level security"
    );
    expect(normalized).not.toMatch(/create policy/);
    expect(normalized).not.toMatch(/to\s+anon/);
    expect(normalized).not.toMatch(/to\s+authenticated/);
    expect(normalized).not.toMatch(/using\s*\(\s*true\s*\)/);
  });

  it("does not introduce Driver, Vehicle, GPS, Ledger, Payment, or Quote columns", () => {
    expect(normalized).not.toMatch(/\bdriver_id\b/);
    expect(normalized).not.toMatch(/\bvehicle_id\b/);
    expect(normalized).not.toMatch(/\bgps_[a-z_]+\b/);
    expect(normalized).not.toMatch(/\bledger_[a-z_]+\b/);
    expect(normalized).not.toMatch(/\bpayment_intent\b/);
    expect(normalized).not.toMatch(/\bquote_id\b/);
    expect(normalized).not.toMatch(/\bprice_snapshot\b/);
  });

  it("applies composite tenant/organization FK integrity pattern when available", () => {
    expect(normalized).toContain("fk_bookings_tenant");
    expect(normalized).toContain("fk_bookings_organization");
    expect(normalized).toContain("fk_bookings_org_tenant");
    expect(normalized).toMatch(
      /foreign key\s*\(\s*organization_id\s*,\s*tenant_id\s*\)/
    );
    expect(normalized).toContain("references organizations (id, tenant_id)");
  });

  it("documents that migration is foundation-only and not applied by this step", () => {
    expect(sql.toLowerCase()).toContain("must not be treated");
    expect(sql.toLowerCase()).toContain("as applied");
  });
});
