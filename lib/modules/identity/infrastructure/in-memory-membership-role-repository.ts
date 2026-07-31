import type {
  ActorId,
  MembershipId,
  RoleId,
  TenantId,
} from "../domain/identifiers";
import { AuthorizationScopeError } from "../domain/errors";
import { assignRoleToMembership } from "../domain/membership-role";
import type { MembershipRole } from "../domain/membership-role";
import type { MembershipRoleRepository } from "../application/membership-role-repository";
import type { OrganizationMembershipRepository } from "../application/organization-membership-repository";
import type { RoleRepository } from "../application/role-repository";

/** In-memory MembershipRoleRepository — not for production. */
export class InMemoryMembershipRoleRepository
  implements MembershipRoleRepository
{
  private readonly assignments = new Map<string, MembershipRole>();

  constructor(
    private readonly memberships: OrganizationMembershipRepository,
    private readonly roles: RoleRepository
  ) {}

  private key(membershipId: MembershipId, roleId: RoleId): string {
    return `${membershipId}::${roleId}`;
  }

  async findRoleIdsByMembership(
    tenantId: TenantId,
    membershipId: MembershipId
  ): Promise<RoleId[]> {
    const membership = await this.memberships.findById(tenantId, membershipId);
    if (!membership) {
      return [];
    }

    const roleIds: RoleId[] = [];
    for (const assignment of this.assignments.values()) {
      if (assignment.membershipId !== membershipId) {
        continue;
      }
      const role = await this.roles.findById(tenantId, assignment.roleId);
      if (role) {
        roleIds.push(assignment.roleId);
      }
    }
    return roleIds.sort((a, b) => a.localeCompare(b));
  }

  async assign(
    tenantId: TenantId,
    membershipId: MembershipId,
    roleId: RoleId,
    actorId?: ActorId
  ): Promise<void> {
    const membership = await this.memberships.findById(tenantId, membershipId);
    if (!membership) {
      throw new AuthorizationScopeError("Membership not found in tenant");
    }

    const role = await this.roles.findById(tenantId, roleId);
    if (!role) {
      throw new AuthorizationScopeError("Role not found in tenant");
    }

    const assignment = assignRoleToMembership(membership, role, {
      assignedByActorId: actorId,
    });
    this.assignments.set(
      this.key(membershipId, roleId),
      assignment
    );
  }

  async revoke(
    tenantId: TenantId,
    membershipId: MembershipId,
    roleId: RoleId
  ): Promise<void> {
    const membership = await this.memberships.findById(tenantId, membershipId);
    if (!membership) {
      return;
    }
    this.assignments.delete(this.key(membershipId, roleId));
  }
}
