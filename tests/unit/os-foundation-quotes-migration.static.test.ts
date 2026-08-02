import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION_PATH = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020003_os_foundation_quotes.sql"
);

const BOOKINGS_MIGRATION = path.resolve(
  __dirname,
  "../../supabase/migrations/202608020001_os_foundation_bookings.sql"
);

describe("OS Foundation quotes migration (static)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");
  const normalized = sql.replace(/\s+/g, " ").toLowerCase();
  const bookingsSql = readFileSync(BOOKINGS_MIGRATION, "utf8");

  it("creates quotes and quote_versions without altering bookings migration", () => {
    expect(normalized).toContain("create table quotes");
    expect(normalized).toContain("create table quote_versions");
    expect(bookingsSql).not.toContain("accepted_quote_version");
    expect(normalized).not.toContain("alter table bookings");
  });

  it("defines tenant/org FKs, unique quote number, and version uniqueness", () => {
    expect(normalized).toContain("fk_quotes_tenant");
    expect(normalized).toContain("fk_quotes_organization");
    expect(normalized).toContain("fk_quotes_org_tenant");
    expect(normalized).toMatch(
      /unique\s*\(\s*tenant_id\s*,\s*organization_id\s*,\s*quote_number\s*\)/
    );
    expect(normalized).toMatch(
      /unique\s*\(\s*quote_id\s*,\s*version_number\s*\)/
    );
  });

  it("checks status, mode, proposal all-or-none, acceptance_command_id coupling", () => {
    expect(normalized).toContain("'instant'");
    expect(normalized).toContain("'request_to_quote'");
    expect(normalized).toContain("'draft'");
    expect(normalized).toContain("'superseded'");
    expect(normalized).toContain("ck_quote_versions_proposals_all_or_none");
    expect(normalized).toContain("ck_quote_versions_acceptance_fields");
    expect(normalized).toMatch(
      /status\s*=\s*'accepted'[\s\S]*acceptance_command_id\s+is\s+not\s+null/
    );
    expect(normalized).toContain("issued_at < expires_at");
  });

  it("adds partial unique indexes for one issued and one accepted", () => {
    expect(normalized).toContain("uq_quote_versions_one_issued");
    expect(normalized).toContain("uq_quote_versions_one_accepted");
    expect(normalized).toMatch(
      /where\s+status\s*=\s*'issued'/
    );
    expect(normalized).toMatch(
      /where\s+status\s*=\s*'accepted'/
    );
  });

  it("enables and forces RLS without permissive policies or SECURITY DEFINER", () => {
    const withoutLineComments = sql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .replace(/\s+/g, " ")
      .toLowerCase();

    expect(withoutLineComments).toContain(
      "alter table quotes enable row level security"
    );
    expect(withoutLineComments).toContain(
      "alter table quotes force row level security"
    );
    expect(withoutLineComments).toContain(
      "alter table quote_versions enable row level security"
    );
    expect(withoutLineComments).toContain(
      "alter table quote_versions force row level security"
    );
    expect(withoutLineComments).not.toMatch(/\bcreate\s+policy\b/);
    expect(withoutLineComments).not.toMatch(/security\s+definer/);
    expect(withoutLineComments).not.toMatch(/create\s+trigger/);
  });

  it("documents append-only limits and non-applied migration", () => {
    expect(sql.toLowerCase()).toContain("append-only");
    expect(sql.toLowerCase()).toContain("old/new");
    expect(sql.toLowerCase()).toContain("must not be treated");
    expect(sql.toLowerCase()).toContain("as applied");
  });
});
