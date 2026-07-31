import type { MembershipId, OrganizationId, TenantId, UserId } from "../domain/identifiers";
import type { OrganizationMembership } from "../domain/organization-membership";

export type OrganizationMembershipRepository = {
  findById(
    tenantId: TenantId,
    membershipId: MembershipId
  ): Promise<OrganizationMembership | null>;

  findByUserAndOrganization(
    tenantId: TenantId,
    userId: UserId,
    organizationId: OrganizationId
  ): Promise<OrganizationMembership | null>;

  findByUser(
    tenantId: TenantId,
    userId: UserId
  ): Promise<OrganizationMembership[]>;

  findByOrganization(
    tenantId: TenantId,
    organizationId: OrganizationId
  ): Promise<OrganizationMembership[]>;

  save(membership: OrganizationMembership): Promise<void>;
};
