import type {
  ActorId,
  OrganizationId,
  TenantId,
  UserId,
} from "../domain/identifiers";
import { DomainValidationError } from "../domain/errors";

export type AuthenticationMethod =
  | "DEVELOPMENT_STUB"
  | "EXTERNAL_PROVIDER";

export const AUTHENTICATION_METHODS: readonly AuthenticationMethod[] = [
  "DEVELOPMENT_STUB",
  "EXTERNAL_PROVIDER",
] as const;

export type AuthenticatedPrincipal = {
  readonly actorId: ActorId;
  readonly userId: UserId;
  readonly tenantId: TenantId;
  readonly organizationId: OrganizationId;
  readonly authenticationMethod: AuthenticationMethod;
  readonly authenticatedAt: Date;
  readonly sessionId?: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
};

export type CreateAuthenticatedPrincipalInput = {
  actorId: ActorId;
  userId: UserId;
  tenantId: TenantId;
  organizationId: OrganizationId;
  authenticationMethod: AuthenticationMethod;
  authenticatedAt?: Date;
  sessionId?: string;
  roles?: readonly string[];
  permissions?: readonly string[];
};

export function createAuthenticatedPrincipal(
  input: CreateAuthenticatedPrincipalInput
): AuthenticatedPrincipal {
  if (
    input.authenticationMethod !== "DEVELOPMENT_STUB" &&
    input.authenticationMethod !== "EXTERNAL_PROVIDER"
  ) {
    throw new DomainValidationError("Invalid authenticationMethod");
  }

  const sessionId = input.sessionId?.trim();
  if (sessionId !== undefined && sessionId.length === 0) {
    throw new DomainValidationError("sessionId must not be blank");
  }

  return Object.freeze({
    actorId: input.actorId,
    userId: input.userId,
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    authenticationMethod: input.authenticationMethod,
    authenticatedAt: input.authenticatedAt ?? new Date(),
    ...(sessionId !== undefined ? { sessionId } : {}),
    roles: Object.freeze([...(input.roles ?? [])]),
    permissions: Object.freeze([...(input.permissions ?? [])]),
  });
}
