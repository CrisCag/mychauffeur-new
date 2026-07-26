import { describe, expect, it } from "vitest";
import {
  asPersonId,
  asUserId,
  createUser,
  DomainValidationError,
  updateUser,
} from "@/lib/modules/identity";

describe("User domain", () => {
  it("creates a valid ACTIVE User", () => {
    const user = createUser({
      id: asUserId("22222222-2222-2222-2222-222222222222"),
      personId: asPersonId("11111111-1111-1111-1111-111111111111"),
    });

    expect(user.status).toBe("ACTIVE");
    expect(user.version).toBe(1);
  });

  it("accepts allowed statuses", () => {
    for (const status of ["ACTIVE", "SUSPENDED", "DISABLED"] as const) {
      const user = createUser({
        id: asUserId("22222222-2222-2222-2222-222222222222"),
        personId: asPersonId("11111111-1111-1111-1111-111111111111"),
        status,
      });
      expect(user.status).toBe(status);
    }
  });

  it("rejects invalid status", () => {
    expect(() =>
      createUser({
        id: asUserId("22222222-2222-2222-2222-222222222222"),
        personId: asPersonId("11111111-1111-1111-1111-111111111111"),
        status: "UNKNOWN" as "ACTIVE",
      })
    ).toThrow(DomainValidationError);
  });

  it("increments version on update", () => {
    const user = createUser({
      id: asUserId("22222222-2222-2222-2222-222222222222"),
      personId: asPersonId("11111111-1111-1111-1111-111111111111"),
    });
    const updated = updateUser(user, { status: "SUSPENDED" });
    expect(updated.version).toBe(2);
    expect(updated.status).toBe("SUSPENDED");
  });
});
