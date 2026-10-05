import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const ROOT = path.join(REPO_ROOT, "lib/modules/execution");

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory()
      ? sources(full)
      : entry.endsWith(".ts")
        ? [full]
        : [];
  });
}

describe("architecture fitness — execution orchestration", () => {
  it("depends only on public Domain packages and has no infrastructure", () => {
    for (const file of sources(ROOT)) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/\/infrastructure|@supabase|supabase-js/);
      expect(source).not.toMatch(/from\s+["']next|app\/|components\//);
      expect(source).not.toMatch(/readFileSync|writeFileSync|JSON\.parse|JSON\.stringify/);
    }
  });

  it("coordinates Service, Assignment, and Trip without absorbing other domains", () => {
    const source = readFileSync(
      path.join(ROOT, "application/orchestrate-service-execution.ts"),
      "utf8"
    );
    expect(source).toMatch(/modules\/services/);
    expect(source).toMatch(/modules\/assignments/);
    expect(source).toMatch(/modules\/trips/);
    expect(source).not.toMatch(/modules\/bookings|pricing|payment|dispatch/i);
  });
});
