import type { UserId } from "./identifiers";
import { DomainValidationError } from "./errors";

declare const externalIdentityIdBrand: unique symbol;

export type ExternalIdentityId = string & {
  readonly [externalIdentityIdBrand]: "ExternalIdentityId";
};

export function asExternalIdentityId(value: string): ExternalIdentityId {
  return value as ExternalIdentityId;
}

/**
 * Maps an external authentication subject to a User.
 * No tokens or credentials are stored.
 */
export type ExternalIdentity = {
  readonly id: ExternalIdentityId;
  readonly provider: string;
  readonly providerSubject: string;
  readonly userId: UserId;
  readonly createdAt: Date;
};

export type CreateExternalIdentityInput = {
  id: ExternalIdentityId;
  provider: string;
  providerSubject: string;
  userId: UserId;
  createdAt?: Date;
};

export function normalizeIdentityProvider(provider: string): string {
  const normalized = provider.trim().toLowerCase();
  if (!normalized) {
    throw new DomainValidationError("provider is required");
  }
  if (normalized.length > 64) {
    throw new DomainValidationError("provider is too long");
  }
  return normalized;
}

function normalizeProviderSubject(providerSubject: string): string {
  const normalized = providerSubject.trim();
  if (!normalized) {
    throw new DomainValidationError("providerSubject is required");
  }
  if (normalized.length > 256) {
    throw new DomainValidationError("providerSubject is too long");
  }
  return normalized;
}

export function createExternalIdentity(
  input: CreateExternalIdentityInput
): ExternalIdentity {
  return Object.freeze({
    id: input.id,
    provider: normalizeIdentityProvider(input.provider),
    providerSubject: normalizeProviderSubject(input.providerSubject),
    userId: input.userId,
    createdAt: input.createdAt ?? new Date(),
  });
}
