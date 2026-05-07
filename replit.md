# PitchFlix

A cinematic, investor-ready SaaS marketplace for movie pitches — creators pitch ideas, investors discover deals, all in real-time.

## Run & Operate

- `pnpm --filter @workspace/pitchflix run dev` — run frontend (Vite, port from workflow)
- `pnpm run typecheck` — full typecheck
- Required env secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19 + Tailwind CSS v4 (via @tailwindcss/vite)
- Routing: wouter (client-side, base from `import.meta.env.BASE_URL`)
- Toasts: sonner
- Auth: Supabase Auth (email + password) with multi-role signup
- Database: Supabase PostgreSQL via `@supabase/supabase-js`
- Realtime: Supabase Realtime (random channel name per mount to avoid StrictMode conflicts)
- Storage: Supabase Storage bucket `posters` for image uploads
- Billing: Provider-agnostic billing abstraction (mock mode, ready for Stripe/Paystack/Paddle/LemonSqueezy)

## Where things live

```
artifacts/pitchflix/
  index.html
  src/
    main.tsx
    index.css                    — purple SaaS theme, all cinematic CSS
    App.tsx                      — AuthProvider + BillingProvider + WouterRouter + Toaster
    types.ts                     — Pitch, UserRole, SubscriptionTier, BillingProvider interfaces
    lib/supabase.ts
    context/
      AuthContext.tsx             — user/session/userProfile, signIn/signUp(role)/signOut/updateRole
      BillingContext.tsx          — tier, isSubscribed, subscribe(), cancelSubscription(), syncFromSupabase()
    services/billing/
      billingService.ts           — provider-agnostic billing facade
      providers/
        stripeProvider.ts
        paystackProvider.ts
        lemonSqueezyProvider.ts
        paddleProvider.ts
    hooks/usePitches.ts
    components/
      auth/
        ProtectedRoute.tsx        — auth + role guard
      billing/
        PricingCard.tsx           — animated tier card
        InvestorPaywall.tsx       — upgrade prompt for investor-gated content
      Navbar.tsx                  — role-aware nav (viewer/creator/investor)
      Hero.tsx                    — marketplace headline + CTAs
      PitchCard.tsx
      FilterBar.tsx
      PitchGrid.tsx
      AuthModal.tsx               — role-selection signup (viewer/creator/investor)
      CreatePitchModal.tsx
    pages/
      Home.tsx                    — browse + filter + like
      Dashboard.tsx               — creator's pitches + account
      Pricing.tsx                 — 4-tier pricing page (Free/Starter/Pro/Studio)
      InvestorDashboard.tsx       — deal flow, watchlist, KPIs (gated by subscription)
```

## Roles & Billing

### User roles (stored in Supabase user_metadata, localStorage fallback)
- `viewer` — browse only
- `creator` — upload pitches, dashboard
- `investor` — deal flow, watchlists, investor dashboard (requires subscription)

### Subscription tiers (mock billing, no live payments)
- `free` — $0/mo
- `starter` — $9/mo (creator features)
- `pro` — $19/mo (investor dashboard + deal flow)
- `studio` — $49/mo (unlimited + analytics)

### Billing architecture
- `billingService` is the facade; components never call providers directly
- Each provider implements: `subscribe()`, `cancel()`, `getSubscriptionStatus()`
- Currently all providers simulate success (mock mode)
- To wire live Stripe: implement real API calls inside `stripeProvider.ts`

## Routes
- `/` — Home (public)
- `/dashboard` — Creator dashboard (auth required)
- `/pricing` — Pricing page (auth recommended)
- `/investor` — Investor dashboard (auth + subscription)

## Architecture decisions

- `usePitches` uses a random channel name per mount to avoid StrictMode double-subscribe
- Role stored in Supabase `user_metadata.role`, read via `userProfile` from AuthContext
- Subscription tier stored in `user_metadata.subscription_tier`
- `BillingContext` syncs from Supabase on user mount, falls back to localStorage cache
- `billingService.subscribe({ provider, tier })` is the only public billing API
- Investor dashboard shows `InvestorPaywall` if `role === investor && !isSubscribed`

## Supabase required SQL

```sql
CREATE TABLE IF NOT EXISTS public.pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, genre text, image text,
  likes integer DEFAULT 0, year integer, logline text,
  trending boolean DEFAULT false, rating integer DEFAULT 4,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS user_id uuid;
GRANT SELECT, INSERT, UPDATE ON public.pitches TO anon;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read"   ON public.pitches FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.pitches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.pitches FOR UPDATE USING (true);
```

## Gotchas

- `VITE_` prefix required on env vars
- Realtime uses random channel names per mount
- Like/submit requires auth; Investor Dashboard requires subscription
- Billing is fully mocked — no real payments
