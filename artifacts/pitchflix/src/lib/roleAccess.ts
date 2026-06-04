import type { UserRole, SubscriptionTier } from "@/types";

export type AccessKey =
  | "dashboard"
  | "investorDashboard"
  | "createPitch"
  | "likePitch"
  | "comment"
  | "dealFlow"
  | "watchlist"
  | "analytics"
  | "advancedAnalytics"
  | "uploadPitch"
  | "featuredPlacement";

type AccessRule = {
  roles: UserRole[];
  minTier?: SubscriptionTier;
};

const TIER_ORDER: SubscriptionTier[] = ["free", "starter", "pro", "studio"];

function meetsMinTier(userTier: SubscriptionTier, minTier: SubscriptionTier): boolean {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(minTier);
}

const RULES: Record<AccessKey, AccessRule> = {
  dashboard:          { roles: ["creator"] },
  investorDashboard:  { roles: ["investor"], minTier: "pro" },
  createPitch:        { roles: ["creator"], minTier: "starter" },
  likePitch:          { roles: ["viewer", "creator", "investor"] },
  comment:            { roles: ["investor"], minTier: "pro" },
  dealFlow:           { roles: ["investor"], minTier: "pro" },
  watchlist:          { roles: ["investor"], minTier: "pro" },
  analytics:          { roles: ["creator"], minTier: "starter" },
  advancedAnalytics:  { roles: ["creator", "investor"], minTier: "studio" },
  uploadPitch:        { roles: ["creator"], minTier: "starter" },
  featuredPlacement:  { roles: ["creator"], minTier: "studio" },
};

export function canAccess(
  key: AccessKey,
  role: UserRole,
  tier: SubscriptionTier,
): boolean {
  const rule = RULES[key];
  if (!rule) return false;
  if (!rule.roles.includes(role)) return false;
  if (rule.minTier && !meetsMinTier(tier, rule.minTier)) return false;
  return true;
}

export function getRequiredTierFor(key: AccessKey): SubscriptionTier | null {
  return RULES[key]?.minTier ?? null;
}

export function getRequiredRolesFor(key: AccessKey): UserRole[] {
  return RULES[key]?.roles ?? [];
}
