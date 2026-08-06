/**
 * Founder Demo Vertical Slice 1 — process-local in-memory composition.
 *
 * Store characteristics (explicit limitations):
 * - process-local only (not shared across Node processes / serverless instances)
 * - resets on process restart
 * - NOT multi-process safe
 * - NOT production-ready persistence
 * - NEVER used when NODE_ENV === "production"
 *
 * Hot-reload: development may pin the store on globalThis under a typed key
 * so Next HMR does not create duplicate in-memory repositories mid-session.
 * Domain modules never depend on globalThis.
 */

export const DEMO_TENANT_ID =
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as const;
export const DEMO_ORGANIZATION_ID =
  "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" as const;
export const DEMO_ACTOR_ID =
  "cccccccc-cccc-4ccc-8ccc-cccccccccccc" as const;

/** Opaque globalThis key — development demo only. */
export const DEMO_STORE_GLOBAL_KEY = "__mychauffeur_founder_demo_store_v1__" as const;

export const DEMO_READ_MODEL_DEFAULT_LIMIT = 20;
export const DEMO_READ_MODEL_MAX_LIMIT = 50;

export const DEMO_PRICING_VERSION = "demo-fixture-v1";
