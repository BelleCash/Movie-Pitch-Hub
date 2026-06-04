import type { BillingProvider, SubscriptionTier, SubscriptionStatus } from "@/types";

export const opayProvider: BillingProvider = {
  name: "opay",

  async subscribe(tier: SubscriptionTier): Promise<SubscriptionStatus> {
    await new Promise((r) => setTimeout(r, 800));
    return { tier, isSubscribed: tier !== "free", provider: "opay", mockMode: true };
  },

  async cancel(): Promise<SubscriptionStatus> {
    await new Promise((r) => setTimeout(r, 500));
    return { tier: "free", isSubscribed: false, provider: "opay", mockMode: true };
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    return { tier: "free", isSubscribed: false, provider: "opay", mockMode: true };
  },
};
