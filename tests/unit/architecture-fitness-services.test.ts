import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const SERVICES_DOMAIN = path.join(REPO_ROOT, "lib/modules/services/domain");
const SERVICES_APPLICATION = path.join(
  REPO_ROOT,
  "lib/modules/services/application"
);
const SERVICES_ROOT = path.join(REPO_ROOT, "lib/modules/services");
const SERVICES_INFRA = path.join(
  REPO_ROOT,
  "lib/modules/services/infrastructure"
);

function listSourceFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...listSourceFiles(full));
      continue;
    }
    if (/\.ts$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function assertNoForbiddenImports(files: string[], forbidden: RegExp[]) {
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const pattern of forbidden) {
      expect(
        source,
        `${path.relative(REPO_ROOT, file)} matches ${pattern}`
      ).not.toMatch(pattern);
    }
  }
}

describe("architecture fitness — services module boundaries", () => {
  it("lives under lib/modules/services", () => {
    expect(statSync(SERVICES_ROOT).isDirectory()).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, "lib/modules/service"))).toBe(false);
  });

  it("Domain does not import bookings, infrastructure, Supabase, Next, API, or UI", () => {
    const files = listSourceFiles(SERVICES_DOMAIN);
    assertNoForbiddenImports(files, [
      /modules\/bookings/,
      /services\/infrastructure/,
      /@supabase/,
      /supabase-js/,
      /from\s+["']next/,
      /from\s+["']next\//,
      /app\//,
      /components\//,
      /trip-ops-store/,
      /booking-requests/,
    ]);
  });

  it("Application may depend on bookings ports but not Booking infrastructure, Next, or Supabase", () => {
    const files = listSourceFiles(SERVICES_APPLICATION);
    assertNoForbiddenImports(files, [
      /services\/infrastructure/,
      /bookings\/infrastructure/,
      /@supabase/,
      /supabase-js/,
      /from\s+["']next/,
      /from\s+["']next\//,
      /app\//,
      /components\//,
    ]);
    const generate = readFileSync(
      path.join(
        SERVICES_APPLICATION,
        "generate-service-from-confirmed-booking.ts"
      ),
      "utf8"
    );
    expect(generate).toMatch(/modules\/bookings/);
    expect(generate).not.toMatch(/bookings\/infrastructure/);
  });

  it("public package does not re-export Domain create factory", () => {
    const index = readFileSync(path.join(SERVICES_ROOT, "index.ts"), "utf8");
    expect(index).not.toMatch(
      /export\s*\{[^}]*createServiceFromConfirmedBooking/
    );
  });

  it("Domain has no Driver/Vehicle/Partner/Assignment/Dispatch/Trip/Pricing/Payment and no findAll/runtime JSON", () => {
    const files = [
      ...listSourceFiles(SERVICES_DOMAIN),
      ...listSourceFiles(SERVICES_APPLICATION),
      ...listSourceFiles(SERVICES_INFRA),
    ];
    assertNoForbiddenImports(files, [
      /\bfindAll\b/,
      /\bDriverId\b/,
      /\bVehicleId\b/,
      /\bPartnerId\b/,
      /\bAssignmentId\b/,
      /\bDispatch\b/,
      /\bTripId\b/,
      /pricing-engine/i,
      /payment-provider/i,
      /readFileSync/,
      /writeFileSync/,
      /JSON\.parse/,
      /JSON\.stringify/,
      /\bFCO\b/,
      /Umbria/i,
      /["']COMPLETED["']/,
      /["']ASSIGNED["']/,
      /["']IN_PROGRESS["']/,
      /["']CUSTOM["']/,
    ]);
  });

  it("package.json has no new runtime dependency for services step", () => {
    const pkg = JSON.parse(
      readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")
    ) as { dependencies: Record<string, string> };
    expect(pkg.dependencies).not.toHaveProperty("uuid");
    expect(pkg.dependencies).not.toHaveProperty("@googlemaps/google-maps-services-js");
  });
});
