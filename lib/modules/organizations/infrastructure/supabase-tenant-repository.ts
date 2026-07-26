import type { SupabaseClient } from "@supabase/supabase-js";
import type { TenantId } from "@/lib/modules/identity";
import type { TenantRepository } from "../application/tenant-repository";
import { DuplicateCodeError, PersistenceError } from "../domain/errors";
import type { Tenant } from "../domain/tenant";
import {
  TENANT_COLUMNS,
  tenantFromRow,
  tenantToRow,
  type TenantRow,
} from "./tenant-mapper";

/**
 * Server-side Supabase adapter for TenantRepository.
 * Client is injected — no env reads, no global singleton.
 */
export class SupabaseTenantRepository implements TenantRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: TenantId): Promise<Tenant | null> {
    const { data, error } = await this.client
      .from("tenants")
      .select(TENANT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new PersistenceError();
    }
    if (!data) {
      return null;
    }
    return tenantFromRow(data as TenantRow);
  }

  async findByCode(code: string): Promise<Tenant | null> {
    const { data, error } = await this.client
      .from("tenants")
      .select(TENANT_COLUMNS)
      .eq("code", code.trim())
      .maybeSingle();

    if (error) {
      throw new PersistenceError();
    }
    if (!data) {
      return null;
    }
    return tenantFromRow(data as TenantRow);
  }

  async save(tenant: Tenant): Promise<void> {
    const row = tenantToRow(tenant);
    const { error } = await this.client.from("tenants").upsert(row, {
      onConflict: "id",
    });

    if (error) {
      if (error.code === "23505") {
        throw new DuplicateCodeError();
      }
      throw new PersistenceError();
    }
  }
}
