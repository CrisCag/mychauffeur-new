export type {
  ActorId,
  OrganizationId,
  PersonId,
  TenantId,
  UserId,
} from "./domain/identifiers";

export {
  asActorId,
  asOrganizationId,
  asPersonId,
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

export type { PersonRepository } from "./application/person-repository";
export type { UserRepository } from "./application/user-repository";
export type { ExternalIdentityRepository } from "./application/external-identity-repository";

export {
  DomainValidationError,
  DuplicateExternalIdentityError,
} from "./domain/errors";
