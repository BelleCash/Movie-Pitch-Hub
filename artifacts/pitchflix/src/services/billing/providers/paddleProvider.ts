import type { BillingProvider, SubscriptionTier, SubscriptionStatus } from "@/types";

export const paddleProvider: BillingProvider = {
  name: "paddle",

  async subscribe(tier: SubscriptionTier): Promise<SubscriptionStatus> {
    await new Promise((r) => setTimeout(r, 800));
    return { tier, isSubscribed: tier !== "free", provider: "paddle", mockMode: true };
  },

  async cancel(): Promise<SubscriptionStatus> {
    await new Promise((r) => setTimeout(r, 500));
    return { tier: "free", isSubscribed: false, provider: "paddle", mockMode: true };
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    return { tier: "free", isSubscribed: false, provider: "paddle", mockMode: true };
  },
};
