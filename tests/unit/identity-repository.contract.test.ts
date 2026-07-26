import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asExternalIdentityId,
  asPersonId,
  asUserId,
  createExternalIdentity,
  createPerson,
  createUser,
  DuplicateExternalIdentityError,
} from "@/lib/modules/identity";
import {
  InMemoryExternalIdentityRepository,
  InMemoryPersonRepository,
  InMemoryUserRepository,
} from "@/lib/modules/identity/infrastructure";

describe("Identity in-memory repository contracts", () => {
  it("saves and finds Person", async () => {
    const persons = new InMemoryPersonRepository();
    const person = createPerson({
      id: asPersonId(randomUUID()),
      firstName: "Ada",
      lastName: "Lovelace",
    });
    await persons.save(person);
    await expect(persons.findById(person.id)).resolves.toEqual(person);
    await expect(persons.findById(asPersonId(randomUUID()))).resolves.toBeNull();
  });

  it("associates User to Person and finds by personId", async () => {
    const persons = new InMemoryPersonRepository();
    const users = new InMemoryUserRepository();
    const person = createPerson({
      id: asPersonId(randomUUID()),
      firstName: "Ada",
      lastName: "Lovelace",
    });
    const user = createUser({
      id: asUserId(randomUUID()),
      personId: person.id,
    });
    await persons.save(person);
    await users.save(user);

    await expect(users.findById(user.id)).resolves.toEqual(user);
    await expect(users.findByPersonId(person.id)).resolves.toEqual(user);
    await expect(users.findByPersonId(asPersonId(randomUUID()))).resolves.toBeNull();
  });

  it("looks up ExternalIdentity by provider+subject and rejects duplicates", async () => {
    const externalIdentities = new InMemoryExternalIdentityRepository();
    const userId = asUserId(randomUUID());
    const identity = createExternalIdentity({
      id: asExternalIdentityId(randomUUID()),
      provider: "dev",
      providerSubject: "subject-1",
      userId,
    });
    await externalIdentities.save(identity);

    await expect(
      externalIdentities.findByProviderSubject("DEV", "subject-1")
    ).resolves.toEqual(identity);

    await expect(
      externalIdentities.save(
        createExternalIdentity({
          id: asExternalIdentityId(randomUUID()),
          provider: "dev",
          providerSubject: "subject-1",
          userId,
        })
      )
    ).rejects.toBeInstanceOf(DuplicateExternalIdentityError);
  });

  it("does not expose a global findAll enumeration API", () => {
    const persons = new InMemoryPersonRepository();
    const users = new InMemoryUserRepository();
    const externalIdentities = new InMemoryExternalIdentityRepository();

    expect("findAll" in persons).toBe(false);
    expect("findAll" in users).toBe(false);
    expect("findAll" in externalIdentities).toBe(false);
  });
});
