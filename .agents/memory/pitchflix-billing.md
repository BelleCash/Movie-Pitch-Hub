---
name: PitchFlix billing architecture
description: Provider abstraction, registered providers, and the roleAccess gate engine
---

## Rule
`billingService.ts` is the only public billing API. Components call it; they never call providers directly.

**Registered providers (all 6):** stripe, paystack, lemonsqueezy, paddle, opay, moniepoint.

**Access gate engine:** `src/lib/roleAccess.ts` — `canAccess(key, role, tier)` returns boolean. Keys defined in `AccessKey` type. Use `useNavAccess()` hook in components.

**Subscription sync:** `src/lib/billing/updateSubscription.ts` — writes tier to `profiles.subscription_tier` AND auth metadata. Both must be written in lockstep.

**Why:** BillingContext reads from auth metadata on mount. If only the profiles table is updated, BillingContext will show stale tier until next auth refresh.
