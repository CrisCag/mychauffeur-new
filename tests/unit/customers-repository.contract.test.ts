import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import type { CustomerRepository } from "@/lib/modules/customers";
import {
  anonymizeCustomer,
  asIdentitySubjectId,
  createCustomerNumberFromToken,
  createIndividualCustomer,
  createOrganizationCustomer,
  CustomerVersionConflictError,
  deactivateCustomer,
  DomainValidationError,
  DuplicateCustomerNumberError,
  DuplicateIdentitySubjectError,
  linkCustomerIdentity,
  updateCustomerProfile,
} from "@/lib/modules/customers";
import { InMemoryCustomerRepository } from "@/lib/modules/customers/infrastructure";

function buildIndividual(input?: {
  tenantId?: ReturnType<typeof asTenantId>;
  organizationId?: ReturnType<typeof asOrganizationId>;
  customerNumberToken?: string;
}) {
  return createIndividualCustomer({
    id: randomUUID(),
    tenantId: input?.tenantId ?? asTenantId(randomUUID()),
    organizationId: input?.organizationId ?? asOrganizationId(randomUUID()),
    customerNumber: createCustomerNumberFromToken(
      input?.customerNumberToken ?? randomUUID()
    ),
    individualName: "Ada Lovelace",
    email: "ada@example.com",
    createdAt: new Date("2026-08-02T10:00:00.000Z"),
  }).customer;
}

export function registerCustomerRepositoryContractTests(
  label: string,
  createRepo: () => CustomerRepository
) {
  describe(`Customer repository contract (${label})`, () => {
    it("saves and reads without incrementing version", async () => {
      const repo = createRepo();
      const customer = buildIndividual();
      await repo.save(customer);
      const loaded = await repo.findById(
        customer.tenantId,
        customer.organizationId,
        customer.id
      );
      expect(loaded).toEqual(customer);
      expect(loaded?.version).toBe(0);
    });

    it("round-trips with deep isolation between reads", async () => {
      const repo = createRepo();
      const customer = buildIndividual();
      await repo.save(customer);
      const a = await repo.findById(
        customer.tenantId,
        customer.organizationId,
        customer.id
      );
      const b = await repo.findById(
        customer.tenantId,
        customer.organizationId,
        customer.id
      );
      expect(a?.email).toBe("ada@example.com");
      expect(a).not.toBe(b);
      expect(a?.identityLink).toBeNull();
    });

    it("isolates tenant and organization without leakage", async () => {
      const repo = createRepo();
      const customer = buildIndividual();
      await repo.save(customer);
      await expect(
        repo.findById(
          asTenantId(randomUUID()),
          customer.organizationId,
          customer.id
        )
      ).resolves.toBeNull();
      await expect(
        repo.existsByCustomerNumber(
          customer.tenantId,
          asOrganizationId(randomUUID()),
          customer.customerNumber
        )
      ).resolves.toBe(false);
    });

    it("enforces unique customerNumber in scope", async () => {
      const repo = createRepo();
      const tenantId = asTenantId(randomUUID());
      const organizationId = asOrganizationId(randomUUID());
      const token = randomUUID();
      await repo.save(
        buildIndividual({ tenantId, organizationId, customerNumberToken: token })
      );
      await expect(
        repo.save(
          buildIndividual({
            tenantId,
            organizationId,
            customerNumberToken: token,
          })
        )
      ).rejects.toBeInstanceOf(DuplicateCustomerNumberError);
    });

    it("enforces unique identitySubjectId in scope and allows other org", async () => {
      const repo = createRepo();
      const tenantId = asTenantId(randomUUID());
      const orgA = asOrganizationId(randomUUID());
      const orgB = asOrganizationId(randomUUID());
      const subject = asIdentitySubjectId("user-shared-01");

      const a = linkCustomerIdentity(
        buildIndividual({ tenantId, organizationId: orgA }),
        subject,
        new Date("2026-08-02T11:00:00.000Z")
      ).customer;
      await repo.save(a);

      const conflict = linkCustomerIdentity(
        buildIndividual({ tenantId, organizationId: orgA }),
        subject,
        new Date("2026-08-02T11:00:00.000Z")
      ).customer;
      await expect(repo.save(conflict)).rejects.toBeInstanceOf(
        DuplicateIdentitySubjectError
      );

      const otherOrg = linkCustomerIdentity(
        buildIndividual({ tenantId, organizationId: orgB }),
        subject,
        new Date("2026-08-02T11:00:00.000Z")
      ).customer;
      await repo.save(otherOrg);

      const found = await repo.findByIdentitySubjectId(tenantId, orgA, subject);
      expect(found?.id).toBe(a.id);
      await expect(
        repo.findByIdentitySubjectId(tenantId, asOrganizationId(randomUUID()), subject)
      ).resolves.toBeNull();
    });

    it("enforces OCC for concurrent profile, identity link, and anonymize writers", async () => {
      const repo = createRepo();
      const customer = buildIndividual();
      await repo.save(customer);

      const writerA = updateCustomerProfile(customer, {
        individualName: "Writer A",
        at: new Date("2026-08-02T11:00:00.000Z"),
      }).customer;
      const writerB = deactivateCustomer(
        customer,
        new Date("2026-08-02T11:05:00.000Z")
      ).customer;

      await repo.save(writerA, customer.version);
      await expect(repo.save(writerB, customer.version)).rejects.toBeInstanceOf(
        CustomerVersionConflictError
      );

      const loaded = await repo.findById(
        customer.tenantId,
        customer.organizationId,
        customer.id
      );
      expect(loaded?.individualName).toBe("Writer A");
      expect(loaded?.status).toBe("ACTIVE");
      expect(loaded?.version).toBe(writerA.version);

      const linkA = linkCustomerIdentity(
        writerA,
        "user-link-writer-a",
        new Date("2026-08-02T12:00:00.000Z")
      ).customer;
      const linkB = linkCustomerIdentity(
        writerA,
        "user-link-writer-b",
        new Date("2026-08-02T12:01:00.000Z")
      ).customer;
      await repo.save(linkA, writerA.version);
      await expect(repo.save(linkB, writerA.version)).rejects.toBeInstanceOf(
        CustomerVersionConflictError
      );
      const afterLink = await repo.findById(
        customer.tenantId,
        customer.organizationId,
        customer.id
      );
      expect(afterLink?.identityLink?.identitySubjectId).toBe(
        "user-link-writer-a"
      );

      const anonA = anonymizeCustomer(
        linkA,
        new Date("2026-08-02T13:00:00.000Z")
      ).customer;
      const anonB = updateCustomerProfile(linkA, {
        individualName: "Should Lose",
        at: new Date("2026-08-02T13:01:00.000Z"),
      }).customer;
      await repo.save(anonA, linkA.version);
      await expect(repo.save(anonB, linkA.version)).rejects.toBeInstanceOf(
        CustomerVersionConflictError
      );
      const afterAnon = await repo.findById(
        customer.tenantId,
        customer.organizationId,
        customer.id
      );
      expect(afterAnon?.status).toBe("ANONYMIZED");
      expect(afterAnon?.identityLink).toBeNull();
      expect(afterAnon?.individualName).toBeNull();
      expect(afterAnon?.version).toBe(anonA.version);

      // Uniqueness slot freed after anonymize.
      const recycled = linkCustomerIdentity(
        buildIndividual({
          tenantId: customer.tenantId,
          organizationId: customer.organizationId,
        }),
        "user-link-writer-a",
        new Date("2026-08-02T10:00:00.000Z")
      ).customer;
      await repo.save(recycled);
      expect(recycled.identityLink?.identitySubjectId).toBe(
        "user-link-writer-a"
      );
    });

    it("rejects immutable identity mutation on update", async () => {
      const repo = createRepo();
      const customer = buildIndividual();
      await repo.save(customer);
      const updated = updateCustomerProfile(customer, {
        individualName: "New Name",
        at: new Date("2026-08-02T11:00:00.000Z"),
      }).customer;
      const withNewNumber = {
        ...updated,
        customerNumber: createCustomerNumberFromToken(randomUUID()),
      };
      await expect(
        repo.save(withNewNumber, customer.version)
      ).rejects.toBeInstanceOf(DomainValidationError);
    });

    it("persists anonymization and organization customers", async () => {
      const repo = createRepo();
      const org = createOrganizationCustomer({
        id: randomUUID(),
        tenantId: asTenantId(randomUUID()),
        organizationId: asOrganizationId(randomUUID()),
        customerNumber: createCustomerNumberFromToken(randomUUID()),
        organizationName: "Hotel Roma",
        createdAt: new Date("2026-08-02T10:00:00.000Z"),
      }).customer;
      await repo.save(org);
      const anonymized = anonymizeCustomer(
        org,
        new Date("2026-08-02T16:00:00.000Z")
      ).customer;
      await repo.save(anonymized, org.version);
      const loaded = await repo.findByCustomerNumber(
        org.tenantId,
        org.organizationId,
        org.customerNumber
      );
      expect(loaded?.status).toBe("ANONYMIZED");
      expect(loaded?.organizationName).toBeNull();
      expect(loaded?.email).toBeNull();
    });

    it("does not expose findAll or email/phone lookup", () => {
      const repo = createRepo();
      expect("findAll" in repo).toBe(false);
      expect("findByEmail" in repo).toBe(false);
      expect("findByPhone" in repo).toBe(false);
    });
  });
}

describe("InMemory customer repository", () => {
  registerCustomerRepositoryContractTests(
    "in-memory",
    () => new InMemoryCustomerRepository()
  );
});
