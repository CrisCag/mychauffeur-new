import { DomainValidationError } from "./errors";

export type QuoteRefundReadiness = "NONE" | "ELIGIBLE_REF" | "POLICY_REF";

export type QuotePolicyProposal = {
  readonly cancellationPolicyCode: string;
  readonly waitingPolicyCode: string;
  readonly noShowPolicyCode: string;
  readonly modificationPolicyCode: string;
  readonly paymentTermsCode: string;
  readonly refundReadiness: QuoteRefundReadiness;
  readonly nightSupplementApplicable: boolean;
  readonly holidaySupplementApplicable: boolean;
};

export type QuotePolicyProposalInput = {
  cancellationPolicyCode: string;
  waitingPolicyCode: string;
  noShowPolicyCode: string;
  modificationPolicyCode: string;
  paymentTermsCode: string;
  refundReadiness: QuoteRefundReadiness | string;
  nightSupplementApplicable: boolean;
  holidaySupplementApplicable: boolean;
};

const REFUND_READINESS = ["NONE", "ELIGIBLE_REF", "POLICY_REF"] as const;

function assertPolicyCode(value: string, field: string): string {
  const normalized = value.trim().toUpperCase();
  if (!normalized || normalized.length > 64) {
    throw new DomainValidationError(`${field} is invalid`);
  }
  if (!/^[A-Z0-9._-]+$/.test(normalized)) {
    throw new DomainValidationError(`${field} is invalid`);
  }
  return normalized;
}

export function createQuotePolicyProposal(
  input: QuotePolicyProposalInput
): QuotePolicyProposal {
  const refundReadiness = String(input.refundReadiness).trim().toUpperCase();
  if (!(REFUND_READINESS as readonly string[]).includes(refundReadiness)) {
    throw new DomainValidationError("refundReadiness is invalid");
  }
  if (typeof input.nightSupplementApplicable !== "boolean") {
    throw new DomainValidationError("nightSupplementApplicable is invalid");
  }
  if (typeof input.holidaySupplementApplicable !== "boolean") {
    throw new DomainValidationError("holidaySupplementApplicable is invalid");
  }

  return Object.freeze({
    cancellationPolicyCode: assertPolicyCode(
      input.cancellationPolicyCode,
      "cancellationPolicyCode"
    ),
    waitingPolicyCode: assertPolicyCode(
      input.waitingPolicyCode,
      "waitingPolicyCode"
    ),
    noShowPolicyCode: assertPolicyCode(
      input.noShowPolicyCode,
      "noShowPolicyCode"
    ),
    modificationPolicyCode: assertPolicyCode(
      input.modificationPolicyCode,
      "modificationPolicyCode"
    ),
    paymentTermsCode: assertPolicyCode(
      input.paymentTermsCode,
      "paymentTermsCode"
    ),
    refundReadiness: refundReadiness as QuoteRefundReadiness,
    nightSupplementApplicable: input.nightSupplementApplicable,
    holidaySupplementApplicable: input.holidaySupplementApplicable,
  });
}

export function cloneQuotePolicyProposal(
  proposal: QuotePolicyProposal
): QuotePolicyProposal {
  return createQuotePolicyProposal({ ...proposal });
}

export function serializeQuotePolicyProposal(
  proposal: QuotePolicyProposal
): Readonly<Record<string, string | boolean>> {
  return Object.freeze({
    cancellationPolicyCode: proposal.cancellationPolicyCode,
    waitingPolicyCode: proposal.waitingPolicyCode,
    noShowPolicyCode: proposal.noShowPolicyCode,
    modificationPolicyCode: proposal.modificationPolicyCode,
    paymentTermsCode: proposal.paymentTermsCode,
    refundReadiness: proposal.refundReadiness,
    nightSupplementApplicable: proposal.nightSupplementApplicable,
    holidaySupplementApplicable: proposal.holidaySupplementApplicable,
  });
}
