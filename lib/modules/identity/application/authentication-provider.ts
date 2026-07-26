import type { AuthenticatedPrincipal } from "./authenticated-principal";

/**
 * Provider-agnostic authentication resolution input.
 * Not tied to any web framework request object.
 */
export type ResolvePrincipalInput = {
  authorizationHeader?: string;
  sessionToken?: string;
  requestId?: string;
};

/**
 * Authentication Port — resolve an AuthenticatedPrincipal or null.
 * No concrete production provider in Step 2.
 */
export interface AuthenticationProvider {
  resolvePrincipal(
    input: ResolvePrincipalInput
  ): Promise<AuthenticatedPrincipal | null>;
}
