import type {
  ActorId,
  OrganizationId,
  TenantId,
  UserId,
} from "@/lib/modules/identity/domain/identifiers";
import type { AuthenticationState } from "../security-context";

export type AuthorizationScope =
  | "PLATFORM"
  | "TENANT"
  | "ORGANIZATION"
  | "OWN_RECORDS"
  | "ASSIGNED_SERVICES"
  | "CASE_ASSIGNED"
  | "FINANCIAL_ORGANIZATION";

export const AUTHORIZATION_SCOPES: readonly AuthorizationScope[] = [
  "PLATFORM",
  "TENANT",
  "ORGANIZATION",
  "OWN_RECORDS",
  "ASSIGNED_SERVICES",
  "CASE_ASSIGNED",
  "FINANCIAL_ORGANIZATION",
] as const;

export type DataVisibility =
  | "FULL"
  | "LIMITED"
  | "MASKED"
  | "PROGRESSIVE"
  | "OPERATIONAL_ONLY"
  | "FINANCIAL_OWN"
  | "INTERNAL_ONLY";

export const DATA_VISIBILITIES: readonly DataVisibility[] = [
  "FULL",
  "LIMITED",
  "MASKED",
  "PROGRESSIVE",
  "OPERATIONAL_ONLY",
  "FINANCIAL_OWN",
  "INTERNAL_ONLY",
] as const;

export type AuthorizationDecisionKind = "ALLOWED" | "DENIED";

export type AuthorizationReasonCode =
  | "AUTHENTICATION_REQUIRED"
  | "PERMISSION_MISSING"
  | "TENANT_MISMATCH"
  | "ORGANIZATION_MISMATCH"
  | "OWNER_SCOPE_MISMATCH"
  | "ASSIGNMENT_SCOPE_MISMATCH"
  | "CASE_SCOPE_MISMATCH"
  | "RESOURCE_NOT_AVAILABLE"
  | "ALLOWED";

export type AuthorizationDecisionInput = {
  readonly actorId: ActorId | null;
  readonly userId: UserId | null;
  readonly authenticationState: AuthenticationState;
  readonly tenantId: TenantId | null;
  readonly organizationId: OrganizationId | null;
  readonly grantedPermissions: readonly string[];
  readonly requiredPermission: string;
  readonly requiredScope: AuthorizationScope;
  readonly resourceTenantId: TenantId | null;
  readonly resourceOrganizationId: OrganizationId | null;
  readonly resourceOwnerId?: ActorId | null;
  readonly assignedActorId?: ActorId | null;
  readonly assignedCaseActorId?: ActorId | null;
  readonly requestedDataVisibility?: DataVisibility;
  readonly requestId: string;
  readonly correlationId?: string;
};

export type AuthorizationDecision = {
  readonly decision: AuthorizationDecisionKind;
  readonly reasonCode: AuthorizationReasonCode;
  readonly requiredPermission: string;
  readonly evaluatedScope: AuthorizationScope;
  readonly missingPermissions: readonly string[];
  readonly auditRequired: boolean;
  readonly dataVisibility: DataVisibility | null;
  readonly evaluatedAt: Date;
};
