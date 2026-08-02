import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import {
  acceptQuote,
  asQuoteId,
  asQuoteNumber,
  createQuote,
  createQuoteNumberFromToken,
  createQuotePriceProposal,
  DomainValidationError,
  expireQuote,
  InvalidQuoteStateTransitionError,
  issueQuote,
  MissingQuoteCustomerError,
  openDraftQuoteVersion,
  QuoteAcceptanceConflictError,
  QuoteExpiredError,
  rehydrateQuote,
  rejectQuote,
  serializeQuotePriceProposal,
  withdrawQuote,
} from "@/lib/modules/quotes";
import { sampleProposals } from "./quotes-test-fixtures";

function ids() {
  return {
    id: asQuoteId(randomUUID()),
    tenantId: asTenantId(randomUUID()),
    organizationId: asOrganizationId(randomUUID()),
    createdByActorId: asActorId(randomUUID()),
    quoteNumber: createQuoteNumberFromToken(randomUUID()),
  };
}

function draftQuote() {
  return createQuote({
    ...ids(),
    mode: "MANUAL",
    customerId: randomUUID(),
    createdAt: new Date("2026-08-02T10:00:00.000Z"),
    updatedAt: new Date("2026-08-02T10:00:00.000Z"),
  }).quote;
}

function issuedQuote() {
  const draft = draftQuote();
  const issuedAt = new Date("2026-08-02T11:00:00.000Z");
  const expiresAt = new Date("2026-08-02T18:00:00.000Z");
  return issueQuote(draft, sampleProposals(), issuedAt, expiresAt).quote;
}

describe("quotes domain — Step 7", () => {
  it("creates Quote with first DRAFT version at OCC version 0", () => {
    const { quote, events } = createQuote({
      ...ids(),
      mode: "INSTANT",
      customerId: randomUUID(),
      createdAt: new Date("2026-08-02T10:00:00.000Z"),
    });
    expect(quote.version).toBe(0);
    expect(quote.versions).toHaveLength(1);
    expect(quote.versions[0].status).toBe("DRAFT");
    expect(quote.versions[0].priceProposal).toBeNull();
    expect(events[0].type).toBe("Quote.DraftCreated");
  });

  it("rejects Quote without customer or guest", () => {
    expect(() =>
      createQuote({
        ...ids(),
        mode: "MANUAL",
        createdAt: new Date("2026-08-02T10:00:00.000Z"),
      })
    ).toThrow(MissingQuoteCustomerError);
  });

  it("validates QuotePriceProposal safe integers and total coherence", () => {
    const price = createQuotePriceProposal(sampleProposals().priceProposal);
    expect(price.currency).toBe("EUR");
    expect(() =>
      createQuotePriceProposal({
        ...sampleProposals().priceProposal,
        baseAmountMinor: Number.NaN,
      })
    ).toThrow(DomainValidationError);
    expect(() =>
      createQuotePriceProposal({
        ...sampleProposals().priceProposal,
        baseAmountMinor: 1.5,
      })
    ).toThrow(DomainValidationError);
    const serialized = serializeQuotePriceProposal(price);
    expect(() => {
      // @ts-expect-error intentional
      serialized.currency = "USD";
    }).toThrow();
  });

  it("issues DRAFT with complete proposals and required expiresAt", () => {
    const draft = draftQuote();
    const issuedAt = new Date("2026-08-02T11:00:00.000Z");
    const expiresAt = new Date("2026-08-02T18:00:00.000Z");
    const { quote, events } = issueQuote(
      draft,
      sampleProposals(),
      issuedAt,
      expiresAt
    );
    expect(quote.version).toBe(1);
    expect(quote.versions[0].status).toBe("ISSUED");
    expect(quote.versions[0].priceProposal?.totalCustomerAmountMinor).toBe(
      12500
    );
    expect(events.some((e) => e.type === "Quote.Issued")).toBe(true);
    expect(draft.versions[0].status).toBe("DRAFT");
  });

  it("rejects issue with missing proposals or invalid expiry", () => {
    const draft = draftQuote();
    const issuedAt = new Date("2026-08-02T11:00:00.000Z");
    expect(() =>
      issueQuote(
        draft,
        {
          ...sampleProposals(),
          // @ts-expect-error partial
          billingProposal: null,
        },
        issuedAt,
        new Date("2026-08-02T18:00:00.000Z")
      )
    ).toThrow();
    expect(() =>
      issueQuote(
        draft,
        sampleProposals(),
        issuedAt,
        issuedAt
      )
    ).toThrow(DomainValidationError);
  });

  it("accepts ISSUED version and supports idempotent acceptanceCommandId", () => {
    const issued = issuedQuote();
    const at = new Date("2026-08-02T12:00:00.000Z");
    const first = acceptQuote(issued, 1, "cmd-accept-001", at);
    expect(first.quote.version).toBe(issued.version + 1);
    expect(first.quote.versions[0].status).toBe("ACCEPTED");
    expect(first.events[0].type).toBe("Quote.Accepted");

    const retry = acceptQuote(first.quote, 1, "cmd-accept-001", at);
    expect(retry.quote).toBe(first.quote);
    expect(retry.quote.version).toBe(first.quote.version);
    expect(retry.events).toHaveLength(0);

    expect(() =>
      acceptQuote(first.quote, 1, "cmd-accept-OTHER", at)
    ).toThrow(QuoteAcceptanceConflictError);
  });

  it("rejects accept at exact expiresAt or later", () => {
    const issued = issuedQuote();
    expect(() =>
      acceptQuote(
        issued,
        1,
        "cmd-accept-exact-exp",
        new Date("2026-08-02T18:00:00.000Z")
      )
    ).toThrow(QuoteExpiredError);
    expect(() =>
      acceptQuote(
        issued,
        1,
        "cmd-accept-after-exp",
        new Date("2026-08-02T19:00:00.000Z")
      )
    ).toThrow(QuoteExpiredError);
  });

  it("supports reject, withdraw, expire and forbids terminal reopen", () => {
    const rejected = rejectQuote(
      issuedQuote(),
      1,
      new Date("2026-08-02T12:00:00.000Z")
    ).quote;
    expect(rejected.versions[0].status).toBe("REJECTED");
    expect(() =>
      acceptQuote(rejected, 1, "cmd-accept-after-reject", new Date("2026-08-02T12:30:00.000Z"))
    ).toThrow(InvalidQuoteStateTransitionError);

    const withdrawn = withdrawQuote(
      issuedQuote(),
      1,
      new Date("2026-08-02T12:00:00.000Z")
    ).quote;
    expect(withdrawn.versions[0].status).toBe("WITHDRAWN");

    const expired = expireQuote(
      issuedQuote(),
      1,
      new Date("2026-08-02T18:00:00.000Z")
    ).quote;
    expect(expired.versions[0].status).toBe("EXPIRED");
  });

  it("opens a new DRAFT, issues it, and supersedes previous ISSUED", () => {
    const issued = issuedQuote();
    const opened = openDraftQuoteVersion(
      issued,
      new Date("2026-08-02T13:00:00.000Z")
    ).quote;
    expect(opened.versions).toHaveLength(2);
    expect(opened.versions[1].status).toBe("DRAFT");
    expect(opened.version).toBe(issued.version + 1);

    const reissued = issueQuote(
      opened,
      {
        ...sampleProposals(),
        priceProposal: {
          ...sampleProposals().priceProposal,
          baseAmountMinor: 20000,
          totalCustomerAmountMinor: 22500,
        },
      },
      new Date("2026-08-02T14:00:00.000Z"),
      new Date("2026-08-03T14:00:00.000Z")
    ).quote;

    expect(reissued.versions[0].status).toBe("SUPERSEDED");
    expect(reissued.versions[1].status).toBe("ISSUED");
    expect(reissued.versions[1].versionNumber).toBe(2);
    expect(reissued.versions.filter((v) => v.status === "ISSUED")).toHaveLength(
      1
    );
  });

  it("does not mutate prior instance; freezes proposals deeply", () => {
    const draft = draftQuote();
    const input = sampleProposals();
    const issued = issueQuote(
      draft,
      input,
      new Date("2026-08-02T11:00:00.000Z"),
      new Date("2026-08-02T18:00:00.000Z")
    ).quote;
    expect(draft.versions[0].status).toBe("DRAFT");
    input.priceProposal.currency = "USD";
    expect(issued.versions[0].priceProposal?.currency).toBe("EUR");
    expect(() => {
      // @ts-expect-error intentional
      issued.versions[0].status = "ACCEPTED";
    }).toThrow();
    expect(() => {
      // @ts-expect-error intentional
      issued.versions[0].priceProposal.currency = "USD";
    }).toThrow();
  });

  it("rehydrate preserves OCC version and rejects history gaps", () => {
    const issued = issuedQuote();
    const again = rehydrateQuote({ ...issued, versions: [...issued.versions] });
    expect(again.version).toBe(issued.version);
    expect(() =>
      rehydrateQuote({
        ...issued,
        versions: [issued.versions[0], issued.versions[0]],
      })
    ).toThrow(DomainValidationError);
  });

  it("normalizes QuoteNumber", () => {
    expect(asQuoteNumber(" qt-abcdef12 ")).toBe("QT-ABCDEF12");
  });

  it("freezes domain events and does not emit on idempotent accept retry", () => {
    const issued = issuedQuote();
    const first = acceptQuote(
      issued,
      1,
      "cmd-accept-evt-01",
      new Date("2026-08-02T12:00:00.000Z")
    );
    expect(() => {
      // @ts-expect-error intentional
      first.events.push(first.events[0]);
    }).toThrow();
    expect(() => {
      // @ts-expect-error intentional
      first.events[0].type = "Quote.Rejected";
    }).toThrow();
    const retry = acceptQuote(
      first.quote,
      1,
      "cmd-accept-evt-01",
      new Date("2026-08-02T12:00:00.000Z")
    );
    expect(retry.events).toHaveLength(0);
  });

  it("forbids openDraft after ACCEPTED", () => {
    const accepted = acceptQuote(
      issuedQuote(),
      1,
      "cmd-accept-final-01",
      new Date("2026-08-02T12:00:00.000Z")
    ).quote;
    expect(() =>
      openDraftQuoteVersion(accepted, new Date("2026-08-02T13:00:00.000Z"))
    ).toThrow(InvalidQuoteStateTransitionError);
  });
});
