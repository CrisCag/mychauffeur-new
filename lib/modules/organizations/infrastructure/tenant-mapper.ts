import { asTenantId } from "@/lib/modules/identity";
import { PersistenceError } from "../domain/errors";
import { isLifecycleStatus } from "../domain/lifecycle-status";
import { createTenant, type Tenant } from "../domain/tenant";

export const TENANT_COLUMNS =
  "id, code, display_name, status, version, created_at, updated_at" as const;

export type TenantRow = {
  id: string;
  code: string;
  display_name: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
};

export function tenantToRow(tenant: Tenant): TenantRow {
  return {
    id: tenant.id,
    code: tenant.code,
    display_name: tenant.displayName,
    status: tenant.status,
    version: tenant.version,
    created_at: tenant.createdAt.toISOString(),
    updated_at: tenant.updatedAt.toISOString(),
  };
}

export function tenantFromRow(row: TenantRow): Tenant {
  if (!isLifecycleStatus(row.status)) {
    throw new PersistenceError("Invalid persisted Tenant status");
  }
  return createTenant({
    id: asTenantId(row.id),
    code: row.code,
    displayName: row.display_name,
    status: row.status,
    version: row.version,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}
