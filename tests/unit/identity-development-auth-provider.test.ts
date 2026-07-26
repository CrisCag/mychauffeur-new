import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
  asUserId,
  createAuthenticatedPrincipal,
} from "@/lib/modules/identity";
import { DevelopmentAuthenticationProvider } from "@/lib/modules/identity/infrastructure";

describe("DevelopmentAuthenticationProvider", () => {
  it("returns the injected principal and ignores input headers", async () => {
    const principal = createAuthenticatedPrincipal({
      actorId: asActorId("actor-1"),
      userId: asUserId("user-1"),
      tenantId: asTenantId("tenant-1"),
      organizationId: asOrganizationId("org-1"),
      authenticationMethod: "DEVELOPMENT_STUB",
      permissions: ["booking.read"],
    });
    const provider = new DevelopmentAuthenticationProvider(principal);

    const resolved = await provider.resolvePrincipal({
      authorizationHeader: "Bearer ignored",
      sessionToken: "ignored",
      requestId: "req-1",
    });

    expect(resolved).toBe(principal);
  });
});
