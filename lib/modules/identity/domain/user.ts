import type { PersonId, UserId } from "./identifiers";
import { DomainValidationError } from "./errors";
import { isUserStatus, type UserStatus } from "./user-status";

export type User = {
  readonly id: UserId;
  readonly personId: PersonId;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type CreateUserInput = {
  id: UserId;
  personId: PersonId;
  status?: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
};

function assertVersion(version: number): number {
  if (!Number.isInteger(version) || version < 1) {
    throw new DomainValidationError("User version must be a positive integer");
  }
  return version;
}

export function createUser(input: CreateUserInput): User {
  const status = input.status ?? "ACTIVE";
  if (!isUserStatus(status)) {
    throw new DomainValidationError("Invalid User status");
  }
  const now = input.createdAt ?? new Date();

  return Object.freeze({
    id: input.id,
    personId: input.personId,
    status,
    createdAt: now,
    updatedAt: input.updatedAt ?? now,
    version: assertVersion(input.version ?? 1),
  });
}

export type UserUpdatePatch = {
  status?: UserStatus;
  updatedAt?: Date;
};

export function updateUser(user: User, patch: UserUpdatePatch): User {
  if (patch.status !== undefined && !isUserStatus(patch.status)) {
    throw new DomainValidationError("Invalid User status");
  }

  return Object.freeze({
    ...user,
    status: patch.status ?? user.status,
    updatedAt: patch.updatedAt ?? new Date(),
    version: assertVersion(user.version + 1),
  });
}
