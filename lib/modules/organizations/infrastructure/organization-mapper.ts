import { asOrganizationId, asTenantId } from "@/lib/modules/identity";
import { PersistenceError } from "../domain/errors";
import { isLifecycleStatus } from "../domain/lifecycle-status";
import {
  createOrganization,
  type Organization,
} from "../domain/organization";

export const ORGANIZATION_COLUMNS =
  "id, tenant_id, code, legal_name, display_name, status, country_code, default_locale, default_timezone, default_currency, version, created_at, updated_at" as const;

export type OrganizationRow = {
  id: string;
  tenant_id: string;
  code: string;
  legal_name: string;
  display_name: string;
  status: string;
  country_code: string;
  default_locale: string;
  default_timezone: string;
  default_currency: string;
  version: number;
  created_at: string;
  updated_at: string;
};

export function organizationToRow(organization: Organization): OrganizationRow {
  return {
    id: organization.id,
    tenant_id: organization.tenantId,
    code: organization.code,
    legal_name: organization.legalName,
    display_name: organization.displayName,
    status: organization.status,
    country_code: organization.countryCode,
    default_locale: organization.defaultLocale,
    default_timezone: organization.defaultTimezone,
    default_currency: organization.defaultCurrency,
    version: organization.version,
    created_at: organization.createdAt.toISOString(),
    updated_at: organization.updatedAt.toISOString(),
  };
}

export function organizationFromRow(row: OrganizationRow): Organization {
  if (!isLifecycleStatus(row.status)) {
    throw new PersistenceError("Invalid persisted Organization status");
  }
  return createOrganization({
    id: asOrganizationId(row.id),
    tenantId: asTenantId(row.tenant_id),
    code: row.code,
    legalName: row.legal_name,
    displayName: row.display_name,
    status: row.status,
    countryCode: row.country_code,
    defaultLocale: row.default_locale,
    defaultTimezone: row.default_timezone,
    defaultCurrency: row.default_currency,
    version: row.version,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}
