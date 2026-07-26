import type { TenantId } from "@/lib/modules/identity";
import { DomainValidationError } from "./errors";
import {
  isLifecycleStatus,
  type LifecycleStatus,
} from "./lifecycle-status";

export type Tenant = {
  readonly id: TenantId;
  readonly code: string;
  readonly displayName: string;
  readonly status: LifecycleStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type CreateTenantInput = {
  id: TenantId;
  code: string;
  displayName: string;
  status?: LifecycleStatus;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
};

function normalizeCode(code: string): string {
  const normalized = code.trim();
  if (!normalized) {
    throw new DomainValidationError("Tenant code is required");
  }
  if (normalized.length > 64) {
    throw new DomainValidationError("Tenant code is too long");
  }
  return normalized;
}

function normalizeDisplayName(displayName: string): string {
  const normalized = displayName.trim();
  if (!normalized) {
    throw new DomainValidationError("Tenant displayName is required");
  }
  if (normalized.length > 200) {
    throw new DomainValidationError("Tenant displayName is too long");
  }
  return normalized;
}

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 1) {
    throw new DomainValidationError("Tenant version must be a positive integer");
  }
  return version;
}

export function createTenant(input: CreateTenantInput): Tenant {
  const now = input.createdAt ?? new Date();
  const status = input.status ?? "ACTIVE";
  if (!isLifecycleStatus(status)) {
    throw new DomainValidationError("Invalid Tenant status");
  }

  return Object.freeze({
    id: input.id,
    code: normalizeCode(input.code),
    displayName: normalizeDisplayName(input.displayName),
    status,
    createdAt: now,
    updatedAt: input.updatedAt ?? now,
    version: assertVersion(input.version ?? 1),
  });
}

export type TenantUpdatePatch = {
  displayName?: string;
  status?: LifecycleStatus;
  updatedAt?: Date;
};

/** Returns a new Tenant with version incremented (optimistic concurrency readiness). */
export function updateTenant(tenant: Tenant, patch: TenantUpdatePatch): Tenant {
  if (patch.status !== undefined && !isLifecycleStatus(patch.status)) {
    throw new DomainValidationError("Invalid Tenant status");
  }

  return Object.freeze({
    ...tenant,
    displayName:
      patch.displayName !== undefined
        ? normalizeDisplayName(patch.displayName)
        : tenant.displayName,
    status: patch.status ?? tenant.status,
    updatedAt: patch.updatedAt ?? new Date(),
    version: assertVersion(tenant.version + 1),
  });
}
