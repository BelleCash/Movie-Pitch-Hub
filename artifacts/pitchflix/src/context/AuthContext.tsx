import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserProfile, UserRole } from "@/types";

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
}

const LS_PROFILE_KEY = "pf-profile";
const LS_REDIRECT_KEY = "post_signup_redirect";

function readCachedProfile(): Partial<UserProfile> {
  try { return JSON.parse(localStorage.getItem(LS_PROFILE_KEY) ?? "{}"); }
  catch { return {}; }
}

function buildProfile(user: User): UserProfile {
  const meta = user.user_metadata ?? {};
  const cached = readCachedProfile();
  return {
    id: user.id,
    email: user.email ?? "",
    role: (meta.role ?? cached.role ?? "viewer") as UserRole,
    subscriptionTier: (meta.subscription_tier ?? cached.subscriptionTier ?? "free") as UserProfile["subscriptionTier"],
    isSubscribed: (meta.subscription_tier ?? "free") !== "free",
    username: (meta.username ?? cached.username ?? "") as string,
    bio: (meta.bio ?? cached.bio ?? "") as string,
    onboardingComplete: meta.onboarding_complete === true,
  };
}

function cacheProfile(profile: UserProfile) {
  try { localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile)); } catch {}
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const hydrateProfile = (u: User | null) => {
    if (!u) { setUserProfile(null); return; }
    const profile = buildProfile(u);
    setUserProfile(profile);
    cacheProfile(profile);
  };

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      hydrateProfile(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      hydrateProfile(session?.user ?? null);
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
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { role, subscription_tier: "free", onboarding_complete: false } },
    });
    if (!error) {
      try { localStorage.setItem(LS_REDIRECT_KEY, "onboarding"); } catch {}
    }
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    try { localStorage.removeItem(LS_PROFILE_KEY); } catch {}
    setUserProfile(null);
  };

  const updateRole = async (role: UserRole) => {
    if (!supabase || !user) return;
    await supabase.auth.updateUser({ data: { role } });
    setUserProfile((p) => {
      if (!p) return p;
      const next = { ...p, role };
      cacheProfile(next);
      return next;
    });
  };

  const completeOnboarding = async ({ username, bio, role }: OnboardingData) => {
    if (!supabase) return;
    await supabase.auth.updateUser({
      data: { username, bio, role, onboarding_complete: true },
    });
    setUserProfile((p) => {
      if (!p) return p;
      const next = { ...p, username, bio, role, onboardingComplete: true };
      cacheProfile(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, userProfile, authLoading, signIn, signUp, signOut, updateRole, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
