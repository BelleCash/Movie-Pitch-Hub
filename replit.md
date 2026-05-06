# PitchFlix

A cinematic Netflix-style movie pitch platform — creators can sign up, submit pitches, like others' work, and see real-time updates.

## Run & Operate

- `pnpm --filter @workspace/pitchflix run dev` — run frontend (Vite, port from workflow)
- `pnpm run typecheck` — full typecheck
- Required env secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19 + Tailwind CSS v4 (via @tailwindcss/vite)
- Routing: wouter (client-side, base from `import.meta.env.BASE_URL`)
- Toasts: sonner
- Auth: Supabase Auth (email + password)
- Database: Supabase PostgreSQL via `@supabase/supabase-js`
- Realtime: Supabase Realtime (random channel name per mount to avoid StrictMode conflicts)
- Storage: Supabase Storage bucket `posters` for image uploads

## Where things live

```
artifacts/pitchflix/
  index.html                     — clean React mount point
  src/
    main.tsx                     — entry point
    index.css                    — Tailwind v4 import + all cinematic custom CSS
    App.tsx                      — AuthProvider + WouterRouter + Sonner Toaster
    types.ts                     — Pitch interface
    lib/supabase.ts              — Supabase client (null if env vars missing)
    context/AuthContext.tsx      — user/session state, signIn/signUp/signOut
    hooks/usePitches.ts          — pitch data, realtime, updateLikes, addPitch, uploadImage
    components/
      Navbar.tsx                 — sticky glass nav, user menu, db chip
      Hero.tsx                   — cinematic hero with CTA
      PitchCard.tsx              — movie card with like button
      FilterBar.tsx              — multi-genre filter + search + clear
      PitchGrid.tsx              — responsive grid, skeletons, empty state
      AuthModal.tsx              — sign in / sign up modal
      CreatePitchModal.tsx       — submit pitch form with upload + URL fallback
    pages/
      Home.tsx                   — main page: view/filter/liked state
      Dashboard.tsx              — user's pitches + account section
```

## Architecture decisions

- `usePitches` uses a random channel name per mount to avoid "cannot add callbacks after subscribe" in React StrictMode
- Liked pitch IDs stored in `localStorage` keyed by `pf-liked-{userId}` (per user)
- Submitted pitch IDs stored in `localStorage` keyed by `pf-my-{userId}` for Dashboard display
- Dashboard deduplicates pitches found by `user_id` column AND by localStorage IDs
- `addPitch` gracefully falls back to insert without `user_id` if column doesn't exist (error code 42703)
- Supabase client returns `null` if env vars aren't set; all callers check `if (!supabase)` before use

## Product

- Home: browse all pitches, filter by multiple genres, search, like (requires auth)
- Trending: filtered view of trending-flagged pitches
- Dashboard: user's submitted pitches + create new pitch
- Auth: email + password sign up / sign in (Supabase Auth)
- Create Pitch: title, genre, year, logline, poster upload OR URL
- Realtime: like counts sync across tabs instantly

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

For image uploads: create a public Storage bucket named `posters` in Supabase → Storage.
For realtime: enable replication on `pitches` in Supabase → Database → Replication.
For auth: no extra SQL needed — Supabase Auth is enabled by default.

## Gotchas

- `VITE_` prefix required on env vars — injected at build/dev time via `import.meta.env`
- Realtime subscription uses a random channel name per mount to work with React StrictMode
- Like/submit requires authentication — unauthenticated users see the auth modal instead
- Dashboard shows pitches via `user_id` column (if added) + localStorage-tracked IDs as fallback

## Pointers

- See `pnpm-workspace` skill for workspace structure
