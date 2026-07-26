export type { LifecycleStatus } from "./domain/lifecycle-status";
export { LIFECYCLE_STATUSES, isLifecycleStatus } from "./domain/lifecycle-status";

export type { Tenant, CreateTenantInput, TenantUpdatePatch } from "./domain/tenant";
export { createTenant, updateTenant } from "./domain/tenant";

export type {
  Organization,
  CreateOrganizationInput,
  OrganizationUpdatePatch,
} from "./domain/organization";
export { createOrganization, updateOrganization } from "./domain/organization";

export type { TenantRepository } from "./application/tenant-repository";
export type { OrganizationRepository } from "./application/organization-repository";

export {
  DomainValidationError,
  DuplicateCodeError,
  PersistenceError,
  TenantScopeMismatchError,
} from "./domain/errors";
