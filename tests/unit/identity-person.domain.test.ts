import { describe, expect, it } from "vitest";
import {
  asPersonId,
  createPerson,
  DomainValidationError,
  updatePerson,
} from "@/lib/modules/identity";

describe("Person domain", () => {
  it("creates a valid Person with version 1", () => {
    const person = createPerson({
      id: asPersonId("11111111-1111-1111-1111-111111111111"),
      firstName: " Ada ",
      lastName: " Lovelace ",
    });

    expect(person.firstName).toBe("Ada");
    expect(person.lastName).toBe("Lovelace");
    expect(person.displayName).toBe("Ada Lovelace");
    expect(person.version).toBe(1);
  });

  it("requires firstName and lastName", () => {
    expect(() =>
      createPerson({
        id: asPersonId("11111111-1111-1111-1111-111111111111"),
        firstName: " ",
        lastName: "Lovelace",
      })
    ).toThrow(DomainValidationError);
  });

  it("increments version on update", () => {
    const person = createPerson({
      id: asPersonId("11111111-1111-1111-1111-111111111111"),
      firstName: "Ada",
      lastName: "Lovelace",
    });
    const updated = updatePerson(person, { displayName: "A. Lovelace" });
    expect(updated.version).toBe(2);
    expect(updated.displayName).toBe("A. Lovelace");
  });
});
