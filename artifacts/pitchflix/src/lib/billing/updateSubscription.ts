import { supabase } from "@/lib/supabase";
import type { SubscriptionTier } from "@/types";

export interface UpdateSubscriptionParams {
  userId: string;
  tier: SubscriptionTier;
  provider: string;
}

export interface UpdateSubscriptionResult {
  success: boolean;
  error?: string;
}

export async function updateSubscription(
  params: UpdateSubscriptionParams,
): Promise<UpdateSubscriptionResult> {
  if (!supabase) {
    return { success: false, error: "Supabase is not configured." };
  }

  const { userId, tier, provider } = params;

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_tier: tier,
      payout_provider: provider,
    })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { subscription_tier: tier },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  return { success: true };
}
