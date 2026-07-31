import type { PermissionId } from "./identifiers";
import { DomainValidationError } from "./errors";
import {
  isPermissionStatus,
  type PermissionStatus,
} from "./permission-status";

export type Permission = {
  readonly id: PermissionId;
  readonly code: string;
  readonly resource: string;
  readonly action: string;
  readonly description?: string;
  readonly status: PermissionStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type CreatePermissionInput = {
  id: PermissionId;
  resource: string;
  action: string;
  /** If omitted, derived as `resource.action` after normalization. */
  code?: string;
  description?: string;
  status?: PermissionStatus;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
};

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 1) {
    throw new DomainValidationError(
      "Permission version must be a positive integer"
    );
  }
  return version;
}

function assertRequiredId(value: string | undefined, field: string): void {
  if (value === undefined || value.trim().length === 0) {
    throw new DomainValidationError(`${field} is required`);
  }
}

function normalizeSegment(value: string, field: string): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    throw new DomainValidationError(`${field} is required`);
  }
  if (normalized.length > 64) {
    throw new DomainValidationError(`${field} is too long`);
  }
  if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(normalized)) {
    throw new DomainValidationError(`${field} format is invalid`);
  }
  return normalized;
}

/**
 * Permission code convention: `resource.action` (no wildcards).
 */
export function buildPermissionCode(resource: string, action: string): string {
  return `${normalizeSegment(resource, "resource")}.${normalizeSegment(action, "action")}`;
}

export function normalizePermissionCode(code: string): string {
  const normalized = code.trim().toLowerCase();
  if (!normalized) {
    throw new DomainValidationError("Permission code is required");
  }
  if (normalized.includes("*")) {
    throw new DomainValidationError("Permission wildcards are not allowed");
  }
  const parts = normalized.split(".");
  if (parts.length !== 2) {
    throw new DomainValidationError(
      "Permission code must follow resource.action"
    );
  }
  return buildPermissionCode(parts[0], parts[1]);
}

function normalizeDescription(
  description: string | undefined
): string | undefined {
  if (description === undefined) {
    return undefined;
  }
  const normalized = description.trim();
  if (!normalized) {
    throw new DomainValidationError("Permission description must not be blank");
  }
  if (normalized.length > 500) {
    throw new DomainValidationError("Permission description is too long");
  }
  return normalized;
}

export function createPermission(input: CreatePermissionInput): Permission {
  assertRequiredId(input.id, "id");

  const resource = normalizeSegment(input.resource, "resource");
  const action = normalizeSegment(input.action, "action");
  const derivedCode = buildPermissionCode(resource, action);

  const code =
    input.code !== undefined
      ? normalizePermissionCode(input.code)
      : derivedCode;

  if (code !== derivedCode) {
    throw new DomainValidationError(
      "Permission code must equal resource.action"
    );
  }

  const status = input.status ?? "ACTIVE";
  if (!isPermissionStatus(status)) {
    throw new DomainValidationError("Invalid Permission status");
  }

  const description = normalizeDescription(input.description);
  const now = input.createdAt ?? new Date();

  return Object.freeze({
    id: input.id,
    code,
    resource,
    action,
    ...(description !== undefined ? { description } : {}),
    status,
    createdAt: now,
    updatedAt: input.updatedAt ?? now,
    version: assertVersion(input.version ?? 1),
  });
}
