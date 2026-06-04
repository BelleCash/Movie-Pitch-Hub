# SECURITY REPORT — PitchFlix
Generated: 2026-06-04

## Environment Variables

| Variable | Exposure | Status |
|----------|---------|--------|
| `VITE_SUPABASE_URL` | Client (VITE_ prefix) | ✅ Safe — public endpoint |
| `VITE_SUPABASE_ANON_KEY` | Client (VITE_ prefix) | ✅ Safe — anon key, gated by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | ✅ Not present in codebase — see supabaseAdmin.ts |
| `SESSION_SECRET` | Server only | ✅ Not imported in client code |

---

## Supabase Security

### Anon Key
- Used in `src/lib/supabase.ts` — correct usage
- The anon key is intentionally public; Row Level Security (RLS) is the enforcement layer

### Service Role Key
- **NOT present** in any client file
- `src/lib/supabaseAdmin.ts` documents that it must never be used in browser bundles
- If needed: use Supabase Edge Functions or `artifacts/api-server` (server runtime)

### Row Level Security
- `pitches`: Public SELECT ✅, INSERT/UPDATE require auth ✅
- `profiles`: Confirm `auth.uid() = id` policy is active in Supabase dashboard ⚠️
- `comments`: Public SELECT ✅, INSERT requires auth ✅
- `pitch_views`: INSERT allowed — consider rate limiting ⚠️

---

## Protected Routes

| Route | Guard | Status |
|-------|-------|--------|
| `/dashboard` | `user` check | ✅ |
| `/investor` | `user` + `role === investor` + subscription | ✅ |
| `/settings` | `user` check | ✅ |
| `/onboarding` | `user` check | ✅ |

---

## Client-Side Access Control

- `lib/roleAccess.ts`: Pure function, no side effects, cannot be bypassed at the data layer (RLS handles real enforcement)
- `components/auth/ProtectedRoute.tsx`: Client guard — prevents UI rendering, not a security boundary
- **Important:** Client-side guards are UX only. Real security must be enforced by Supabase RLS policies and server-side API validation.

---

## Billing Security

| Risk | Status |
|------|--------|
| Subscription tier stored client-side only | ⚠️ Tier is in auth metadata — can be read by user. Do not rely on it as a security gate without server verification. |
| No live payment keys in codebase | ✅ All providers are stubs |
| Webhook endpoints not exposed | ✅ No `/api/billing/` routes exist yet |

---

## Recommendations

1. **Verify Supabase RLS policies** for `profiles` table — confirm users can only read/write their own row
2. **Rate-limit `pitch_views`** inserts — currently unauthenticated inserts allowed
3. **When going live with billing:** webhook secrets must be stored server-side (api-server env vars), never in VITE_ prefix
4. **Server-side tier verification:** Before serving sensitive investor data, verify tier from Supabase server-side, not just from auth metadata
5. **CORS:** Ensure Supabase project URL allowlist includes only your production domain

---

## Immediate Security Issues
**None.** No exposed secrets. No broken auth guards. No service role key in client code.
