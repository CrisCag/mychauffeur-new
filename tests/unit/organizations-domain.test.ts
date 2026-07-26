import { describe, expect, it } from "vitest";
import { asTenantId, asOrganizationId } from "@/lib/modules/identity";
import {
  createOrganization,
  createTenant,
  DomainValidationError,
  updateTenant,
} from "@/lib/modules/organizations";

describe("organizations domain factories", () => {
  it("creates Tenant with required invariants", () => {
    const tenant = createTenant({
      id: asTenantId("11111111-1111-1111-1111-111111111111"),
      code: "  acme  ",
      displayName: " Acme ",
    });

    expect(tenant.code).toBe("acme");
    expect(tenant.displayName).toBe("Acme");
    expect(tenant.status).toBe("ACTIVE");
    expect(tenant.version).toBe(1);
  });

  it("rejects blank Tenant code", () => {
    expect(() =>
      createTenant({
        id: asTenantId("11111111-1111-1111-1111-111111111111"),
        code: "   ",
        displayName: "Acme",
      })
    ).toThrow(DomainValidationError);
  });

  it("creates Organization and bumps version on update", () => {
    const tenantId = asTenantId("11111111-1111-1111-1111-111111111111");
    const organization = createOrganization({
      id: asOrganizationId("22222222-2222-2222-2222-222222222222"),
      tenantId,
      code: "hq",
      legalName: "Acme SRL",
      displayName: "Acme HQ",
      countryCode: "it",
      defaultLocale: "it-IT",
      defaultTimezone: "Europe/Rome",
      defaultCurrency: "eur",
    });

    expect(organization.countryCode).toBe("IT");
    expect(organization.defaultCurrency).toBe("EUR");

    const tenant = createTenant({
      id: tenantId,
      code: "acme",
      displayName: "Acme",
    });
    const updated = updateTenant(tenant, { status: "SUSPENDED" });
    expect(updated.version).toBe(2);
    expect(updated.status).toBe("SUSPENDED");
  });
});
