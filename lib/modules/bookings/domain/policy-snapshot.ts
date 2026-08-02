import { DomainValidationError } from "./errors";

/**
 * Commercial policy freeze at confirmation (MC-OS-032 §54).
 * Codes reference configured policies — not executable Pricing Engine rules.
 */
export type RefundReadiness = "NONE" | "ELIGIBLE_REF" | "POLICY_REF";

export type PolicySnapshot = {
  readonly cancellationPolicyCode: string;
  readonly waitingPolicyCode: string;
  readonly noShowPolicyCode: string;
  readonly modificationPolicyCode: string;
  readonly paymentTermsCode: string;
  readonly refundReadiness: RefundReadiness;
  readonly nightSupplementApplicable: boolean;
  readonly holidaySupplementApplicable: boolean;
};

export type PolicySnapshotInput = {
  cancellationPolicyCode: string;
  waitingPolicyCode: string;
  noShowPolicyCode: string;
  modificationPolicyCode: string;
  paymentTermsCode: string;
  refundReadiness: RefundReadiness | string;
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

export function createPolicySnapshot(input: PolicySnapshotInput): PolicySnapshot {
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
    refundReadiness: refundReadiness as RefundReadiness,
    nightSupplementApplicable: input.nightSupplementApplicable,
    holidaySupplementApplicable: input.holidaySupplementApplicable,
  });
}

export function clonePolicySnapshot(snapshot: PolicySnapshot): PolicySnapshot {
  return createPolicySnapshot({ ...snapshot });
}

export function serializePolicySnapshot(
  snapshot: PolicySnapshot
): Readonly<Record<string, string | boolean>> {
  return Object.freeze({
    cancellationPolicyCode: snapshot.cancellationPolicyCode,
    waitingPolicyCode: snapshot.waitingPolicyCode,
    noShowPolicyCode: snapshot.noShowPolicyCode,
    modificationPolicyCode: snapshot.modificationPolicyCode,
    paymentTermsCode: snapshot.paymentTermsCode,
    refundReadiness: snapshot.refundReadiness,
    nightSupplementApplicable: snapshot.nightSupplementApplicable,
    holidaySupplementApplicable: snapshot.holidaySupplementApplicable,
  });
}
