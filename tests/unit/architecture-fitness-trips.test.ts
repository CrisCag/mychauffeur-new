import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const ROOT = path.join(REPO_ROOT, "lib/modules/trips");
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

describe("architecture fitness — trips module boundaries", () => {
  it("keeps Trip Domain independent from Assignment, Service, Booking, infrastructure, and web", () => {
    expectAbsent(sources(DOMAIN), [
      /modules\/assignments/,
      /modules\/services/,
      /modules\/bookings/,
      /trips\/infrastructure/,
      /@supabase|supabase-js/,
      /from\s+["']next/,
      /app\//,
      /components\//,
      /readFileSync|writeFileSync|JSON\.parse|JSON\.stringify/,
    ]);
  });

  it("allows Application to read Assignment Domain but not its infrastructure", () => {
    const files = sources(APPLICATION);
    expectAbsent(files, [
      /assignments\/infrastructure/,
      /trips\/infrastructure/,
      /@supabase|supabase-js/,
      /from\s+["']next/,
      /app\//,
      /components\//,
    ]);
    expect(readFileSync(path.join(APPLICATION, "create-trip-for-confirmed-assignment.ts"), "utf8")).toMatch(/modules\/assignments/);
  });

  it("does not absorb GPS, pricing, payment, evidence, recovery, or dispatch ranking", () => {
    expectAbsent(sources(ROOT), [
      /pricing-engine/i,
      /payment-provider/i,
      /\bLatitude\b|\bLongitude\b|\bGps\b/,
      /\bEvidenceId\b|\bAttachmentId\b/,
      /\bRankingSnapshot\b|\bDispatchRequest\b|\bRecoveryCase\b/,
    ]);
  });

  it("adds no Trip runtime dependency", () => {
    const pkg = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(pkg.dependencies).not.toHaveProperty("uuid");
    expect(pkg.dependencies).not.toHaveProperty("xstate");
  });
});
