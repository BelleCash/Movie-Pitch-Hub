// @refresh reset
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { SubscriptionTier, UserRole } from "@/types";
import { billingService } from "@/services/billing/billingService";
import { supabase } from "@/lib/supabase";

interface BillingState {
  tier: SubscriptionTier;
  isSubscribed: boolean;
  billingLoading: boolean;
  subscribe: (tier: SubscriptionTier, provider?: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  syncFromSupabase: (userId: string) => Promise<void>;
}

const LS_KEY = "pf-billing";

function readCache(): { tier: SubscriptionTier; isSubscribed: boolean } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { tier: "free", isSubscribed: false };
}

function writeCache(tier: SubscriptionTier, isSubscribed: boolean) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ tier, isSubscribed })); } catch {}
}

const BillingContext = createContext<BillingState | null>(null);

export function BillingProvider({ children, userId, userRole }: {
  children: React.ReactNode;
  userId?: string;
  userRole?: UserRole;
}) {
  const cached = readCache();
  const [tier, setTier] = useState<SubscriptionTier>(cached.tier);
  const [isSubscribed, setIsSubscribed] = useState(cached.isSubscribed);
  const [billingLoading, setBillingLoading] = useState(!!userId);

  const persist = (t: SubscriptionTier, sub: boolean) => {
    setTier(t); setIsSubscribed(sub); writeCache(t, sub);
  };

  const syncFromSupabase = useCallback(async (uid: string) => {
    if (!supabase) return;
    try {
      const { data } = await supabase.auth.getUser();
      const meta = data?.user?.user_metadata ?? {};
      const t = (meta.subscription_tier ?? "free") as SubscriptionTier;
      const sub = t !== "free";
      persist(t, sub);
    } catch {}
  }, []);

  useEffect(() => {
    if (userId) {
      setBillingLoading(true);
      syncFromSupabase(userId).finally(() => setBillingLoading(false));
    } else {
      const c = readCache();
      persist(c.tier, c.isSubscribed);
      setBillingLoading(false);
    }
  }, [userId, syncFromSupabase]);

  const subscribe = useCallback(async (newTier: SubscriptionTier, provider?: string) => {
    const result = await billingService.subscribe({ provider, tier: newTier });
    persist(result.tier, result.isSubscribed);
    if (supabase && userId) {
      await supabase.auth.updateUser({ data: { subscription_tier: result.tier } });
    }
  }, [userId]);

  const cancelSubscription = useCallback(async () => {
    const result = await billingService.cancel();
    persist(result.tier, result.isSubscribed);
    if (supabase && userId) {
      await supabase.auth.updateUser({ data: { subscription_tier: "free" } });
    }
  }, [userId]);

  return (
    <BillingContext.Provider value={{ tier, isSubscribed, billingLoading, subscribe, cancelSubscription, syncFromSupabase }}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error("useBilling must be used within BillingProvider");
  return ctx;
}
