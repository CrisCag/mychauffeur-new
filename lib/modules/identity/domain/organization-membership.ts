import type {
  MembershipId,
  OrganizationId,
  TenantId,
  UserId,
} from "./identifiers";
import { DomainValidationError } from "./errors";
import {
  isMembershipStatus,
  type MembershipStatus,
} from "./membership-status";

export type OrganizationMembership = {
  readonly id: MembershipId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly userId: UserId;
  readonly status: MembershipStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type CreateOrganizationMembershipInput = {
  id: MembershipId;
  tenantId: TenantId;
  organizationId: OrganizationId;
  userId: UserId;
  status?: MembershipStatus;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
};

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 1) {
    throw new DomainValidationError(
      "OrganizationMembership version must be a positive integer"
    );
  }
  return version;
}

function assertRequiredId(value: string | undefined, field: string): void {
  if (value === undefined || value.trim().length === 0) {
    throw new DomainValidationError(`${field} is required`);
  }
}

export function createOrganizationMembership(
  input: CreateOrganizationMembershipInput
): OrganizationMembership {
  assertRequiredId(input.tenantId, "tenantId");
  assertRequiredId(input.organizationId, "organizationId");
  assertRequiredId(input.userId, "userId");
  assertRequiredId(input.id, "id");

  const status = input.status ?? "ACTIVE";
  if (!isMembershipStatus(status)) {
    throw new DomainValidationError("Invalid OrganizationMembership status");
  }

  const now = input.createdAt ?? new Date();

  return Object.freeze({
    id: input.id,
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    userId: input.userId,
    status,
    createdAt: now,
    updatedAt: input.updatedAt ?? now,
    version: assertVersion(input.version ?? 1),
  });
}

export function updateOrganizationMembershipStatus(
  membership: OrganizationMembership,
  status: MembershipStatus,
  updatedAt?: Date
): OrganizationMembership {
  if (!isMembershipStatus(status)) {
    throw new DomainValidationError("Invalid OrganizationMembership status");
  }

  return Object.freeze({
    ...membership,
    status,
    updatedAt: updatedAt ?? new Date(),
    version: assertVersion(membership.version + 1),
  });
}
