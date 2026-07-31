import type { OrganizationId, RoleId, TenantId } from "./identifiers";
import { DomainValidationError } from "./errors";
import { isRoleStatus, type RoleStatus } from "./role-status";

export type Role = {
  readonly id: RoleId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId | null;
  readonly code: string;
  readonly displayName: string;
  readonly description?: string;
  readonly status: RoleStatus;
  readonly isSystemRole: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type CreateRoleInput = {
  id: RoleId;
  tenantId: TenantId;
  organizationId?: OrganizationId | null;
  code: string;
  displayName: string;
  description?: string;
  status?: RoleStatus;
  isSystemRole?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
};

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 1) {
    throw new DomainValidationError("Role version must be a positive integer");
  }
  return version;
}

function assertRequiredId(value: string | undefined, field: string): void {
  if (value === undefined || value.trim().length === 0) {
    throw new DomainValidationError(`${field} is required`);
  }
}

/**
 * Normalizes Role code. No special-cased role names (OWNER, DRIVER, …).
 */
export function normalizeRoleCode(code: string): string {
  const normalized = code.trim().toLowerCase();
  if (!normalized) {
    throw new DomainValidationError("Role code is required");
  }
  if (normalized.length > 64) {
    throw new DomainValidationError("Role code is too long");
  }
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(normalized)) {
    throw new DomainValidationError("Role code format is invalid");
  }
  return normalized;
}

function normalizeDisplayName(displayName: string): string {
  const normalized = displayName.trim();
  if (!normalized) {
    throw new DomainValidationError("Role displayName is required");
  }
  if (normalized.length > 200) {
    throw new DomainValidationError("Role displayName is too long");
  }
  return normalized;
}

function normalizeDescription(
  description: string | undefined
): string | undefined {
  if (description === undefined) {
    return undefined;
  }
  const normalized = description.trim();
  if (!normalized) {
    throw new DomainValidationError("Role description must not be blank");
  }
  if (normalized.length > 500) {
    throw new DomainValidationError("Role description is too long");
  }
  return normalized;
}

export function createRole(input: CreateRoleInput): Role {
  assertRequiredId(input.id, "id");
  assertRequiredId(input.tenantId, "tenantId");

  const organizationId =
    input.organizationId === undefined ? null : input.organizationId;
  if (organizationId !== null) {
    assertRequiredId(organizationId, "organizationId");
  }

  const status = input.status ?? "ACTIVE";
  if (!isRoleStatus(status)) {
    throw new DomainValidationError("Invalid Role status");
  }

  const description = normalizeDescription(input.description);
  const now = input.createdAt ?? new Date();

  return Object.freeze({
    id: input.id,
    tenantId: input.tenantId,
    organizationId,
    code: normalizeRoleCode(input.code),
    displayName: normalizeDisplayName(input.displayName),
    ...(description !== undefined ? { description } : {}),
    status,
    isSystemRole: input.isSystemRole ?? false,
    createdAt: now,
    updatedAt: input.updatedAt ?? now,
    version: assertVersion(input.version ?? 1),
  });
}
