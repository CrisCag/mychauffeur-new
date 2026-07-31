import type {
  OrganizationId,
  RoleId,
  TenantId,
} from "../domain/identifiers";
import type { Role } from "../domain/role";

export type RoleRepository = {
  findById(tenantId: TenantId, roleId: RoleId): Promise<Role | null>;

  findByCode(
    tenantId: TenantId,
    organizationId: OrganizationId | null,
    code: string
  ): Promise<Role | null>;

  /**
   * Tenant-level roles plus organization-scoped roles for the given organization.
   */
  findAvailableForOrganization(
    tenantId: TenantId,
    organizationId: OrganizationId
  ): Promise<Role[]>;

  save(role: Role): Promise<void>;
};
