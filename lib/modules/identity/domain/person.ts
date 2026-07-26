import type { PersonId } from "./identifiers";
import { DomainValidationError } from "./errors";

export type Person = {
  readonly id: PersonId;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type CreatePersonInput = {
  id: PersonId;
  firstName: string;
  lastName: string;
  displayName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
};

function normalizeName(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new DomainValidationError(`${field} is required`);
  }
  if (normalized.length > 100) {
    throw new DomainValidationError(`${field} is too long`);
  }
  return normalized;
}

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 1) {
    throw new DomainValidationError("Person version must be a positive integer");
  }
  return version;
}

export function createPerson(input: CreatePersonInput): Person {
  const firstName = normalizeName(input.firstName, "firstName");
  const lastName = normalizeName(input.lastName, "lastName");
  const displayName =
    input.displayName !== undefined
      ? normalizeName(input.displayName, "displayName")
      : `${firstName} ${lastName}`.trim();
  const now = input.createdAt ?? new Date();

  return Object.freeze({
    id: input.id,
    firstName,
    lastName,
    displayName,
    createdAt: now,
    updatedAt: input.updatedAt ?? now,
    version: assertVersion(input.version ?? 1),
  });
}

export type PersonUpdatePatch = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  updatedAt?: Date;
};

export function updatePerson(person: Person, patch: PersonUpdatePatch): Person {
  const firstName =
    patch.firstName !== undefined
      ? normalizeName(patch.firstName, "firstName")
      : person.firstName;
  const lastName =
    patch.lastName !== undefined
      ? normalizeName(patch.lastName, "lastName")
      : person.lastName;
  const displayName =
    patch.displayName !== undefined
      ? normalizeName(patch.displayName, "displayName")
      : person.displayName;

  return Object.freeze({
    ...person,
    firstName,
    lastName,
    displayName,
    updatedAt: patch.updatedAt ?? new Date(),
    version: assertVersion(person.version + 1),
  });
}
