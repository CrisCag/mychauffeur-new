import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO = path.resolve(__dirname, "../..");

function walkTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkTsFiles(full));
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function readDemoTreeSources(): string[] {
  return [
    ...walkTsFiles(path.join(REPO, "lib/demo")),
    ...walkTsFiles(path.join(REPO, "components/demo")),
    ...walkTsFiles(path.join(REPO, "app/[locale]/demo")),
  ].map((f) => readFileSync(f, "utf8"));
}

describe("Founder Demo — production gate (static)", () => {
  it("demo layout and pages gate on isDemoEnvironmentAllowed / notFound", () => {
    const layout = readFileSync(
      path.join(REPO, "app/[locale]/demo/layout.tsx"),
      "utf8"
    );
    const page = readFileSync(
      path.join(REPO, "app/[locale]/demo/page.tsx"),
      "utf8"
    );
    const ops = readFileSync(
      path.join(REPO, "app/[locale]/demo/ops/page.tsx"),
      "utf8"
    );
    const detail = readFileSync(
      path.join(REPO, "app/[locale]/demo/ops/bookings/[id]/page.tsx"),
      "utf8"
    );
    expect(layout).toMatch(/isDemoEnvironmentAllowed/);
    expect(layout).toMatch(/notFound/);
    expect(layout).toMatch(/noindex|robots/);
    expect(page).toMatch(/isDemoEnvironmentAllowed/);
    expect(ops).toMatch(/isDemoEnvironmentAllowed/);
    expect(detail).toMatch(/isDemoEnvironmentAllowed/);
  });

  it("gate is NODE_ENV-based and not bypassable via query string", () => {
    const gate = readFileSync(path.join(REPO, "lib/demo/index.ts"), "utf8");
    const layout = readFileSync(
      path.join(REPO, "app/[locale]/demo/layout.tsx"),
      "utf8"
    );
    const actions = readFileSync(
      path.join(REPO, "lib/demo/actions.ts"),
      "utf8"
    );
    expect(gate).toMatch(/NODE_ENV\s*!==\s*["']production["']/);
    expect(gate).not.toMatch(/searchParams|query|URLSearchParams/);
    expect(layout).not.toMatch(/searchParams|query|URLSearchParams/);
    expect(actions).toMatch(/requireDemo/);
    expect(actions).toMatch(/isDemoEnvironmentAllowed/);
    expect(actions.match(/requireDemo\(\)/g)?.length).toBeGreaterThanOrEqual(7);
  });

  it("does not modify legacy booking API or book page", () => {
    const actions = readFileSync(
      path.join(REPO, "lib/demo/actions.ts"),
      "utf8"
    );
    expect(actions).not.toMatch(/booking-requests|trip-ops-store|\/api\/booking/);
  });

  it("demo tree avoids providers, Supabase, runtime JSON, and client secrets", () => {
    const sources = readDemoTreeSources().join("\n");
    expect(sources).not.toMatch(
      /createClient|@supabase|supabase-js|service_role|sk_live|sk_test/i
    );
    expect(sources).not.toMatch(
      /localStorage|sessionStorage|writeFileSync|writeFile\(|fs\.promises\.write/i
    );
    expect(sources).not.toMatch(
      /booking-requests\.json|operational-trips\.json|trip-ops-store/i
    );
    expect(sources).not.toMatch(
      /nodemailer|twilio|whatsapp|stripe|googleapis|places-autocomplete/i
    );
    expect(sources).not.toMatch(/NEXT_PUBLIC_.*(SECRET|KEY|TOKEN|PASSWORD)/i);
  });

  it("Foundation Domain modules never import the Demo", () => {
    const moduleRoot = path.join(REPO, "lib/modules");
    for (const file of walkTsFiles(moduleRoot)) {
      const src = readFileSync(file, "utf8");
      expect(src).not.toMatch(/@\/lib\/demo|@\/components\/demo|lib\/demo\//);
    }
  });

  it("banner and flow keep demo disclaimers", () => {
    const banner = readFileSync(
      path.join(REPO, "components/demo/demo-banner.tsx"),
      "utf8"
    );
    const labels = readFileSync(
      path.join(REPO, "lib/demo/labels.ts"),
      "utf8"
    );
    const flow = readFileSync(
      path.join(REPO, "components/demo/demo-flow-client.tsx"),
      "utf8"
    );
    expect(banner).toMatch(/DEMO LOCALE/);
    expect(banner).toMatch(/Dati fittizi/);
    expect(banner).toMatch(/Prezzi dimostrativi e non vincolanti/);
    expect(labels).toMatch(/Il tuo transfer privato/);
    expect(flow).toMatch(/DEMO_ESSENTIAL_COPY/);
  });
});
