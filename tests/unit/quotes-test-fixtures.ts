export function sampleProposals() {
  return {
    priceProposal: {
      currency: "eur",
      pricingVersion: " pv-1 ",
      baseAmountMinor: 10000,
      taxAmountMinor: 0,
      vatAmountMinor: 2200,
      supplementsAmountMinor: 500,
      discountsAmountMinor: 200,
      totalCustomerAmountMinor: 12500,
    },
    policyProposal: {
      cancellationPolicyCode: " cancel.std ",
      waitingPolicyCode: "wait.15",
      noShowPolicyCode: "noshow.std",
      modificationPolicyCode: "mod.std",
      paymentTermsCode: "prepaid",
      refundReadiness: "policy_ref",
      nightSupplementApplicable: true,
      holidaySupplementApplicable: false,
    },
    contactProposal: {
      bookerDisplayName: " Booker ",
      bookerEmail: "Booker@Example.COM",
    },
    billingProposal: {
      billingPartyType: "individual",
      billingPartyName: " Booker ",
      billingCountryCode: "it",
    },
  };
}
