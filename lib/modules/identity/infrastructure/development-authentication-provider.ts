import type { AuthenticationProvider } from "../application/authentication-provider";
import type { AuthenticatedPrincipal } from "../application/authenticated-principal";
import type { ResolvePrincipalInput } from "../application/authentication-provider";

/**
 * Development/test-only AuthenticationProvider.
 * Returns the principal injected at construction — no env, no headers, no auto-identity.
 * Not for production. Do not wire to routes.
 */
export class DevelopmentAuthenticationProvider implements AuthenticationProvider {
  constructor(private readonly principal: AuthenticatedPrincipal) {}

  async resolvePrincipal(
    input: ResolvePrincipalInput
  ): Promise<AuthenticatedPrincipal | null> {
    void input;
    return this.principal;
  }
}
