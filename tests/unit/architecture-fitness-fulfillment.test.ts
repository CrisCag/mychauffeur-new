import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const ROOT = path.join(REPO_ROOT, "lib/modules/fulfillment");

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

describe("architecture fitness — Booking fulfillment orchestration", () => {
  it("uses public Booking and Service packages without infrastructure", () => {
    const joined = sources(ROOT)
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(joined).toMatch(/modules\/bookings/);
    expect(joined).toMatch(/modules\/services/);
    expect(joined).not.toMatch(/\/infrastructure|@supabase|supabase-js/);
    expect(joined).not.toMatch(/modules\/trips|modules\/assignments/);
  });

  it("contains no web, pricing, payment, dispatch, filesystem, or runtime JSON concerns", () => {
    const joined = sources(ROOT)
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(joined).not.toMatch(/from\s+["']next|app\/|components\//);
    expect(joined).not.toMatch(/pricing|payment|dispatch|gps/i);
    expect(joined).not.toMatch(/readFileSync|writeFileSync|JSON\.parse|JSON\.stringify/);
  });
});
