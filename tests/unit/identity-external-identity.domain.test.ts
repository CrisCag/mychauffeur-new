import { describe, expect, it } from "vitest";
import {
  asExternalIdentityId,
  asUserId,
  createExternalIdentity,
  DomainValidationError,
  normalizeIdentityProvider,
} from "@/lib/modules/identity";

describe("ExternalIdentity domain", () => {
  it("creates with normalized provider", () => {
    const identity = createExternalIdentity({
      id: asExternalIdentityId("33333333-3333-3333-3333-333333333333"),
      provider: " Supabase ",
      providerSubject: " sub-1 ",
      userId: asUserId("22222222-2222-2222-2222-222222222222"),
    });

    expect(identity.provider).toBe("supabase");
    expect(identity.providerSubject).toBe("sub-1");
  });

  it("requires provider and providerSubject", () => {
    expect(() =>
      createExternalIdentity({
        id: asExternalIdentityId("33333333-3333-3333-3333-333333333333"),
        provider: " ",
        providerSubject: "sub",
        userId: asUserId("22222222-2222-2222-2222-222222222222"),
      })
    ).toThrow(DomainValidationError);

    expect(() =>
      createExternalIdentity({
        id: asExternalIdentityId("33333333-3333-3333-3333-333333333333"),
        provider: "dev",
        providerSubject: " ",
        userId: asUserId("22222222-2222-2222-2222-222222222222"),
      })
    ).toThrow(DomainValidationError);
  });

  it("normalizes provider consistently", () => {
    expect(normalizeIdentityProvider("DEV_STUB")).toBe("dev_stub");
  });
});
