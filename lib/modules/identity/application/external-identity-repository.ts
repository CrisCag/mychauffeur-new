import type { ExternalIdentity } from "../domain/external-identity";

export interface ExternalIdentityRepository {
  findByProviderSubject(
    provider: string,
    providerSubject: string
  ): Promise<ExternalIdentity | null>;
  save(identity: ExternalIdentity): Promise<void>;
}
