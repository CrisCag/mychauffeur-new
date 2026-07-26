import type { ExternalIdentityRepository } from "../application/external-identity-repository";
import {
  normalizeIdentityProvider,
  type ExternalIdentity,
} from "../domain/external-identity";
import { DuplicateExternalIdentityError } from "../domain/errors";

/** In-memory ExternalIdentityRepository — not for production. */
export class InMemoryExternalIdentityRepository
  implements ExternalIdentityRepository
{
  private readonly byProviderSubject = new Map<string, ExternalIdentity>();

  private key(provider: string, providerSubject: string): string {
    return `${normalizeIdentityProvider(provider)}::${providerSubject.trim()}`;
  }

  async findByProviderSubject(
    provider: string,
    providerSubject: string
  ): Promise<ExternalIdentity | null> {
    return this.byProviderSubject.get(this.key(provider, providerSubject)) ?? null;
  }

  async save(identity: ExternalIdentity): Promise<void> {
    const mapKey = this.key(identity.provider, identity.providerSubject);
    const existing = this.byProviderSubject.get(mapKey);
    if (existing && existing.id !== identity.id) {
      throw new DuplicateExternalIdentityError();
    }

    // Replace any previous entry for the same id (upsert by id).
    for (const [key, value] of this.byProviderSubject.entries()) {
      if (value.id === identity.id) {
        this.byProviderSubject.delete(key);
      }
    }

    this.byProviderSubject.set(mapKey, identity);
  }
}
