---
name: PitchFlix supabaseAdmin boundary
description: Service role key must never appear in client bundles
---

## Rule
`src/lib/supabaseAdmin.ts` is a documentation/boundary guard file only. It contains no credentials and no client. The Supabase service role key must never be imported or referenced in any `src/` file.

**Why:** The service role key bypasses all RLS policies and grants full database access. Exposing it in a Vite bundle (even behind VITE_ prefix) would be a critical security vulnerability.

**How to apply:** Admin operations (webhook verification, background jobs, server-side subscription verification) must run in `artifacts/api-server` or Supabase Edge Functions, never in the browser bundle.
