import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import type { OrganizationRepository } from "@/lib/modules/organizations";
import type { TenantRepository } from "@/lib/modules/organizations";
import {
  createOrganization,
  createTenant,
  DuplicateCodeError,
  TenantScopeMismatchError,
  updateOrganization,
  updateTenant,
} from "@/lib/modules/organizations";
import {
  InMemoryOrganizationRepository,
  InMemoryTenantRepository,
} from "@/lib/modules/organizations/infrastructure";

function newTenantId() {
  return asTenantId(randomUUID());
}

function newOrganizationId() {
  return asOrganizationId(randomUUID());
}

function buildTenant(code: string) {
  return createTenant({
    id: newTenantId(),
    code,
    displayName: `Tenant ${code}`,
  });
}

function buildOrganization(
  tenantId: ReturnType<typeof asTenantId>,
  code: string
) {
  return createOrganization({
    id: newOrganizationId(),
    tenantId,
    code,
    legalName: `Legal ${code}`,
    displayName: `Org ${code}`,
    countryCode: "IT",
    defaultLocale: "it-IT",
    defaultTimezone: "Europe/Rome",
    defaultCurrency: "EUR",
  });
}

export function registerOrganizationRepositoryContractTests(
  label: string,
  createRepos: () => {
    tenants: TenantRepository;
    organizations: OrganizationRepository;
  }
) {
  describe(`Organization repository contract (${label})`, () => {
    it("saves and finds Tenant by id and code", async () => {
      const { tenants } = createRepos();
      const tenant = buildTenant("acme");

      await tenants.save(tenant);

      await expect(tenants.findById(tenant.id)).resolves.toEqual(tenant);
      await expect(tenants.findByCode("acme")).resolves.toEqual(tenant);
      await expect(tenants.findByCode("missing")).resolves.toBeNull();
      await expect(tenants.findById(newTenantId())).resolves.toBeNull();
    });

    it("increments Tenant version on updateTenant + save", async () => {
      const { tenants } = createRepos();
      const tenant = buildTenant("versioned");
      await tenants.save(tenant);

      const updated = updateTenant(tenant, { displayName: "Versioned Co" });
      expect(updated.version).toBe(tenant.version + 1);
      await tenants.save(updated);

      const loaded = await tenants.findById(tenant.id);
      expect(loaded?.version).toBe(2);
      expect(loaded?.displayName).toBe("Versioned Co");
    });

    it("rejects duplicate Tenant code for a different id", async () => {
      const { tenants } = createRepos();
      await tenants.save(buildTenant("dup-tenant"));
      await expect(tenants.save(buildTenant("dup-tenant"))).rejects.toBeInstanceOf(
        DuplicateCodeError
      );
    });

    it("saves and finds Organization with correct tenant scope", async () => {
      const { tenants, organizations } = createRepos();
      const tenant = buildTenant("scope-a");
      await tenants.save(tenant);
      const organization = buildOrganization(tenant.id, "hq");

      await organizations.save(tenant.id, organization);

      await expect(
        organizations.findById(tenant.id, organization.id)
      ).resolves.toEqual(organization);
      await expect(
        organizations.findByCode(tenant.id, "hq")
      ).resolves.toEqual(organization);
    });

    it("does not return Organization for a different tenant id", async () => {
      const { tenants, organizations } = createRepos();
      const tenantA = buildTenant("tenant-a");
      const tenantB = buildTenant("tenant-b");
      await tenants.save(tenantA);
      await tenants.save(tenantB);
      const organization = buildOrganization(tenantA.id, "shared-looking");
      await organizations.save(tenantA.id, organization);

      await expect(
        organizations.findById(tenantB.id, organization.id)
      ).resolves.toBeNull();
      await expect(
        organizations.findByCode(tenantB.id, "shared-looking")
      ).resolves.toBeNull();
    });

    it("findByTenant returns only organizations of that tenant", async () => {
      const { tenants, organizations } = createRepos();
      const tenantA = buildTenant("list-a");
      const tenantB = buildTenant("list-b");
      await tenants.save(tenantA);
      await tenants.save(tenantB);

      const orgA1 = buildOrganization(tenantA.id, "a1");
      const orgA2 = buildOrganization(tenantA.id, "a2");
      const orgB1 = buildOrganization(tenantB.id, "b1");
      await organizations.save(tenantA.id, orgA1);
      await organizations.save(tenantA.id, orgA2);
      await organizations.save(tenantB.id, orgB1);

      const listed = await organizations.findByTenant(tenantA.id);
      expect(listed.map((o) => o.code).sort()).toEqual(["a1", "a2"]);
      expect(listed.every((o) => o.tenantId === tenantA.id)).toBe(true);
    });

    it("allows the same Organization code on different tenants", async () => {
      const { tenants, organizations } = createRepos();
      const tenantA = buildTenant("code-a");
      const tenantB = buildTenant("code-b");
      await tenants.save(tenantA);
      await tenants.save(tenantB);

      const orgA = buildOrganization(tenantA.id, "ops");
      const orgB = buildOrganization(tenantB.id, "ops");
      await organizations.save(tenantA.id, orgA);
      await organizations.save(tenantB.id, orgB);

      await expect(
        organizations.findByCode(tenantA.id, "ops")
      ).resolves.toEqual(orgA);
      await expect(
        organizations.findByCode(tenantB.id, "ops")
      ).resolves.toEqual(orgB);
    });

    it("rejects duplicate Organization code within the same tenant", async () => {
      const { tenants, organizations } = createRepos();
      const tenant = buildTenant("dup-org-tenant");
      await tenants.save(tenant);
      await organizations.save(tenant.id, buildOrganization(tenant.id, "ops"));

      await expect(
        organizations.save(tenant.id, buildOrganization(tenant.id, "ops"))
      ).rejects.toBeInstanceOf(DuplicateCodeError);
    });

    it("rejects save when tenantId argument mismatches entity.tenantId", async () => {
      const { tenants, organizations } = createRepos();
      const tenantA = buildTenant("mismatch-a");
      const tenantB = buildTenant("mismatch-b");
      await tenants.save(tenantA);
      await tenants.save(tenantB);
      const organization = buildOrganization(tenantA.id, "ops");

      await expect(
        organizations.save(tenantB.id, organization)
      ).rejects.toBeInstanceOf(TenantScopeMismatchError);
    });

    it("increments Organization version on updateOrganization + save", async () => {
      const { tenants, organizations } = createRepos();
      const tenant = buildTenant("org-version");
      await tenants.save(tenant);
      const organization = buildOrganization(tenant.id, "ops");
      await organizations.save(tenant.id, organization);

      const updated = updateOrganization(organization, {
        displayName: "Ops Updated",
      });
      expect(updated.version).toBe(2);
      await organizations.save(tenant.id, updated);

      const loaded = await organizations.findById(tenant.id, organization.id);
      expect(loaded?.version).toBe(2);
      expect(loaded?.displayName).toBe("Ops Updated");
    });
  });
}

describe("InMemory organization repositories", () => {
  registerOrganizationRepositoryContractTests("in-memory", () => ({
    tenants: new InMemoryTenantRepository(),
    organizations: new InMemoryOrganizationRepository(),
  }));
});
