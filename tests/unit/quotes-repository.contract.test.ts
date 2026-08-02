import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  asActorId,
  asOrganizationId,
  asTenantId,
} from "@/lib/modules/identity";
import type { QuoteRepository } from "@/lib/modules/quotes";
import {
  acceptQuote,
  asQuoteId,
  createQuote,
  createQuoteNumberFromToken,
  DomainValidationError,
  DuplicateQuoteNumberError,
  issueQuote,
  openDraftQuoteVersion,
  QuoteHistoryImmutableError,
  QuoteVersionConflictError,
  rejectQuote,
} from "@/lib/modules/quotes";
import {
  assertAppendOnlyQuoteHistory,
  InMemoryQuoteRepository,
} from "@/lib/modules/quotes/infrastructure";
import { sampleProposals } from "./quotes-test-fixtures";

function buildDraft(input?: {
  tenantId?: ReturnType<typeof asTenantId>;
  organizationId?: ReturnType<typeof asOrganizationId>;
  quoteNumberToken?: string;
}) {
  return createQuote({
    id: asQuoteId(randomUUID()),
    tenantId: input?.tenantId ?? asTenantId(randomUUID()),
    organizationId: input?.organizationId ?? asOrganizationId(randomUUID()),
    quoteNumber: createQuoteNumberFromToken(
      input?.quoteNumberToken ?? randomUUID()
    ),
    mode: "MANUAL",
    createdByActorId: asActorId(randomUUID()),
    customerId: randomUUID(),
    createdAt: new Date("2026-08-02T10:00:00.000Z"),
    updatedAt: new Date("2026-08-02T10:00:00.000Z"),
  }).quote;
}

export function registerQuoteRepositoryContractTests(
  label: string,
  createRepo: () => QuoteRepository
) {
  describe(`Quote repository contract (${label})`, () => {
    it("saves and reads without incrementing version", async () => {
      const repo = createRepo();
      const quote = buildDraft();
      await repo.save(quote);
      const loaded = await repo.findById(
        quote.tenantId,
        quote.organizationId,
        quote.id
      );
      expect(loaded).toEqual(quote);
      expect(loaded?.version).toBe(0);
    });

    it("round-trips issued proposals with deep isolation", async () => {
      const repo = createRepo();
      const draft = buildDraft();
      await repo.save(draft);
      const issued = issueQuote(
        draft,
        sampleProposals(),
        new Date("2026-08-02T11:00:00.000Z"),
        new Date("2026-08-02T18:00:00.000Z")
      ).quote;
      await repo.save(issued, draft.version);

      const a = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      const b = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(a?.versions[0].priceProposal?.currency).toBe("EUR");
      expect(a?.versions[0].priceProposal).not.toBe(b?.versions[0].priceProposal);
    });

    it("isolates tenant and organization without leakage", async () => {
      const repo = createRepo();
      const quote = buildDraft();
      await repo.save(quote);
      await expect(
        repo.findById(
          asTenantId(randomUUID()),
          quote.organizationId,
          quote.id
        )
      ).resolves.toBeNull();
      await expect(
        repo.existsByQuoteNumber(
          quote.tenantId,
          asOrganizationId(randomUUID()),
          quote.quoteNumber
        )
      ).resolves.toBe(false);
    });

    it("enforces unique quoteNumber in scope", async () => {
      const repo = createRepo();
      const tenantId = asTenantId(randomUUID());
      const organizationId = asOrganizationId(randomUUID());
      const token = randomUUID();
      await repo.save(buildDraft({ tenantId, organizationId, quoteNumberToken: token }));
      await expect(
        repo.save(buildDraft({ tenantId, organizationId, quoteNumberToken: token }))
      ).rejects.toBeInstanceOf(DuplicateQuoteNumberError);
    });

    it("enforces OCC and leaves row unchanged on conflict", async () => {
      const repo = createRepo();
      const draft = buildDraft();
      await repo.save(draft);
      const issued = issueQuote(
        draft,
        sampleProposals(),
        new Date("2026-08-02T11:00:00.000Z"),
        new Date("2026-08-02T18:00:00.000Z")
      ).quote;
      await repo.save(issued, draft.version);

      const writerA = acceptQuote(
        issued,
        1,
        "cmd-accept-writer-a",
        new Date("2026-08-02T12:00:00.000Z")
      ).quote;
      const writerB = rejectQuote(
        issued,
        1,
        new Date("2026-08-02T12:00:00.000Z")
      ).quote;

      await repo.save(writerA, issued.version);
      await expect(repo.save(writerB, issued.version)).rejects.toBeInstanceOf(
        QuoteVersionConflictError
      );

      const loaded = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(loaded?.versions[0].status).toBe("ACCEPTED");
      expect(loaded?.version).toBe(writerA.version);
    });

    it("rejects rewrite of issued history and removal of versions", async () => {
      const repo = createRepo();
      const draft = buildDraft();
      await repo.save(draft);
      const issued = issueQuote(
        draft,
        sampleProposals(),
        new Date("2026-08-02T11:00:00.000Z"),
        new Date("2026-08-02T18:00:00.000Z")
      ).quote;
      await repo.save(issued, draft.version);

      const tampered = {
        ...issued,
        version: issued.version + 1,
        versions: [
          {
            ...issued.versions[0],
            priceProposal: {
              ...issued.versions[0].priceProposal!,
              baseAmountMinor: 1,
              totalCustomerAmountMinor: 2501,
            },
          },
        ],
      };
      await expect(repo.save(tampered, issued.version)).rejects.toBeInstanceOf(
        QuoteHistoryImmutableError
      );

      const shrunk = {
        ...issued,
        version: issued.version + 1,
        versions: [],
      };
      expect(() => assertAppendOnlyQuoteHistory(issued, shrunk as typeof issued)).toThrow(
        QuoteHistoryImmutableError
      );

      const opened = openDraftQuoteVersion(
        issued,
        new Date("2026-08-02T13:00:00.000Z")
      ).quote;
      await repo.save(opened, issued.version);
      const loaded = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(loaded?.versions).toHaveLength(2);
    });

    it("rejects forged rehydrate mutations without changing persisted state", async () => {
      const repo = createRepo();
      const draft = buildDraft();
      await repo.save(draft);
      const issued = issueQuote(
        draft,
        sampleProposals(),
        new Date("2026-08-02T11:00:00.000Z"),
        new Date("2026-08-02T18:00:00.000Z")
      ).quote;
      await repo.save(issued, draft.version);
      const accepted = acceptQuote(
        issued,
        1,
        "cmd-accept-persisted",
        new Date("2026-08-02T12:00:00.000Z")
      ).quote;
      await repo.save(accepted, issued.version);

      const before = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(before?.version).toBe(accepted.version);
      expect(before?.versions[0].status).toBe("ACCEPTED");
      expect(before?.versions[0].acceptanceCommandId).toBe(
        "cmd-accept-persisted"
      );

      const attempts: Array<{ label: string; mutate: (q: typeof accepted) => typeof accepted }> = [
        {
          label: "change historical proposal",
          mutate: (q) => ({
            ...q,
            version: q.version + 1,
            versions: [
              {
                ...q.versions[0],
                priceProposal: {
                  ...q.versions[0].priceProposal!,
                  baseAmountMinor: 999,
                  totalCustomerAmountMinor: 3499,
                },
              },
            ],
          }),
        },
        {
          label: "change timestamp",
          mutate: (q) => ({
            ...q,
            version: q.version + 1,
            versions: [
              {
                ...q.versions[0],
                issuedAt: new Date("2026-01-01T00:00:00.000Z"),
              },
            ],
          }),
        },
        {
          label: "change version number",
          mutate: (q) => ({
            ...q,
            version: q.version + 1,
            versions: [{ ...q.versions[0], versionNumber: 99 }],
          }),
        },
        {
          label: "remove version",
          mutate: (q) => ({
            ...q,
            version: q.version + 1,
            versions: [],
          }),
        },
        {
          label: "reorder versions",
          mutate: (q) => {
            const opened = openDraftQuoteVersion(
              issued,
              new Date("2026-08-02T13:00:00.000Z")
            ).quote;
            return {
              ...q,
              version: q.version + 1,
              versions: [opened.versions[1], opened.versions[0]],
            };
          },
        },
        {
          label: "change terminal status",
          mutate: (q) => ({
            ...q,
            version: q.version + 1,
            versions: [
              {
                ...q.versions[0],
                status: "ISSUED" as const,
                acceptedAt: null,
                acceptanceCommandId: null,
              },
            ],
          }),
        },
        {
          label: "non-consecutive version append",
          mutate: (q) => ({
            ...q,
            version: q.version + 1,
            versions: [
              ...q.versions,
              {
                ...issued.versions[0],
                versionNumber: 3,
                status: "DRAFT" as const,
                priceProposal: null,
                policyProposal: null,
                contactProposal: null,
                billingProposal: null,
                issuedAt: null,
                expiresAt: null,
                acceptedAt: null,
                acceptanceCommandId: null,
                rejectedAt: null,
                withdrawnAt: null,
                expiredAt: null,
                supersededAt: null,
              },
            ],
          }),
        },
        {
          label: "replace acceptanceCommandId",
          mutate: (q) => ({
            ...q,
            version: q.version + 1,
            versions: [
              {
                ...q.versions[0],
                acceptanceCommandId: "cmd-accept-forged-xx" as typeof q.versions[0]["acceptanceCommandId"],
              },
            ],
          }),
        },
      ];

      for (const attempt of attempts) {
        await expect(
          repo.save(attempt.mutate(accepted), accepted.version),
          attempt.label
        ).rejects.toBeInstanceOf(QuoteHistoryImmutableError);
      }

      const after = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(after).toEqual(before);
      expect(after?.versions[0].acceptanceCommandId).toBe(
        "cmd-accept-persisted"
      );
    });

    it("allows only one concurrent issue writer and one concurrent accept writer", async () => {
      const repo = createRepo();
      const draft = buildDraft();
      await repo.save(draft);

      const issueA = issueQuote(
        draft,
        sampleProposals(),
        new Date("2026-08-02T11:00:00.000Z"),
        new Date("2026-08-02T18:00:00.000Z")
      ).quote;
      const issueB = issueQuote(
        draft,
        {
          ...sampleProposals(),
          priceProposal: {
            ...sampleProposals().priceProposal,
            baseAmountMinor: 30000,
            totalCustomerAmountMinor: 32500,
          },
        },
        new Date("2026-08-02T11:05:00.000Z"),
        new Date("2026-08-02T19:00:00.000Z")
      ).quote;

      await repo.save(issueA, draft.version);
      await expect(repo.save(issueB, draft.version)).rejects.toBeInstanceOf(
        QuoteVersionConflictError
      );
      const afterIssue = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(afterIssue?.versions[0].priceProposal?.baseAmountMinor).toBe(
        sampleProposals().priceProposal.baseAmountMinor
      );
      expect(afterIssue?.version).toBe(issueA.version);

      const acceptA = acceptQuote(
        issueA,
        1,
        "cmd-accept-conc-a",
        new Date("2026-08-02T12:00:00.000Z")
      ).quote;
      const acceptB = acceptQuote(
        issueA,
        1,
        "cmd-accept-conc-b",
        new Date("2026-08-02T12:01:00.000Z")
      ).quote;
      await repo.save(acceptA, issueA.version);
      await expect(repo.save(acceptB, issueA.version)).rejects.toBeInstanceOf(
        QuoteVersionConflictError
      );
      const afterAccept = await repo.findById(
        draft.tenantId,
        draft.organizationId,
        draft.id
      );
      expect(afterAccept?.versions[0].status).toBe("ACCEPTED");
      expect(afterAccept?.versions[0].acceptanceCommandId).toBe(
        "cmd-accept-conc-a"
      );
      expect(afterAccept?.version).toBe(acceptA.version);
    });

    it("rejects quoteNumber mutation on update", async () => {
      const repo = createRepo();
      const draft = buildDraft();
      await repo.save(draft);
      const issued = issueQuote(
        draft,
        sampleProposals(),
        new Date("2026-08-02T11:00:00.000Z"),
        new Date("2026-08-02T18:00:00.000Z")
      ).quote;
      const withNewNumber = {
        ...issued,
        quoteNumber: createQuoteNumberFromToken(randomUUID()),
      };
      await expect(
        repo.save(withNewNumber, draft.version)
      ).rejects.toBeInstanceOf(DomainValidationError);
    });

    it("does not expose findAll", () => {
      const repo = createRepo();
      expect("findAll" in repo).toBe(false);
    });
  });
}

describe("InMemory quote repository", () => {
  registerQuoteRepositoryContractTests(
    "in-memory",
    () => new InMemoryQuoteRepository()
  );
});
