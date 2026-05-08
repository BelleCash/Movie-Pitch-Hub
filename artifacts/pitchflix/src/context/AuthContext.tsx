import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserProfile, UserRole, PayoutProvider } from "@/types";

interface OnboardingData { username: string; bio: string; role: UserRole }

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=7c3aed&backgroundType=solid`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchProfile = async (u: User): Promise<UserProfile> => {
    const meta = u.user_metadata ?? {};

    if (supabase) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      if (data) {
        return {
          id: u.id,
          email: u.email ?? "",
          role: (data.role ?? meta.role ?? "viewer") as UserRole,
          subscriptionTier: (data.subscription_tier ?? meta.subscription_tier ?? "free") as UserProfile["subscriptionTier"],
          isSubscribed: (data.subscription_tier ?? "free") !== "free",
          username: data.username ?? meta.username ?? "",
          bio: data.bio ?? meta.bio ?? "",
          avatarUrl: data.avatar_url ?? avatarUrl(data.username || u.email?.split("@")[0] || u.id),
          onboardingComplete: data.onboarding_complete ?? meta.onboarding_complete ?? false,
          walletConnected: data.wallet_connected ?? false,
          payoutProvider: (data.payout_provider ?? null) as PayoutProvider | null,
          payoutAccount: data.payout_account ?? "",
          investorWalletBalance: data.investor_wallet_balance ?? 0,
          creatorEarnings: data.creator_earnings ?? 0,
        };
      }
    }

    const username = meta.username ?? u.email?.split("@")[0] ?? "";
    return {
      id: u.id,
      email: u.email ?? "",
      role: (meta.role ?? "viewer") as UserRole,
      subscriptionTier: (meta.subscription_tier ?? "free") as UserProfile["subscriptionTier"],
      isSubscribed: (meta.subscription_tier ?? "free") !== "free",
      username,
      bio: meta.bio ?? "",
      avatarUrl: avatarUrl(username || u.id),
      onboardingComplete: meta.onboarding_complete === true,
      walletConnected: false,
      payoutProvider: null,
      payoutAccount: "",
      investorWalletBalance: 0,
      creatorEarnings: 0,
    };
  };

  const hydrateProfile = async (u: User | null) => {
    if (!u) { setUserProfile(null); return; }
    const profile = await fetchProfile(u);
    setUserProfile(profile);
  };

  const refreshProfile = async () => {
    if (!user) return;
    await hydrateProfile(user);
  };

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      await hydrateProfile(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await hydrateProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, role: UserRole = "viewer") => {
    if (!supabase) return { error: "Supabase not configured" };
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { role, subscription_tier: "free", onboarding_complete: false } },
    });
    if (!error && data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
          role,
          subscription_tier: "free",
          onboarding_complete: false,
          avatar_url: avatarUrl(email.split("@")[0]),
        }, { onConflict: "id" });
      } catch {}
      try { localStorage.setItem("post_signup_redirect", "onboarding"); } catch {}
    }
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  const updateRole = async (role: UserRole) => {
    if (!supabase || !user) return;
    await supabase.auth.updateUser({ data: { role } });
    if (supabase) await supabase.from("profiles").upsert({ id: user.id, role }, { onConflict: "id" });
    setUserProfile((p) => p ? { ...p, role } : p);
  };

  const completeOnboarding = async ({ username, bio, role }: OnboardingData) => {
    if (!supabase || !user) return;
    const avatar = avatarUrl(username || user.email?.split("@")[0] || user.id);
    await supabase.auth.updateUser({ data: { username, bio, role, onboarding_complete: true } });
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      username,
      bio,
      role,
      avatar_url: avatar,
      onboarding_complete: true,
    }, { onConflict: "id" });
    setUserProfile((p) => p ? { ...p, username, bio, role, avatarUrl: avatar, onboardingComplete: true } : p);
  };

  return (
    <AuthContext.Provider value={{ user, session, userProfile, authLoading, signIn, signUp, signOut, updateRole, completeOnboarding, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
