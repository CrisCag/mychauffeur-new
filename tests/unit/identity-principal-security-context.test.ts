import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
  asUserId,
  createAuthenticatedPrincipal,
  createSecurityContextFromPrincipal,
} from "@/lib/modules/identity";
import {
  hasPermission,
  requirePermission,
  AuthorizationDeniedError,
} from "@/lib/modules/platform";

describe("AuthenticatedPrincipal → SecurityContext", () => {
  it("maps to AUTHENTICATED SecurityContext without implicit permissions", () => {
    const principal = createAuthenticatedPrincipal({
      actorId: asActorId("actor-1"),
      userId: asUserId("user-1"),
      tenantId: asTenantId("tenant-1"),
      organizationId: asOrganizationId("org-1"),
      authenticationMethod: "DEVELOPMENT_STUB",
      roles: ["owner"],
      permissions: ["booking.read"],
    });

    const ctx = createSecurityContextFromPrincipal(principal);

    expect(ctx.authenticationState).toBe("AUTHENTICATED");
    expect(ctx.actorId).toBe(principal.actorId);
    expect(ctx.userId).toBe(principal.userId);
    expect(ctx.tenantId).toBe(principal.tenantId);
    expect(ctx.organizationId).toBe(principal.organizationId);
    expect(ctx.roles).toEqual(["owner"]);
    expect(ctx.permissions).toEqual(["booking.read"]);
    expect(hasPermission(ctx, "booking.read")).toBe(true);
    expect(hasPermission(ctx, "booking.write")).toBe(false);
  });

  it("preserves deny-by-default when permissions are empty", () => {
    const principal = createAuthenticatedPrincipal({
      actorId: asActorId("actor-1"),
      userId: asUserId("user-1"),
      tenantId: asTenantId("tenant-1"),
      organizationId: asOrganizationId("org-1"),
      authenticationMethod: "EXTERNAL_PROVIDER",
    });

    const ctx = createSecurityContextFromPrincipal(principal);
    expect(ctx.permissions).toEqual([]);
    expect(hasPermission(ctx, "booking.read")).toBe(false);
    expect(() => requirePermission(ctx, "booking.read")).toThrow(
      AuthorizationDeniedError
    );
  });
});
