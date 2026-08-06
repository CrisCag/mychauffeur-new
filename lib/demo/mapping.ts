import type { QuoteBillingProposal } from "@/lib/modules/quotes";
import type { QuoteContactProposal } from "@/lib/modules/quotes";
import type { QuotePolicyProposal } from "@/lib/modules/quotes";
import type { QuotePriceProposal } from "@/lib/modules/quotes";

/**
 * Explicit field-by-field mapping Quote proposals → Booking commercial snapshots.
 * No blind casts. Demo prices remain labeled via pricingVersion.
 */
export function mapPriceProposalToSnapshotInput(proposal: QuotePriceProposal) {
  return {
    currency: proposal.currency,
    pricingVersion: proposal.pricingVersion,
    baseAmountMinor: proposal.baseAmountMinor,
    taxAmountMinor: proposal.taxAmountMinor,
    vatAmountMinor: proposal.vatAmountMinor,
    supplementsAmountMinor: proposal.supplementsAmountMinor,
    discountsAmountMinor: proposal.discountsAmountMinor,
    totalCustomerAmountMinor: proposal.totalCustomerAmountMinor,
  };
}

export function mapPolicyProposalToSnapshotInput(
  proposal: QuotePolicyProposal
) {
  return {
    cancellationPolicyCode: proposal.cancellationPolicyCode,
    waitingPolicyCode: proposal.waitingPolicyCode,
    noShowPolicyCode: proposal.noShowPolicyCode,
    modificationPolicyCode: proposal.modificationPolicyCode,
    paymentTermsCode: proposal.paymentTermsCode,
    refundReadiness: proposal.refundReadiness,
    nightSupplementApplicable: proposal.nightSupplementApplicable,
    holidaySupplementApplicable: proposal.holidaySupplementApplicable,
  };
}

export function mapContactProposalToSnapshotInput(
  proposal: QuoteContactProposal
) {
  return {
    ...(proposal.bookerDisplayName !== undefined
      ? { bookerDisplayName: proposal.bookerDisplayName }
      : {}),
    ...(proposal.bookerEmail !== undefined
      ? { bookerEmail: proposal.bookerEmail }
      : {}),
    ...(proposal.bookerPhone !== undefined
      ? { bookerPhone: proposal.bookerPhone }
      : {}),
    ...(proposal.primaryPassengerDisplayName !== undefined
      ? { primaryPassengerDisplayName: proposal.primaryPassengerDisplayName }
      : {}),
  };
}

export function mapBillingProposalToSnapshotInput(
  proposal: QuoteBillingProposal
) {
  return {
    billingPartyType: proposal.billingPartyType,
    billingPartyName: proposal.billingPartyName,
    billingCountryCode: proposal.billingCountryCode,
    ...(proposal.taxId !== undefined ? { taxId: proposal.taxId } : {}),
    ...(proposal.billingCity !== undefined
      ? { billingCity: proposal.billingCity }
      : {}),
    ...(proposal.billingPostalCode !== undefined
      ? { billingPostalCode: proposal.billingPostalCode }
      : {}),
  };
}
