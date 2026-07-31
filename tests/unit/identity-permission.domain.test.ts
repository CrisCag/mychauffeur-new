import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asPermissionId,
  createPermission,
  DomainValidationError,
  normalizePermissionCode,
} from "@/lib/modules/identity";

describe("Permission domain", () => {
  it("creates permission with resource.action code", () => {
    const permission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "Booking",
      action: "Create",
    });
    expect(permission.code).toBe("booking.create");
    expect(permission.resource).toBe("booking");
    expect(permission.action).toBe("create");
    expect(permission.status).toBe("ACTIVE");
    expect(permission.version).toBe(1);
  });

  it("requires resource and action", () => {
    expect(() =>
      createPermission({
        id: asPermissionId(randomUUID()),
        resource: " ",
        action: "read",
      })
    ).toThrow(DomainValidationError);

    expect(() =>
      createPermission({
        id: asPermissionId(randomUUID()),
        resource: "organization",
        action: "",
      })
    ).toThrow(DomainValidationError);
  });

  it("normalizes code and rejects wildcards", () => {
    expect(normalizePermissionCode(" Organization.Read ")).toBe(
      "organization.read"
    );
    expect(() => normalizePermissionCode("organization.*")).toThrow(
      DomainValidationError
    );
  });

  it("rejects code that does not match resource.action", () => {
    expect(() =>
      createPermission({
        id: asPermissionId(randomUUID()),
        resource: "organization",
        action: "read",
        code: "membership.read",
      })
    ).toThrow(DomainValidationError);
  });

  it("accepts allowed statuses only", () => {
    for (const status of ["ACTIVE", "DISABLED", "ARCHIVED"] as const) {
      expect(
        createPermission({
          id: asPermissionId(randomUUID()),
          resource: "membership",
          action: status.toLowerCase() === "active" ? "read" : "manage",
          code:
            status === "ACTIVE"
              ? "membership.read"
              : "membership.manage",
          status,
        }).status
      ).toBe(status);
    }
  });

  it("treats code as immutable after creation (no mutator)", () => {
    const permission = createPermission({
      id: asPermissionId(randomUUID()),
      resource: "organization",
      action: "manage",
    });
    expect(Object.isFrozen(permission)).toBe(true);
    expect(() => {
      (permission as { code: string }).code = "other.action";
    }).toThrow();
  });
});
