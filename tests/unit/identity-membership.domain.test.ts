import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asMembershipId,
  asOrganizationId,
  asTenantId,
  asUserId,
  createOrganizationMembership,
  DomainValidationError,
  updateOrganizationMembershipStatus,
} from "@/lib/modules/identity";

describe("OrganizationMembership domain", () => {
  const base = () => ({
    id: asMembershipId(randomUUID()),
    tenantId: asTenantId(randomUUID()),
    organizationId: asOrganizationId(randomUUID()),
    userId: asUserId(randomUUID()),
  });

  it("creates a valid membership", () => {
    const membership = createOrganizationMembership(base());
    expect(membership.status).toBe("ACTIVE");
    expect(membership.version).toBe(1);
    expect(membership.tenantId).toBeTruthy();
    expect(membership.organizationId).toBeTruthy();
    expect(membership.userId).toBeTruthy();
  });

  it("requires tenantId, organizationId, and userId", () => {
    expect(() =>
      createOrganizationMembership({
        ...base(),
        tenantId: asTenantId("   "),
      })
    ).toThrow(DomainValidationError);

    expect(() =>
      createOrganizationMembership({
        ...base(),
        organizationId: asOrganizationId(""),
      })
    ).toThrow(DomainValidationError);

    expect(() =>
      createOrganizationMembership({
        ...base(),
        userId: asUserId(""),
      })
    ).toThrow(DomainValidationError);
  });

  it("accepts allowed statuses only", () => {
    for (const status of ["ACTIVE", "SUSPENDED", "REVOKED"] as const) {
      expect(
        createOrganizationMembership({ ...base(), status }).status
      ).toBe(status);
    }
    expect(() =>
      createOrganizationMembership({
        ...base(),
        status: "DISABLED" as "ACTIVE",
      })
    ).toThrow(DomainValidationError);
  });

  it("increments version on status update", () => {
    const membership = createOrganizationMembership(base());
    const updated = updateOrganizationMembershipStatus(
      membership,
      "SUSPENDED"
    );
    expect(updated.status).toBe("SUSPENDED");
    expect(updated.version).toBe(2);
    expect(updated.id).toBe(membership.id);
  });
});
