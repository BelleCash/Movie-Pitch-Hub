import type { BillingProvider, SubscriptionTier, SubscriptionStatus } from "@/types";
import { stripeProvider } from "./providers/stripeProvider";
import { paystackProvider } from "./providers/paystackProvider";
import { lemonSqueezyProvider } from "./providers/lemonSqueezyProvider";
import { paddleProvider } from "./providers/paddleProvider";
import { opayProvider } from "./providers/opayProvider";
import { moniepointProvider } from "./providers/moniepointProvider";

const PROVIDERS: Record<string, BillingProvider> = {
  stripe: stripeProvider,
  paystack: paystackProvider,
  lemonsqueezy: lemonSqueezyProvider,
  paddle: paddleProvider,
  opay: opayProvider,
  moniepoint: moniepointProvider,
};

const DEFAULT_PROVIDER = "stripe";

function getProvider(name?: string): BillingProvider {
  return PROVIDERS[name ?? DEFAULT_PROVIDER] ?? stripeProvider;
}

export const billingService = {
  subscribe(opts: { provider?: string; tier: SubscriptionTier }): Promise<SubscriptionStatus> {
    return getProvider(opts.provider).subscribe(opts.tier);
  },

  cancel(opts?: { provider?: string }): Promise<SubscriptionStatus> {
    return getProvider(opts?.provider).cancel();
  },

  getStatus(opts?: { provider?: string }): Promise<SubscriptionStatus> {
    return getProvider(opts?.provider).getSubscriptionStatus();
  },

  listProviders(): string[] {
    return Object.keys(PROVIDERS);
  },
};
