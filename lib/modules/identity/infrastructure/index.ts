/**
 * Infrastructure entry point for identity module.
 * Explicit and separate from the Domain public contract.
 * Development/test adapters only — do not wire to routes/UI.
 */

export { DevelopmentAuthenticationProvider } from "./development-authentication-provider";
export { InMemoryPersonRepository } from "./in-memory-person-repository";
export { InMemoryUserRepository } from "./in-memory-user-repository";
export { InMemoryExternalIdentityRepository } from "./in-memory-external-identity-repository";
export { InMemoryOrganizationMembershipRepository } from "./in-memory-organization-membership-repository";
export { InMemoryRoleRepository } from "./in-memory-role-repository";
export { InMemoryPermissionRepository } from "./in-memory-permission-repository";
export { InMemoryMembershipRoleRepository } from "./in-memory-membership-role-repository";
export { InMemoryRolePermissionRepository } from "./in-memory-role-permission-repository";
export { InMemoryPermissionResolver } from "./in-memory-permission-resolver";
