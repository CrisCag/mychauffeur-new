import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020004_os_foundation_customers.sql"
);

const QUOTES_MIGRATION = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020003_os_foundation_quotes.sql"
);

const BOOKINGS_MIGRATION = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020001_os_foundation_bookings.sql"
);

describe("OS Foundation customers migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql.replace(/\s+/g, " ").toLowerCase();
  const withoutLineComments = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .replace(/\s+/g, " ")
    .toLowerCase();
  const quotesSql = readFileSync(QUOTES_MIGRATION, "utf8");
  const bookingsSql = readFileSync(BOOKINGS_MIGRATION, "utf8");

  it("creates customers without altering bookings or quotes migrations", () => {
    expect(normalized).toContain("create table customers");
    expect(withoutLineComments).not.toContain("alter table bookings");
    expect(withoutLineComments).not.toContain("alter table quotes");
    expect(quotesSql.toLowerCase()).not.toContain("create table customers");
    expect(bookingsSql.toLowerCase()).not.toContain("create table customers");
  });

  it("defines tenant/org FKs and unique customer_number", () => {
    expect(normalized).toContain("fk_customers_tenant");
    expect(normalized).toContain("fk_customers_organization");
    expect(normalized).toContain("fk_customers_org_tenant");
    expect(normalized).toMatch(
      /unique\s*\(\s*tenant_id\s*,\s*organization_id\s*,\s*customer_number\s*\)/
    );
  });

  it("checks type, status, name coupling, anonymization and identity coupling", () => {
    expect(withoutLineComments).toContain("'individual'");
    expect(withoutLineComments).toContain("'organization'");
    expect(withoutLineComments).toContain("'active'");
    expect(withoutLineComments).toContain("'inactive'");
    expect(withoutLineComments).toContain("'anonymized'");
    expect(withoutLineComments).toContain("ck_customers_type_name_active_inactive");
    expect(withoutLineComments).toContain("ck_customers_anonymized_cleared");
    expect(withoutLineComments).toContain("ck_customers_identity_link_coupling");
    expect(withoutLineComments).toMatch(
      /customer_type\s*=\s*'individual'[\s\S]*individual_name\s+is\s+not\s+null[\s\S]*organization_name\s+is\s+null/
    );
    expect(withoutLineComments).toMatch(
      /customer_type\s*=\s*'organization'[\s\S]*organization_name\s+is\s+not\s+null[\s\S]*individual_name\s+is\s+null/
    );
    expect(withoutLineComments).toMatch(
      /status\s*=\s*'anonymized'\s+and\s+anonymized_at\s+is\s+not\s+null/
    );
    expect(withoutLineComments).toMatch(
      /identity_subject_id\s+is\s+null\s+and\s+identity_linked_at\s+is\s+null/
    );
    expect(withoutLineComments).not.toContain("'blocked'");
    expect(withoutLineComments).not.toContain("'merged'");
    expect(withoutLineComments).not.toContain("'prospect'");
  });

  it("adds partial unique index for identity_subject_id in scope", () => {
    expect(normalized).toContain("uq_customers_tenant_org_identity_subject");
    expect(normalized).toMatch(
      /where\s+identity_subject_id\s+is\s+not\s+null/
    );
  });

  it("enables and forces RLS without permissive policies or SECURITY DEFINER", () => {
    expect(withoutLineComments).toContain(
      "alter table customers enable row level security"
    );
    expect(withoutLineComments).toContain(
      "alter table customers force row level security"
    );
    expect(withoutLineComments).not.toMatch(/\bcreate\s+policy\b/);
    expect(withoutLineComments).not.toMatch(/security\s+definer/);
    expect(withoutLineComments).not.toMatch(/create\s+trigger/);
  });

  it("documents non-applied migration and excludes credential/consent fields", () => {
    expect(sql.toLowerCase()).toContain("must not be treated");
    expect(sql.toLowerCase()).toContain("as applied");
    expect(withoutLineComments).not.toContain("password");
    expect(withoutLineComments).not.toContain("consent");
    expect(withoutLineComments).not.toMatch(/\bfind_by_email\b/);
  });
});
