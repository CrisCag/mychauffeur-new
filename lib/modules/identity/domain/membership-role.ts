import type { ActorId, MembershipId, RoleId } from "./identifiers";
import { AuthorizationScopeError } from "./errors";
import type { OrganizationMembership } from "./organization-membership";
import type { Role } from "./role";

export type MembershipRole = {
  readonly membershipId: MembershipId;
  readonly roleId: RoleId;
  readonly assignedAt: Date;
  readonly assignedByActorId?: ActorId;
};

export type CreateMembershipRoleInput = {
  membershipId: MembershipId;
  roleId: RoleId;
  assignedAt?: Date;
  assignedByActorId?: ActorId;
};

export function createMembershipRole(
  input: CreateMembershipRoleInput
): MembershipRole {
  return Object.freeze({
    membershipId: input.membershipId,
    roleId: input.roleId,
    assignedAt: input.assignedAt ?? new Date(),
    ...(input.assignedByActorId !== undefined
      ? { assignedByActorId: input.assignedByActorId }
      : {}),
  });
}

/**
 * Validates tenant/organization scope before assigning a Role to a Membership.
 * Tenant-level roles (organizationId null) are assignable within the same tenant.
 * Organization-level roles require the same organization.
 */
export function assignRoleToMembership(
  membership: OrganizationMembership,
  role: Role,
  options?: { assignedAt?: Date; assignedByActorId?: ActorId }
): MembershipRole {
  if (role.tenantId !== membership.tenantId) {
    throw new AuthorizationScopeError(
      "Role cannot be assigned across tenants"
    );
  }
  if (
    role.organizationId !== null &&
    role.organizationId !== membership.organizationId
  ) {
    throw new AuthorizationScopeError(
      "Organization-level Role cannot be assigned to a different Organization"
    );
  }

  return createMembershipRole({
    membershipId: membership.id,
    roleId: role.id,
    assignedAt: options?.assignedAt,
    assignedByActorId: options?.assignedByActorId,
  });
}
