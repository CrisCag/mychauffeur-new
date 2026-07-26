/**
 * Infrastructure entry point for identity module.
 * Explicit and separate from the Domain public contract.
 * Development/test adapters only in Step 2 — do not wire to routes/UI.
 */

export { DevelopmentAuthenticationProvider } from "./development-authentication-provider";
export { InMemoryPersonRepository } from "./in-memory-person-repository";
export { InMemoryUserRepository } from "./in-memory-user-repository";
export { InMemoryExternalIdentityRepository } from "./in-memory-external-identity-repository";
