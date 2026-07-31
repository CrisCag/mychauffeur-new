/**
 * Nominal (branded) identifier types for OS Foundation.
 * No ID generation; UUID vs ULID remains OPEN.
 */

declare const tenantIdBrand: unique symbol;
declare const organizationIdBrand: unique symbol;
declare const personIdBrand: unique symbol;
declare const userIdBrand: unique symbol;
declare const actorIdBrand: unique symbol;
declare const membershipIdBrand: unique symbol;
declare const roleIdBrand: unique symbol;
declare const permissionIdBrand: unique symbol;

export type TenantId = string & { readonly [tenantIdBrand]: "TenantId" };
export type OrganizationId = string & {
  readonly [organizationIdBrand]: "OrganizationId";
};
export type PersonId = string & { readonly [personIdBrand]: "PersonId" };
export type UserId = string & { readonly [userIdBrand]: "UserId" };
export type ActorId = string & { readonly [actorIdBrand]: "ActorId" };
export type MembershipId = string & {
  readonly [membershipIdBrand]: "MembershipId";
};
export type RoleId = string & { readonly [roleIdBrand]: "RoleId" };
export type PermissionId = string & {
  readonly [permissionIdBrand]: "PermissionId";
};

export function asTenantId(value: string): TenantId {
  return value as TenantId;
}

export function asOrganizationId(value: string): OrganizationId {
  return value as OrganizationId;
}

export function asPersonId(value: string): PersonId {
  return value as PersonId;
}

export function asUserId(value: string): UserId {
  return value as UserId;
}

export function asActorId(value: string): ActorId {
  return value as ActorId;
}

export function asMembershipId(value: string): MembershipId {
  return value as MembershipId;
}

export function asRoleId(value: string): RoleId {
  return value as RoleId;
}

export function asPermissionId(value: string): PermissionId {
  return value as PermissionId;
}
