import type { OrganizationId, TenantId, UserId } from "../domain/identifiers";

export type ResolvePermissionsInput = {
  tenantId: TenantId;
  organizationId: OrganizationId;
  userId: UserId;
};

export type ResolvedAuthorization = {
  readonly roles: string[];
  readonly permissions: string[];
};

/**
 * Application Port for deny-by-default permission resolution.
 * No Next.js / Supabase / JWT dependency.
 */
export type PermissionResolver = {
  resolvePermissions(
    input: ResolvePermissionsInput
  ): Promise<ResolvedAuthorization>;
};
