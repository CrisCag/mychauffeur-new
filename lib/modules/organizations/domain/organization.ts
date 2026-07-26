import type { OrganizationId, TenantId } from "@/lib/modules/identity";

/** Minimal Organization placeholder — Aggregate not fully modeled yet. */
export type Organization = {
  id: OrganizationId;
  tenantId: TenantId;
};
