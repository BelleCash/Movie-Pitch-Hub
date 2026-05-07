export interface Pitch {
  id: string;
  title: string;
  genre: string;
  year: number;
  likes: number;
  rating: number;
  trending: boolean;
  image: string;
  logline: string;
  user_id?: string;
  created_at?: string;
}

export type UserRole = "viewer" | "creator" | "investor";
export type SubscriptionTier = "free" | "starter" | "pro" | "studio";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  isSubscribed: boolean;
  username: string;
  bio: string;
  onboardingComplete: boolean;
}

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isSubscribed: boolean;
  provider: string;
  mockMode?: boolean;
}

export interface BillingProvider {
  name: string;
  subscribe(tier: SubscriptionTier): Promise<SubscriptionStatus>;
  cancel(): Promise<SubscriptionStatus>;
  getSubscriptionStatus(): Promise<SubscriptionStatus>;
}
