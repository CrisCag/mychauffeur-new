import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asOrganizationId,
  asRoleId,
  asTenantId,
  createRole,
  DomainValidationError,
  normalizeRoleCode,
} from "@/lib/modules/identity";

describe("Role domain", () => {
  const tenantId = () => asTenantId(randomUUID());

  it("creates a tenant-level role", () => {
    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId: tenantId(),
      code: "Dispatcher",
      displayName: "Dispatcher",
    });
    expect(role.organizationId).toBeNull();
    expect(role.code).toBe("dispatcher");
    expect(role.status).toBe("ACTIVE");
    expect(role.isSystemRole).toBe(false);
    expect(role.version).toBe(1);
  });

  it("creates an organization-level role", () => {
    const organizationId = asOrganizationId(randomUUID());
    const role = createRole({
      id: asRoleId(randomUUID()),
      tenantId: tenantId(),
      organizationId,
      code: "driver",
      displayName: "Driver",
    });
    expect(role.organizationId).toBe(organizationId);
  });

  it("normalizes role code", () => {
    expect(normalizeRoleCode("  OWNER ")).toBe("owner");
  });

  it("accepts allowed statuses only", () => {
    for (const status of ["ACTIVE", "DISABLED", "ARCHIVED"] as const) {
      expect(
        createRole({
          id: asRoleId(randomUUID()),
          tenantId: tenantId(),
          code: `role-${status.toLowerCase()}`,
          displayName: status,
          status,
        }).status
      ).toBe(status);
    }
    expect(() =>
      createRole({
        id: asRoleId(randomUUID()),
        tenantId: tenantId(),
        code: "bad",
        displayName: "Bad",
        status: "REVOKED" as "ACTIVE",
      })
    ).toThrow(DomainValidationError);
  });

  it("rejects blank code and invalid version", () => {
    expect(() =>
      createRole({
        id: asRoleId(randomUUID()),
        tenantId: tenantId(),
        code: "  ",
        displayName: "X",
      })
    ).toThrow(DomainValidationError);

    expect(() =>
      createRole({
        id: asRoleId(randomUUID()),
        tenantId: tenantId(),
        code: "ok",
        displayName: "Ok",
        version: 0,
      })
    ).toThrow(DomainValidationError);
  });
});
