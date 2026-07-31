import type {
  ActorId,
  MembershipId,
  RoleId,
  TenantId,
} from "../domain/identifiers";

export type MembershipRoleRepository = {
  findRoleIdsByMembership(
    tenantId: TenantId,
    membershipId: MembershipId
  ): Promise<RoleId[]>;

  assign(
    tenantId: TenantId,
    membershipId: MembershipId,
    roleId: RoleId,
    actorId?: ActorId
  ): Promise<void>;

  revoke(
    tenantId: TenantId,
    membershipId: MembershipId,
    roleId: RoleId
  ): Promise<void>;
};
