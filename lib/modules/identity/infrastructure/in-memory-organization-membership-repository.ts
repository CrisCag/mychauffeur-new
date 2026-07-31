import type {
  MembershipId,
  OrganizationId,
  TenantId,
  UserId,
} from "../domain/identifiers";
import { DuplicateMembershipError } from "../domain/errors";
import type { OrganizationMembership } from "../domain/organization-membership";
import type { OrganizationMembershipRepository } from "../application/organization-membership-repository";

/** In-memory OrganizationMembershipRepository — not for production. */
export class InMemoryOrganizationMembershipRepository
  implements OrganizationMembershipRepository
{
  private readonly byKey = new Map<string, OrganizationMembership>();

  private key(tenantId: TenantId, membershipId: MembershipId): string {
    return `${tenantId}::${membershipId}`;
  }

  async findById(
    tenantId: TenantId,
    membershipId: MembershipId
  ): Promise<OrganizationMembership | null> {
    const found = this.byKey.get(this.key(tenantId, membershipId));
    if (!found || found.tenantId !== tenantId) {
      return null;
    }
    return found;
  }

  async findByUserAndOrganization(
    tenantId: TenantId,
    userId: UserId,
    organizationId: OrganizationId
  ): Promise<OrganizationMembership | null> {
    for (const membership of this.byKey.values()) {
      if (
        membership.tenantId === tenantId &&
        membership.userId === userId &&
        membership.organizationId === organizationId
      ) {
        return membership;
      }
    }
    return null;
  }

  async findByUser(
    tenantId: TenantId,
    userId: UserId
  ): Promise<OrganizationMembership[]> {
    return [...this.byKey.values()]
      .filter(
        (membership) =>
          membership.tenantId === tenantId && membership.userId === userId
      )
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async findByOrganization(
    tenantId: TenantId,
    organizationId: OrganizationId
  ): Promise<OrganizationMembership[]> {
    return [...this.byKey.values()]
      .filter(
        (membership) =>
          membership.tenantId === tenantId &&
          membership.organizationId === organizationId
      )
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async save(membership: OrganizationMembership): Promise<void> {
    const duplicate = await this.findByUserAndOrganization(
      membership.tenantId,
      membership.userId,
      membership.organizationId
    );
    if (duplicate && duplicate.id !== membership.id) {
      throw new DuplicateMembershipError();
    }

    for (const [mapKey, value] of this.byKey.entries()) {
      if (value.id === membership.id) {
        this.byKey.delete(mapKey);
      }
    }

    this.byKey.set(
      this.key(membership.tenantId, membership.id),
      membership
    );
  }
}
