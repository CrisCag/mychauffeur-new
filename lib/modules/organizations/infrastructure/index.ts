/**
 * Infrastructure entry point for organizations module.
 * Explicit and separate from the Domain public contract.
 * Adapters are server-side / test-only — do not import from UI.
 */

export { SupabaseTenantRepository } from "./supabase-tenant-repository";
export { SupabaseOrganizationRepository } from "./supabase-organization-repository";
export { InMemoryTenantRepository } from "./in-memory-tenant-repository";
export { InMemoryOrganizationRepository } from "./in-memory-organization-repository";
