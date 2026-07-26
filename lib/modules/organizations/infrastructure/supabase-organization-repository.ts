import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import type { OrganizationRepository } from "../application/organization-repository";
import {
  DuplicateCodeError,
  PersistenceError,
  TenantScopeMismatchError,
} from "../domain/errors";
import type { Organization } from "../domain/organization";
import {
  ORGANIZATION_COLUMNS,
  organizationFromRow,
  organizationToRow,
  type OrganizationRow,
} from "./organization-mapper";

/**
 * Server-side Supabase adapter for OrganizationRepository.
 * Every query is tenant-scoped. Client is injected.
 */
export class SupabaseOrganizationRepository implements OrganizationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(
    tenantId: TenantId,
    id: OrganizationId
  ): Promise<Organization | null> {
    const { data, error } = await this.client
      .from("organizations")
      .select(ORGANIZATION_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new PersistenceError();
    }
    if (!data) {
      return null;
    }
    return organizationFromRow(data as OrganizationRow);
  }

  async findByCode(
    tenantId: TenantId,
    code: string
  ): Promise<Organization | null> {
    const { data, error } = await this.client
      .from("organizations")
      .select(ORGANIZATION_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("code", code.trim())
      .maybeSingle();

    if (error) {
      throw new PersistenceError();
    }
    if (!data) {
      return null;
    }
    return organizationFromRow(data as OrganizationRow);
  }

  async findByTenant(tenantId: TenantId): Promise<Organization[]> {
    const { data, error } = await this.client
      .from("organizations")
      .select(ORGANIZATION_COLUMNS)
      .eq("tenant_id", tenantId)
      .order("code", { ascending: true });

    if (error) {
      throw new PersistenceError();
    }
    return (data as OrganizationRow[] | null)?.map(organizationFromRow) ?? [];
  }

  async save(tenantId: TenantId, organization: Organization): Promise<void> {
    if (organization.tenantId !== tenantId) {
      throw new TenantScopeMismatchError();
    }

    const row = organizationToRow(organization);
    const { error } = await this.client.from("organizations").upsert(row, {
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
