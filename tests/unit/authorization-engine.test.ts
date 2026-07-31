import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
  asUserId,
} from "@/lib/modules/identity";
import {
  AuthorizationDeniedError,
  createAuthorizationPolicy,
  evaluateAuthorization,
  isAllowed,
  isKnownSensitivePermission,
  requireAllowed,
  type AuthorizationDecisionInput,
  type AuthorizationScope,
} from "@/lib/modules/platform";

const actorId = asActorId("actor-1");
const userId = asUserId("user-1");
const tenantId = asTenantId("tenant-1");
const organizationId = asOrganizationId("org-1");

function baseInput(
  overrides: Partial<AuthorizationDecisionInput> = {}
): AuthorizationDecisionInput {
  return {
    actorId,
    userId,
    authenticationState: "AUTHENTICATED",
    tenantId,
    organizationId,
    grantedPermissions: ["booking.read"],
    requiredPermission: "booking.read",
    requiredScope: "ORGANIZATION",
    resourceTenantId: tenantId,
    resourceOrganizationId: organizationId,
    requestId: randomUUID(),
    ...overrides,
  };
}

describe("Authorization Engine — authentication", () => {
  it("denies anonymous with AUTHENTICATION_REQUIRED", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
    });
    const decision = evaluateAuthorization(
      baseInput({ authenticationState: "ANONYMOUS", grantedPermissions: [] }),
      policy
    );
    expect(decision.decision).toBe("DENIED");
    expect(decision.reasonCode).toBe("AUTHENTICATION_REQUIRED");
    expect(isAllowed(decision)).toBe(false);
  });

  it("continues when authenticated", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
      dataVisibility: "FULL",
    });
    const decision = evaluateAuthorization(baseInput(), policy);
    expect(decision.decision).toBe("ALLOWED");
    expect(decision.reasonCode).toBe("ALLOWED");
  });
});

describe("Authorization Engine — permission", () => {
  it("denies missing permission", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.cancel",
      requiredScope: "ORGANIZATION",
    });
    const decision = evaluateAuthorization(
      baseInput({
        requiredPermission: "booking.cancel",
        grantedPermissions: ["booking.read"],
      }),
      policy
    );
    expect(decision.reasonCode).toBe("PERMISSION_MISSING");
    expect(decision.missingPermissions).toEqual(["booking.cancel"]);
  });

  it("continues when exact permission is present", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
    });
    expect(evaluateAuthorization(baseInput(), policy).decision).toBe("ALLOWED");
  });

  it("denies when Role name is present but Permission is absent", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
    });
    const decision = evaluateAuthorization(
      baseInput({ grantedPermissions: [] }),
      policy
    );
    expect(decision.reasonCode).toBe("PERMISSION_MISSING");
  });

  it("does not grant access via wildcard", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
    });
    const decision = evaluateAuthorization(
      baseInput({ grantedPermissions: ["*", "booking.*"] }),
      policy
    );
    expect(decision.reasonCode).toBe("PERMISSION_MISSING");
  });

  it("case-sensitive comparison does not grant on different case", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
    });
    const decision = evaluateAuthorization(
      baseInput({ grantedPermissions: ["Booking.Read", "BOOKING.READ"] }),
      policy
    );
    expect(decision.reasonCode).toBe("PERMISSION_MISSING");
  });
});

describe("Authorization Engine — PLATFORM", () => {
  it("allows when permission is present without implicit super-admin", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "platform.tenant.read",
      requiredScope: "PLATFORM",
      dataVisibility: "INTERNAL_ONLY",
      sensitiveOperation: true,
    });
    const decision = evaluateAuthorization(
      baseInput({
        requiredPermission: "platform.tenant.read",
        requiredScope: "PLATFORM",
        grantedPermissions: ["platform.tenant.read"],
        resourceTenantId: asTenantId("other-tenant"),
        resourceOrganizationId: asOrganizationId("other-org"),
      }),
      policy
    );
    expect(decision.decision).toBe("ALLOWED");
    expect(decision.auditRequired).toBe(true);
  });

  it("does not allow unrelated platform permission as super-admin", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "platform.tenant.manage",
      requiredScope: "PLATFORM",
      sensitiveOperation: true,
    });
    const decision = evaluateAuthorization(
      baseInput({
        requiredPermission: "platform.tenant.manage",
        requiredScope: "PLATFORM",
        grantedPermissions: ["platform.tenant.read"],
      }),
      policy
    );
    expect(decision.reasonCode).toBe("PERMISSION_MISSING");
  });
});

describe("Authorization Engine — TENANT", () => {
  const policy = createAuthorizationPolicy({
    requiredPermission: "organization.read",
    requiredScope: "TENANT",
  });

  it("allows matching tenant", () => {
    const decision = evaluateAuthorization(
      baseInput({
        requiredPermission: "organization.read",
        requiredScope: "TENANT",
        grantedPermissions: ["organization.read"],
      }),
      policy
    );
    expect(decision.decision).toBe("ALLOWED");
  });

  it("denies different tenant", () => {
    const decision = evaluateAuthorization(
      baseInput({
        requiredPermission: "organization.read",
        requiredScope: "TENANT",
        grantedPermissions: ["organization.read"],
        resourceTenantId: asTenantId("tenant-2"),
      }),
      policy
    );
    expect(decision.reasonCode).toBe("TENANT_MISMATCH");
  });
});

describe("Authorization Engine — ORGANIZATION", () => {
  const policy = createAuthorizationPolicy({
    requiredPermission: "booking.read",
    requiredScope: "ORGANIZATION",
  });

  it("allows matching tenant and organization", () => {
    expect(evaluateAuthorization(baseInput(), policy).decision).toBe("ALLOWED");
  });

  it("denies tenant mismatch first", () => {
    const decision = evaluateAuthorization(
      baseInput({ resourceTenantId: asTenantId("tenant-x") }),
      policy
    );
    expect(decision.reasonCode).toBe("TENANT_MISMATCH");
  });

  it("denies organization mismatch", () => {
    const decision = evaluateAuthorization(
      baseInput({ resourceOrganizationId: asOrganizationId("org-x") }),
      policy
    );
    expect(decision.reasonCode).toBe("ORGANIZATION_MISMATCH");
  });
});

describe("Authorization Engine — OWN_RECORDS", () => {
  const policy = createAuthorizationPolicy({
    requiredPermission: "driver.availability_manage_own",
    requiredScope: "OWN_RECORDS",
    dataVisibility: "OPERATIONAL_ONLY",
  });

  function ownInput(
    overrides: Partial<AuthorizationDecisionInput> = {}
  ): AuthorizationDecisionInput {
    return baseInput({
      requiredPermission: "driver.availability_manage_own",
      requiredScope: "OWN_RECORDS",
      grantedPermissions: ["driver.availability_manage_own"],
      resourceOwnerId: actorId,
      ...overrides,
    });
  }

  it("allows when actor is owner", () => {
    expect(evaluateAuthorization(ownInput(), policy).decision).toBe("ALLOWED");
  });

  it("denies different owner", () => {
    const decision = evaluateAuthorization(
      ownInput({ resourceOwnerId: asActorId("actor-other") }),
      policy
    );
    expect(decision.reasonCode).toBe("OWNER_SCOPE_MISMATCH");
  });

  it("denies when owner is absent", () => {
    const decision = evaluateAuthorization(
      ownInput({ resourceOwnerId: null }),
      policy
    );
    expect(decision.reasonCode).toBe("RESOURCE_NOT_AVAILABLE");
  });
});

describe("Authorization Engine — ASSIGNED_SERVICES", () => {
  const policy = createAuthorizationPolicy({
    requiredPermission: "service.read",
    requiredScope: "ASSIGNED_SERVICES",
    dataVisibility: "OPERATIONAL_ONLY",
  });

  function assignedInput(
    overrides: Partial<AuthorizationDecisionInput> = {}
  ): AuthorizationDecisionInput {
    return baseInput({
      requiredPermission: "service.read",
      requiredScope: "ASSIGNED_SERVICES",
      grantedPermissions: ["service.read"],
      assignedActorId: actorId,
      ...overrides,
    });
  }

  it("allows matching assigned actor", () => {
    expect(evaluateAuthorization(assignedInput(), policy).decision).toBe(
      "ALLOWED"
    );
  });

  it("denies different assigned actor", () => {
    const decision = evaluateAuthorization(
      assignedInput({ assignedActorId: asActorId("driver-2") }),
      policy
    );
    expect(decision.reasonCode).toBe("ASSIGNMENT_SCOPE_MISMATCH");
  });

  it("denies when assignedActor is absent", () => {
    const decision = evaluateAuthorization(
      assignedInput({ assignedActorId: null }),
      policy
    );
    expect(decision.reasonCode).toBe("RESOURCE_NOT_AVAILABLE");
  });
});

describe("Authorization Engine — CASE_ASSIGNED", () => {
  const policy = createAuthorizationPolicy({
    requiredPermission: "customer.read",
    requiredScope: "CASE_ASSIGNED",
    dataVisibility: "LIMITED",
  });

  function caseInput(
    overrides: Partial<AuthorizationDecisionInput> = {}
  ): AuthorizationDecisionInput {
    return baseInput({
      requiredPermission: "customer.read",
      requiredScope: "CASE_ASSIGNED",
      grantedPermissions: ["customer.read"],
      assignedCaseActorId: actorId,
      ...overrides,
    });
  }

  it("allows matching case actor", () => {
    expect(evaluateAuthorization(caseInput(), policy).decision).toBe("ALLOWED");
  });

  it("denies different case actor", () => {
    const decision = evaluateAuthorization(
      caseInput({ assignedCaseActorId: asActorId("support-2") }),
      policy
    );
    expect(decision.reasonCode).toBe("CASE_SCOPE_MISMATCH");
  });

  it("denies when case actor is absent", () => {
    const decision = evaluateAuthorization(
      caseInput({ assignedCaseActorId: null }),
      policy
    );
    expect(decision.reasonCode).toBe("RESOURCE_NOT_AVAILABLE");
  });
});

describe("Authorization Engine — FINANCIAL_ORGANIZATION", () => {
  const policy = createAuthorizationPolicy({
    requiredPermission: "finance.read",
    requiredScope: "FINANCIAL_ORGANIZATION",
    sensitiveOperation: true,
  });

  it("allows same organization with FINANCIAL_OWN visibility", () => {
    const decision = evaluateAuthorization(
      baseInput({
        requiredPermission: "finance.read",
        requiredScope: "FINANCIAL_ORGANIZATION",
        grantedPermissions: ["finance.read"],
      }),
      policy
    );
    expect(decision.decision).toBe("ALLOWED");
    expect(decision.dataVisibility).toBe("FINANCIAL_OWN");
    expect(decision.auditRequired).toBe(true);
  });

  it("denies different organization", () => {
    const decision = evaluateAuthorization(
      baseInput({
        requiredPermission: "finance.read",
        requiredScope: "FINANCIAL_ORGANIZATION",
        grantedPermissions: ["finance.read"],
        resourceOrganizationId: asOrganizationId("org-other"),
      }),
      policy
    );
    expect(decision.reasonCode).toBe("ORGANIZATION_MISMATCH");
  });
});

describe("Authorization Engine — output and helpers", () => {
  it("sets evaluatedAt and respects requested Data Visibility when narrowing", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
      dataVisibility: "FULL",
    });
    const before = Date.now();
    const decision = evaluateAuthorization(
      baseInput({ requestedDataVisibility: "LIMITED" }),
      policy
    );
    expect(decision.dataVisibility).toBe("LIMITED");
    expect(decision.evaluatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("does not amplify Data Visibility beyond policy grant", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
      dataVisibility: "LIMITED",
    });
    const decision = evaluateAuthorization(
      baseInput({ requestedDataVisibility: "FULL" }),
      policy
    );
    expect(decision.decision).toBe("ALLOWED");
    expect(decision.dataVisibility).toBe("LIMITED");
  });

  it("marks known sensitive permissions", () => {
    expect(isKnownSensitivePermission("membership.manage")).toBe(true);
    expect(isKnownSensitivePermission("role.manage")).toBe(true);
    expect(isKnownSensitivePermission("permission.assign")).toBe(true);
    expect(isKnownSensitivePermission("pricing.manage")).toBe(true);
    expect(isKnownSensitivePermission("finance.read")).toBe(true);
    expect(isKnownSensitivePermission("audit.read")).toBe(true);
    expect(isKnownSensitivePermission("platform.tenant.manage")).toBe(true);
    expect(isKnownSensitivePermission("booking.read")).toBe(false);
  });

  it("requireAllowed does not throw on ALLOWED", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.read",
      requiredScope: "ORGANIZATION",
    });
    const decision = evaluateAuthorization(baseInput(), policy);
    expect(() => requireAllowed(decision, "req-1")).not.toThrow();
  });

  it("requireAllowed throws AuthorizationDeniedError without sensitive payload", () => {
    const policy = createAuthorizationPolicy({
      requiredPermission: "booking.cancel",
      requiredScope: "ORGANIZATION",
    });
    const decision = evaluateAuthorization(
      baseInput({
        requiredPermission: "booking.cancel",
        grantedPermissions: [],
      }),
      policy
    );
    try {
      requireAllowed(decision, "req-42");
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationDeniedError);
      const denied = error as AuthorizationDeniedError;
      expect(denied.message).toBe("Authorization denied");
      expect(denied.reasonCode).toBe("PERMISSION_MISSING");
      expect(denied.requiredPermission).toBe("booking.cancel");
      expect(denied.evaluatedScope).toBe("ORGANIZATION" satisfies AuthorizationScope);
      expect(denied.requestId).toBe("req-42");
      expect(JSON.stringify(denied)).not.toMatch(/token|password|phone|email/i);
    }
  });
});
