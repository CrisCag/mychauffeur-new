import type { OrganizationId, TenantId } from "@/lib/modules/identity";
import { DomainValidationError } from "./errors";
import {
  isLifecycleStatus,
  type LifecycleStatus,
} from "./lifecycle-status";

export type Organization = {
  readonly id: OrganizationId;
  readonly tenantId: TenantId;
  readonly code: string;
  readonly legalName: string;
  readonly displayName: string;
  readonly status: LifecycleStatus;
  readonly countryCode: string;
  readonly defaultLocale: string;
  readonly defaultTimezone: string;
  readonly defaultCurrency: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type CreateOrganizationInput = {
  id: OrganizationId;
  tenantId: TenantId;
  code: string;
  legalName: string;
  displayName: string;
  status?: LifecycleStatus;
  countryCode: string;
  defaultLocale: string;
  defaultTimezone: string;
  defaultCurrency: string;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
};

function normalizeCode(code: string): string {
  const normalized = code.trim();
  if (!normalized) {
    throw new DomainValidationError("Organization code is required");
  }
  if (normalized.length > 64) {
    throw new DomainValidationError("Organization code is too long");
  }
  return normalized;
}

function normalizeRequiredName(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new DomainValidationError(`${field} is required`);
  }
  if (normalized.length > 200) {
    throw new DomainValidationError(`${field} is too long`);
  }
  return normalized;
}

function normalizeCountryCode(countryCode: string): string {
  const normalized = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    throw new DomainValidationError("countryCode must be ISO 3166-1 alpha-2");
  }
  return normalized;
}

function normalizeLocale(locale: string): string {
  const normalized = locale.trim();
  if (!normalized || normalized.length > 16) {
    throw new DomainValidationError("defaultLocale is invalid");
  }
  return normalized;
}

function normalizeTimezone(timezone: string): string {
  const normalized = timezone.trim();
  if (!normalized || normalized.length > 64) {
    throw new DomainValidationError("defaultTimezone is invalid");
  }
  return normalized;
}

function normalizeCurrency(currency: string): string {
  const normalized = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new DomainValidationError("defaultCurrency must be ISO 4217");
  }
  return normalized;
}

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 1) {
    throw new DomainValidationError(
      "Organization version must be a positive integer"
    );
  }
  return version;
}

export function createOrganization(input: CreateOrganizationInput): Organization {
  const now = input.createdAt ?? new Date();
  const status = input.status ?? "ACTIVE";
  if (!isLifecycleStatus(status)) {
    throw new DomainValidationError("Invalid Organization status");
  }

  return Object.freeze({
    id: input.id,
    tenantId: input.tenantId,
    code: normalizeCode(input.code),
    legalName: normalizeRequiredName(input.legalName, "legalName"),
    displayName: normalizeRequiredName(input.displayName, "displayName"),
    status,
    countryCode: normalizeCountryCode(input.countryCode),
    defaultLocale: normalizeLocale(input.defaultLocale),
    defaultTimezone: normalizeTimezone(input.defaultTimezone),
    defaultCurrency: normalizeCurrency(input.defaultCurrency),
    createdAt: now,
    updatedAt: input.updatedAt ?? now,
    version: assertVersion(input.version ?? 1),
  });
}

export type OrganizationUpdatePatch = {
  legalName?: string;
  displayName?: string;
  status?: LifecycleStatus;
  countryCode?: string;
  defaultLocale?: string;
  defaultTimezone?: string;
  defaultCurrency?: string;
  updatedAt?: Date;
};

/** Returns a new Organization with version incremented. */
export function updateOrganization(
  organization: Organization,
  patch: OrganizationUpdatePatch
): Organization {
  if (patch.status !== undefined && !isLifecycleStatus(patch.status)) {
    throw new DomainValidationError("Invalid Organization status");
  }

  return Object.freeze({
    ...organization,
    legalName:
      patch.legalName !== undefined
        ? normalizeRequiredName(patch.legalName, "legalName")
        : organization.legalName,
    displayName:
      patch.displayName !== undefined
        ? normalizeRequiredName(patch.displayName, "displayName")
        : organization.displayName,
    status: patch.status ?? organization.status,
    countryCode:
      patch.countryCode !== undefined
        ? normalizeCountryCode(patch.countryCode)
        : organization.countryCode,
    defaultLocale:
      patch.defaultLocale !== undefined
        ? normalizeLocale(patch.defaultLocale)
        : organization.defaultLocale,
    defaultTimezone:
      patch.defaultTimezone !== undefined
        ? normalizeTimezone(patch.defaultTimezone)
        : organization.defaultTimezone,
    defaultCurrency:
      patch.defaultCurrency !== undefined
        ? normalizeCurrency(patch.defaultCurrency)
        : organization.defaultCurrency,
    updatedAt: patch.updatedAt ?? new Date(),
    version: assertVersion(organization.version + 1),
  });
}
