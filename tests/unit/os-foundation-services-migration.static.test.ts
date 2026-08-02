import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020005_os_foundation_services.sql"
);

const CUSTOMERS_MIGRATION = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020004_os_foundation_customers.sql"
);

const BOOKINGS_MIGRATION = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020001_os_foundation_bookings.sql"
);

describe("OS Foundation services migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const withoutLineComments = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .replace(/\s+/g, " ")
    .toLowerCase();
  const bookingsSql = readFileSync(BOOKINGS_MIGRATION, "utf8");
  const customersSql = readFileSync(CUSTOMERS_MIGRATION, "utf8");

  it("creates services without altering bookings or customers migrations", () => {
    expect(withoutLineComments).toContain("create table services");
    expect(withoutLineComments).not.toContain("alter table bookings");
    expect(withoutLineComments).not.toContain("alter table customers");
    expect(withoutLineComments).not.toContain("alter table quotes");
    expect(bookingsSql.toLowerCase()).not.toContain("create table services");
    expect(customersSql.toLowerCase()).not.toContain("create table services");
  });

  it("defines tenant/org FKs and scope-safe Booking FK", () => {
    expect(withoutLineComments).toContain("fk_services_tenant");
    expect(withoutLineComments).toContain("fk_services_organization");
    expect(withoutLineComments).toContain("fk_services_org_tenant");
    expect(withoutLineComments).toContain("fk_services_booking_scope");
    expect(withoutLineComments).toMatch(
      /foreign key\s*\(\s*booking_id\s*,\s*tenant_id\s*,\s*organization_id\s*\)/
    );
    expect(withoutLineComments).toMatch(
      /references\s+bookings\s*\(\s*id\s*,\s*tenant_id\s*,\s*organization_id\s*\)/
    );
    expect(bookingsSql.toLowerCase()).toContain("uq_bookings_id_tenant_org");
  });

  it("enforces unique ServiceNumber, generationKey, Booking+sequence", () => {
    expect(withoutLineComments).toMatch(
      /unique\s*\(\s*tenant_id\s*,\s*organization_id\s*,\s*service_number\s*\)/
    );
    expect(withoutLineComments).toMatch(
      /unique\s*\(\s*tenant_id\s*,\s*organization_id\s*,\s*generation_key\s*\)/
    );
    expect(withoutLineComments).toMatch(
      /unique\s*\(\s*tenant_id\s*,\s*organization_id\s*,\s*booking_id\s*,\s*service_sequence\s*\)/
    );
  });

  it("checks type, status, cancel coupling, timestamps, and JSONB objects", () => {
    expect(withoutLineComments).toContain("'transfer'");
    expect(withoutLineComments).toContain("'hourly'");
    expect(withoutLineComments).toContain("'planned'");
    expect(withoutLineComments).toContain("'ready_for_assignment'");
    expect(withoutLineComments).toContain("'cancelled'");
    expect(withoutLineComments).not.toContain("'completed'");
    expect(withoutLineComments).not.toContain("'assigned'");
    expect(withoutLineComments).not.toContain("'in_progress'");
    expect(withoutLineComments).toContain("ck_services_cancel_coupling");
    expect(withoutLineComments).toContain(
      "ck_services_requested_arrival_after_pickup"
    );
    expect(withoutLineComments).toContain("ck_services_route_plan_object");
    expect(withoutLineComments).toContain("ck_services_requirements_object");
  });

  it("excludes Driver/Vehicle/Partner/Assignment/Trip/Price/Payment columns", () => {
    expect(withoutLineComments).not.toMatch(/\bdriver_id\b/);
    expect(withoutLineComments).not.toMatch(/\bvehicle_id\b/);
    expect(withoutLineComments).not.toMatch(/\bpartner_id\b/);
    expect(withoutLineComments).not.toMatch(/\bassignment_id\b/);
    expect(withoutLineComments).not.toMatch(/\btrip_id\b/);
    expect(withoutLineComments).not.toMatch(/\bprice_snapshot\b/);
    expect(withoutLineComments).not.toMatch(/\bpayment\b/);
  });

  it("enables and forces RLS without permissive policies or SECURITY DEFINER", () => {
    expect(withoutLineComments).toContain(
      "alter table services enable row level security"
    );
    expect(withoutLineComments).toContain(
      "alter table services force row level security"
    );
    expect(withoutLineComments).not.toMatch(/\bcreate\s+policy\b/);
    expect(withoutLineComments).not.toMatch(/security\s+definer/);
    expect(withoutLineComments).not.toMatch(/create\s+trigger/);
  });

  it("documents non-applied migration and Domain JSONB responsibility", () => {
    expect(sql.toLowerCase()).toContain("must not be treated");
    expect(sql.toLowerCase()).toContain("as applied");
    expect(sql.toLowerCase()).toContain("domain responsibility");
  });
});
