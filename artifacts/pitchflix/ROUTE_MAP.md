# ROUTE MAP — PitchFlix
Generated: 2026-06-04

## Client-Side Routes (wouter, base = import.meta.env.BASE_URL)

| Path | Component | Auth Required | Role Required | Tier Required | Notes |
|------|-----------|:---:|:---:|:---:|-------|
| `/` | `Home.tsx` | ❌ | Any | Any | Public feed, search, filter |
| `/dashboard` | `Dashboard.tsx` | ✅ | creator | free | Creator wallet, pitches, activation score |
| `/investor` | `InvestorDashboard.tsx` | ✅ | investor | pro | Deal flow, watchlist, AI scores |
| `/pricing` | `Pricing.tsx` | ❌ | Any | Any | Tier comparison, upgrade CTA |
| `/onboarding` | `Onboarding.tsx` | ✅ | Any | Any | Role + profile setup; auto-redirects if already complete |
| `/settings` | `Settings.tsx` | ✅ | Any | Any | Profile, payout provider, wallet |
| `/pitch/:id` | `PitchDetail.tsx` | ❌ | Any | Any | Public view; comment requires investor + pro |
| `*` | `not-found.tsx` | ❌ | Any | Any | 404 fallback |

## Navigation Guards

### App.tsx onboarding check
```
if (user && userProfile && !userProfile.onboardingComplete)
  → redirect to /onboarding
```

### Onboarding.tsx exit check
```
if (!user) → redirect to /
if (userProfile.onboardingComplete) → redirect to role home
```

### ProtectedRoute.tsx
- Checks `user` from AuthContext
- Checks `role` if `requiredRole` prop supplied
- Redirects to `/` on failure

## Deep-Link Behavior
- `post_signup_redirect` localStorage key: set by AuthModal after signup to redirect the user to their intended destination after onboarding completes

## Missing Routes (Future Work, Requires Approval)
| Planned Path | Purpose |
|---|---|
| `/create` | Dedicated pitch creation page (currently modal-only) |
| `/profile/:username` | Public creator profile |
| `/discover` | Curated discovery feed for investors |
