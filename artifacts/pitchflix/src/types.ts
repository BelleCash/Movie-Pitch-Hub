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
  synopsis?: string;
  video_url?: string;
  tags?: string[];
  user_id?: string;
  created_at?: string;
  views?: number;
  comment_count?: number;
  trending_score?: number;
}

export type UserRole = "viewer" | "creator" | "investor";
export type SubscriptionTier = "free" | "starter" | "pro" | "studio";
export type PayoutProvider = "paystack" | "stripe" | "lemon_squeezy" | "opay" | "moniepoint" | "bank_account" | "metamask";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  isSubscribed: boolean;
  username: string;
  bio: string;
  avatarUrl?: string;
  onboardingComplete: boolean;
  walletConnected?: boolean;
  payoutProvider?: PayoutProvider | null;
  payoutAccount?: string;
  investorWalletBalance?: number;
  creatorEarnings?: number;
}

export interface Comment {
  id: string;
  pitch_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
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
