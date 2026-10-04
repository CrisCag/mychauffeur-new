import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const ROOT = path.join(REPO_ROOT, "lib/modules/assignments");
const DOMAIN = path.join(ROOT, "domain");
const APPLICATION = path.join(ROOT, "application");

function sources(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory()
      ? sources(full)
      : entry.endsWith(".ts")
        ? [full]
        : [];
  });
}

function expectAbsent(files: string[], patterns: RegExp[]) {
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const pattern of patterns) {
      expect(source, `${path.relative(REPO_ROOT, file)} matches ${pattern}`).not.toMatch(pattern);
    }
  }
}

describe("architecture fitness — assignments module boundaries", () => {
  it("keeps Domain independent from Service, Booking, Dispatch, infrastructure, web, and persistence", () => {
    expectAbsent(sources(DOMAIN), [
      /modules\/services/,
      /modules\/bookings/,
      /modules\/dispatch/,
      /assignments\/infrastructure/,
      /@supabase|supabase-js/,
      /from\s+["']next/,
      /app\//,
      /components\//,
      /readFileSync|writeFileSync|JSON\.parse|JSON\.stringify/,
    ]);
  });

  it("allows Application to read Service Domain but not Service infrastructure", () => {
    const files = sources(APPLICATION);
    expectAbsent(files, [
      /services\/infrastructure/,
      /assignments\/infrastructure/,
      /@supabase|supabase-js/,
      /from\s+["']next/,
      /app\//,
      /components\//,
    ]);
    expect(readFileSync(path.join(APPLICATION, "create-assignment-for-ready-service.ts"), "utf8")).toMatch(/modules\/services/);
  });

  it("does not absorb pricing, offers, payments, ranking, tracking, Trip, or Dispatch", () => {
    expectAbsent(sources(ROOT), [
      /pricing-engine/i,
      /payment-provider/i,
      /\bOfferId\b|\bRanking\b/,
      /\bLatitude\b|\bLongitude\b|\bGps\b/,
      /\bTripId\b|\bDispatchId\b/,
    ]);
  });

  it("adds no Assignment runtime dependency", () => {
    const pkg = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(pkg.dependencies).not.toHaveProperty("uuid");
    expect(pkg.dependencies).not.toHaveProperty("immer");
  });
});
