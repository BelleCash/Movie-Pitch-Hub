/**
 * supabaseAdmin.ts — SERVER-SIDE ONLY
 *
 * This file is a boundary guard. The Supabase service role key MUST NEVER
 * be loaded in browser/client bundles — it grants full database access
 * and bypasses all Row Level Security (RLS) policies.
 *
 * To use a service role client (e.g. for webhook verification, admin
 * operations, or background jobs), implement it in a server-side runtime:
 *   - An Edge Function (Supabase Edge Functions)
 *   - A Node.js API route (artifacts/api-server)
 *   - A Next.js/Remix server action
 *
 * Never import SUPABASE_SERVICE_ROLE_KEY or similar secrets here.
 * Never import this file from any src/components, src/pages, or src/hooks path.
 *
 * Example server-side usage (NOT here, in a server runtime):
 *
 *   import { createClient } from "@supabase/supabase-js";
 *   const adminClient = createClient(
 *     process.env.SUPABASE_URL!,
 *     process.env.SUPABASE_SERVICE_ROLE_KEY!,   // server env only
 *   );
 */

export const SUPABASE_ADMIN_NOTE =
  "Use the Supabase service role client only in server-side runtimes " +
  "(Edge Functions, api-server). Never expose the service role key to the browser.";
