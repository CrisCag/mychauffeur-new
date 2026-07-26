import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
  asUserId,
} from "@/lib/modules/identity";
import {
  AuthorizationDeniedError,
  createAnonymousSecurityContext,
  createAuthenticatedSecurityContext,
  hasPermission,
  requirePermission,
} from "@/lib/modules/platform";

const BOOKING_READ = "booking.read";
const BOOKING_WRITE = "booking.write";

describe("SecurityContext", () => {
  it("anonymous context has no permissions (deny by default)", () => {
    const ctx = createAnonymousSecurityContext();

    expect(ctx.authenticationState).toBe("ANONYMOUS");
    expect(ctx.permissions).toEqual([]);
    expect(ctx.roles).toEqual([]);
    expect(hasPermission(ctx, BOOKING_READ)).toBe(false);
    expect(hasPermission(ctx, BOOKING_WRITE)).toBe(false);
  });

  it("authenticated context only has assigned permissions", () => {
    const ctx = createAuthenticatedSecurityContext({
      actorId: asActorId("actor-1"),
      userId: asUserId("user-1"),
      tenantId: asTenantId("tenant-1"),
      organizationId: asOrganizationId("org-1"),
      roles: ["dispatcher"],
      permissions: [BOOKING_READ],
    });

    expect(ctx.authenticationState).toBe("AUTHENTICATED");
    expect(hasPermission(ctx, BOOKING_READ)).toBe(true);
    expect(hasPermission(ctx, BOOKING_WRITE)).toBe(false);
  });

  it("hasPermission returns false when permission is missing", () => {
    const ctx = createAuthenticatedSecurityContext({
      actorId: asActorId("actor-1"),
      userId: asUserId("user-1"),
      tenantId: asTenantId("tenant-1"),
      organizationId: asOrganizationId("org-1"),
      permissions: [BOOKING_READ],
    });

    expect(hasPermission(ctx, "assignment.assign")).toBe(false);
  });

  it("requirePermission does not throw when authorized", () => {
    const ctx = createAuthenticatedSecurityContext({
      actorId: asActorId("actor-1"),
      userId: asUserId("user-1"),
      tenantId: asTenantId("tenant-1"),
      organizationId: asOrganizationId("org-1"),
      permissions: [BOOKING_READ],
    });

    expect(() => requirePermission(ctx, BOOKING_READ)).not.toThrow();
  });

  it("requirePermission throws AuthorizationDeniedError when not authorized", () => {
    const ctx = createAuthenticatedSecurityContext({
      actorId: asActorId("actor-1"),
      userId: asUserId("user-1"),
      tenantId: asTenantId("tenant-1"),
      organizationId: asOrganizationId("org-1"),
      permissions: [BOOKING_READ],
    });

    expect(() => requirePermission(ctx, BOOKING_WRITE)).toThrow(
      AuthorizationDeniedError
    );
    expect(() => requirePermission(ctx, BOOKING_WRITE)).toThrow(
      "Authorization denied"
    );
  });

  it("deny-by-default: authenticated with empty permissions cannot access", () => {
    const ctx = createAuthenticatedSecurityContext({
      actorId: asActorId("actor-1"),
      userId: asUserId("user-1"),
      tenantId: asTenantId("tenant-1"),
      organizationId: asOrganizationId("org-1"),
      permissions: [],
    });

    expect(hasPermission(ctx, BOOKING_READ)).toBe(false);
    expect(() => requirePermission(ctx, BOOKING_READ)).toThrow(
      AuthorizationDeniedError
    );
  });

  it("deny-by-default: anonymous requirePermission always denies", () => {
    const ctx = createAnonymousSecurityContext();
    expect(() => requirePermission(ctx, BOOKING_READ)).toThrow(
      AuthorizationDeniedError
    );
  });
});
