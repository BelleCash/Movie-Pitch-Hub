---
name: PitchFlix auth source of truth
description: Which field to check for onboarding completion — profiles table vs auth metadata
---

## Rule
Always use `userProfile.onboardingComplete` (from the Supabase `profiles` table via AuthContext) as the single authority for whether onboarding is complete. Never use `user?.user_metadata?.onboarding_complete` as the guard.

**Why:** App.tsx redirects to `/onboarding` when `userProfile.onboardingComplete` is false. If Onboarding.tsx then checks `user_metadata.onboarding_complete` to decide whether to redirect away, the two sources can desync — causing an infinite redirect loop.

**How to apply:** Any page that needs to check onboarding status must import `useAuth()` and check `userProfile?.onboardingComplete`. The `completeOnboarding()` function in AuthContext writes to both the profiles table and auth metadata in lockstep, so they stay in sync after onboarding finishes.
