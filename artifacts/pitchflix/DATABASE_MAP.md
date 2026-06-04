# DATABASE MAP — PitchFlix
Generated: 2026-06-04

## Backend: Supabase PostgreSQL

---

## Tables Currently Used by the App

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | FK → auth.users.id |
| email | text | From auth |
| username | text | Unique, set on onboarding |
| bio | text | Optional |
| avatar_url | text | DiceBear URL or custom |
| role | text | viewer / creator / investor |
| subscription_tier | text | free / starter / pro / studio |
| onboarding_complete | boolean | Set by completeOnboarding() |
| wallet_connected | boolean | Set in Settings |
| payout_provider | text | stripe / paystack / opay / moniepoint / etc. |
| payout_account | text | Account identifier |
| investor_wallet_balance | numeric | Capital wallet balance |
| creator_earnings | numeric | Accumulated earnings |
| created_at | timestamptz | Auto |

**RLS:** All operations require auth.uid() = id (recommended — confirm in Supabase dashboard)

---

### `pitches`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| title | text | |
| genre | text | |
| image_url | text | Supabase Storage URL |
| likes | integer | Denormalized count |
| year | integer | |
| logline | text | Short pitch description |
| description | text | Long description / synopsis |
| synopsis | text | Extended narrative |
| video_url | text | Optional trailer/teaser |
| tags | text[] | Genre tags |
| trending | boolean | |
| trending_score | integer | Computed score |
| rating | integer | |
| views | integer | |
| draft | boolean | Draft vs published |
| user_id | uuid | FK → profiles.id |
| created_at | timestamptz | |

**RLS:** Public SELECT; INSERT/UPDATE require auth

---

### `comments`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| pitch_id | uuid | FK → pitches.id |
| user_id | uuid | FK → profiles.id |
| content | text | |
| created_at | timestamptz | |

**RLS:** Public SELECT; INSERT requires auth (investor + pro tier enforced client-side)

---

### `pitch_views`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| pitch_id | uuid | FK → pitches.id |
| user_id | uuid | FK → profiles.id (nullable for anon) |
| created_at | timestamptz | |

---

## Tables Referenced in Target but NOT YET in App Code

| Table | Current Status | Recommendation |
|-------|---------------|----------------|
| `likes` (separate table) | Likes stored as `pitches.likes` integer counter | Add `likes` table for per-user tracking; migrate counter to count query |
| `follows` | Not implemented | Create for creator follower counts |
| `subscriptions` | Tier stored in profiles + auth metadata | Create for audit trail of billing events |
| `notifications` | Not implemented | Create for deal alerts, like notifications |

---

## Recommended Migrations (Approval Required Before Applying)

```sql
-- 1. Per-user likes table (replaces denormalized pitches.likes)
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(pitch_id, user_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth delete" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- 2. Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Auth delete" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 3. Subscriptions audit log
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier text NOT NULL,
  provider text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  cancelled_at timestamptz
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner read" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 4. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner read" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
```

**⚠️ DO NOT APPLY without approval — these are additive and non-breaking, but confirm before running.**
