export type {
  ActorId,
  MembershipId,
  OrganizationId,
  PermissionId,
  PersonId,
  RoleId,
  TenantId,
  UserId,
} from "./domain/identifiers";

export {
  asActorId,
  asMembershipId,
  asOrganizationId,
  asPermissionId,
  asPersonId,
  asRoleId,
  asTenantId,
  asUserId,
} from "./domain/identifiers";

export type { Person, CreatePersonInput, PersonUpdatePatch } from "./domain/person";
export { createPerson, updatePerson } from "./domain/person";

export type { User, CreateUserInput, UserUpdatePatch } from "./domain/user";
export { createUser, updateUser } from "./domain/user";

export type { UserStatus } from "./domain/user-status";
export { USER_STATUSES, isUserStatus } from "./domain/user-status";

export type {
  ExternalIdentity,
  ExternalIdentityId,
  CreateExternalIdentityInput,
} from "./domain/external-identity";
export {
  asExternalIdentityId,
  createExternalIdentity,
  normalizeIdentityProvider,
} from "./domain/external-identity";

export type {
  OrganizationMembership,
  CreateOrganizationMembershipInput,
} from "./domain/organization-membership";
export {
  createOrganizationMembership,
  updateOrganizationMembershipStatus,
} from "./domain/organization-membership";

export type { MembershipStatus } from "./domain/membership-status";
export {
  MEMBERSHIP_STATUSES,
  isMembershipStatus,
} from "./domain/membership-status";

export type { Role, CreateRoleInput } from "./domain/role";
export { createRole, normalizeRoleCode } from "./domain/role";

export type { RoleStatus } from "./domain/role-status";
export { ROLE_STATUSES, isRoleStatus } from "./domain/role-status";

export type { Permission, CreatePermissionInput } from "./domain/permission";
export {
  buildPermissionCode,
  createPermission,
  normalizePermissionCode,
} from "./domain/permission";

export type { PermissionStatus } from "./domain/permission-status";
export {
  PERMISSION_STATUSES,
  isPermissionStatus,
} from "./domain/permission-status";

export type {
  MembershipRole,
  CreateMembershipRoleInput,
} from "./domain/membership-role";
export {
  assignRoleToMembership,
  createMembershipRole,
} from "./domain/membership-role";

export type {
  RolePermission,
  CreateRolePermissionInput,
} from "./domain/role-permission";
export { createRolePermission } from "./domain/role-permission";

export type {
  AuthenticatedPrincipal,
  AuthenticationMethod,
  CreateAuthenticatedPrincipalInput,
} from "./application/authenticated-principal";
export {
  AUTHENTICATION_METHODS,
  createAuthenticatedPrincipal,
} from "./application/authenticated-principal";

export type {
  AuthenticationProvider,
  ResolvePrincipalInput,
} from "./application/authentication-provider";

export { createSecurityContextFromPrincipal } from "./application/create-security-context-from-principal";
export { enrichPrincipalWithResolvedAuthorization } from "./application/enrich-principal-with-resolved-authorization";

export type { PersonRepository } from "./application/person-repository";
export type { UserRepository } from "./application/user-repository";
export type { ExternalIdentityRepository } from "./application/external-identity-repository";
export type { OrganizationMembershipRepository } from "./application/organization-membership-repository";
export type { RoleRepository } from "./application/role-repository";
export type { PermissionRepository } from "./application/permission-repository";
export type { MembershipRoleRepository } from "./application/membership-role-repository";
export type { RolePermissionRepository } from "./application/role-permission-repository";
export type {
  PermissionResolver,
  ResolvePermissionsInput,
  ResolvedAuthorization,
} from "./application/permission-resolver";

export {
  AuthorizationScopeError,
  DomainValidationError,
  DuplicateExternalIdentityError,
  DuplicateMembershipError,
  DuplicatePermissionCodeError,
  DuplicateRoleCodeError,
} from "./domain/errors";
