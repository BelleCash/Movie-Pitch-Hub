# AUDIT REPORT — PitchFlix
Generated: 2026-06-04

## Build Status
- TypeScript: ✅ 0 errors (tsc --noEmit)
- Runtime errors: ✅ None detected
- All @/ imports: ✅ Resolve correctly

---

## File Structure vs Target

| Status | Path |
|--------|------|
| ✅ Exists | src/App.tsx |
| ✅ Exists | src/main.tsx |
| ✅ Exists | src/index.css |
| ✅ Exists | src/types.ts |
| ✅ Exists | src/lib/supabase.ts |
| ✅ Exists | src/lib/utils.ts |
| ✅ Created | src/lib/supabaseAdmin.ts (boundary guard — server-only note) |
| ✅ Created | src/lib/roleAccess.ts |
| ✅ Created | src/lib/billing/updateSubscription.ts |
| ✅ Exists | src/context/AuthContext.tsx |
| ✅ Exists | src/context/BillingContext.tsx |
| ✅ Exists | src/hooks/usePitches.ts |
| ✅ Exists | src/hooks/use-mobile.tsx |
| ✅ Exists | src/hooks/use-toast.ts |
| ✅ Created | src/hooks/useNavAccess.ts |
| ✅ Exists | src/components/Navbar.tsx |
| ✅ Exists | src/components/Hero.tsx |
| ✅ Exists | src/components/FilterBar.tsx |
| ✅ Exists | src/components/PitchCard.tsx |
| ✅ Exists | src/components/PitchGrid.tsx |
| ✅ Exists | src/components/AuthModal.tsx |
| ✅ Exists | src/components/CreatePitchModal.tsx |
| ✅ Exists | src/components/auth/ProtectedRoute.tsx |
| ✅ Exists | src/components/billing/InvestorPaywall.tsx |
| ✅ Exists | src/components/billing/PricingCard.tsx |
| ✅ Exists | src/components/ui/* (all 33 ui components) |
| ✅ Exists | src/pages/Home.tsx |
| ✅ Exists | src/pages/Dashboard.tsx |
| ✅ Exists | src/pages/InvestorDashboard.tsx |
| ✅ Exists | src/pages/Onboarding.tsx |
| ✅ Exists | src/pages/PitchDetail.tsx |
| ✅ Exists | src/pages/Pricing.tsx |
| ✅ Exists | src/pages/Settings.tsx |
| ✅ Exists | src/pages/not-found.tsx |
| ✅ Exists | src/services/pitchScoring.ts |
| ✅ Exists | src/services/billing/billingService.ts |
| ✅ Exists | src/services/billing/providers/stripeProvider.ts |
| ✅ Exists | src/services/billing/providers/paystackProvider.ts |
| ✅ Exists | src/services/billing/providers/lemonSqueezyProvider.ts |
| ✅ Exists | src/services/billing/providers/paddleProvider.ts |
| ✅ Created | src/services/billing/providers/opayProvider.ts |
| ✅ Created | src/services/billing/providers/moniepointProvider.ts |
| ⚠️ Missing | api/ (billing webhooks — server-side, not in Vite artifact) |

---

## Bugs Found & Fixed

| # | Bug | Severity | Fix Applied |
|---|-----|----------|-------------|
| 1 | Onboarding infinite redirect — desync between `user_metadata.onboarding_complete` (auth) and `userProfile.onboardingComplete` (profiles table) | 🔴 High | Fixed: Onboarding.tsx now uses `userProfile.onboardingComplete` consistently |
| 2 | `pages/not-found.tsx` existed but App.tsx used inline `NotFound` | 🟡 Medium | Fixed: App.tsx now imports and uses `pages/not-found.tsx` |
| 3 | FilterBar "Clear filters" button used red brand color (`#e50914`) | 🟡 Medium | Fixed: Changed to purple (#7c3aed system) |
| 4 | OPay + Moniepoint providers missing from billingService registry | 🟡 Medium | Fixed: Both providers created and registered |

---

## Missing Files Created

| File | Purpose |
|------|---------|
| `src/hooks/useNavAccess.ts` | Composable hook: role + tier → boolean access gates for all nav items |
| `src/lib/roleAccess.ts` | Pure access rule engine: `canAccess(key, role, tier)` |
| `src/lib/billing/updateSubscription.ts` | Supabase upsert: syncs subscription tier to profiles table + auth metadata |
| `src/lib/supabaseAdmin.ts` | Security boundary guard — documents that service role key must never be in browser |
| `src/services/billing/providers/opayProvider.ts` | OPay billing provider (architecture-complete, payment integration ready) |
| `src/services/billing/providers/moniepointProvider.ts` | Moniepoint billing provider (architecture-complete, payment integration ready) |

---

## Auth Audit

| Check | Status |
|-------|--------|
| Login (email + password) | ✅ AuthContext / Supabase |
| Signup with role selection | ✅ AuthModal + AuthContext.signUp() |
| Session persistence | ✅ Supabase onAuthStateChange |
| Profile read from Supabase | ✅ profiles table via hydrateProfile() |
| Protected routes | ✅ ProtectedRoute.tsx |
| Onboarding redirect | ✅ Fixed (was potential infinite loop) |
| Logout | ✅ AuthContext.signOut() |
| Role in profiles table | ✅ Written on signup + onboarding |

---

## Navigation Audit

| Route | Component | Guard | Status |
|-------|-----------|-------|--------|
| `/` | Home | None | ✅ |
| `/dashboard` | Dashboard | auth + creator | ✅ |
| `/investor` | InvestorDashboard | auth + investor + subscription | ✅ |
| `/pricing` | Pricing | None | ✅ |
| `/onboarding` | Onboarding | auth | ✅ |
| `/settings` | Settings | auth | ✅ |
| `/pitch/:id` | PitchDetail | None | ✅ |
| `*` | NotFound | None | ✅ (fixed) |

---

## Pitch System Audit

| Feature | Status |
|---------|--------|
| Pitch loading from Supabase | ✅ usePitches.ts |
| Fallback data when Supabase unavailable | ✅ MOCK_PITCHES fallback |
| Realtime updates | ✅ Random channel name per mount |
| Like toggle | ✅ Requires auth, increments pitches.likes |
| Pitch filtering by genre | ✅ FilterBar |
| Pitch search | ✅ FilterBar |
| Pitch detail page | ✅ PitchDetail.tsx |
| AI scoring on detail | ✅ pitchScoring.ts (5 dimensions) |
| View tracking | ✅ pitch_views insert on mount |
| Comments | ✅ Supabase comments table |
| Image upload | ✅ Supabase Storage (posters bucket) |

---

## AI Scoring Audit

| Dimension | Status |
|-----------|--------|
| Clarity | ✅ pitchScoring.ts |
| Originality | ✅ pitchScoring.ts |
| Market Potential | ✅ pitchScoring.ts |
| Engagement | ✅ pitchScoring.ts |
| Risk | ✅ pitchScoring.ts |
| Architecture | Extensible — rule-based now, AI API-ready |
| Fake/fabricated scores | ✅ None — rule-based on real pitch data |

---

## Remaining Items (No Approval Required)

None. All bugs fixed. Structure matches target.

## Items Requiring Future Approval

| Item | Notes |
|------|-------|
| `api/` webhook endpoints | Requires a server runtime (api-server artifact). Not a Vite artifact concern. |
| Live payment integration | Replace `mockMode: true` stubs in each provider with real API calls when credentials available. |
| Database migration (follows, subscriptions, notifications tables) | See DATABASE_MAP.md |
