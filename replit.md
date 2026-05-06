# PitchFlix

A cinematic movie pitch platform where creators can submit, discover, and like film pitches — styled like Netflix with a dark, premium UI.

## Run & Operate

- `pnpm --filter @workspace/pitchflix run dev` — run PitchFlix frontend (Vite, port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- Required env secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + vanilla TypeScript (no React in pitchflix artifact)
- Styling: Tailwind CSS CDN + custom CSS in `index.html`
- Database: Supabase (PostgreSQL) via `@supabase/supabase-js`
- Realtime: Supabase Realtime (postgres_changes on pitches table)
- Storage: Supabase Storage bucket `posters` for image uploads
- API: Express 5 (api-server artifact, unused by pitchflix)

## Where things live

- `artifacts/pitchflix/index.html` — full app shell, styles, HTML structure
- `artifacts/pitchflix/src/pitchflix.ts` — all app logic (data, render, Supabase)
- `artifacts/pitchflix/src/main.tsx` — Vite entry point (imports pitchflix.ts)

## Architecture decisions

- All UI logic lives in `pitchflix.ts` as a vanilla TS module; functions are exposed on `window.*` for HTML onclick handlers
- Supabase env vars use `VITE_` prefix so Vite injects them via `import.meta.env` at build time
- Chip shows "Live DB" / "Demo Mode" based on whether Supabase fetch succeeds — falls back to mock data gracefully
- Multi-genre filtering uses a `Set<string>` allowing multiple active genres simultaneously
- Realtime subscription listens to all pitches events: UPDATE patches in-memory, INSERT/DELETE triggers full reload

## Product

- Browse 12+ cinematic movie pitches in a responsive grid (1→5 columns)
- Filter by multiple genres simultaneously + keyword search + "Clear filters"
- Like pitches with optimistic UI (persisted to Supabase, synced in real-time across tabs)
- Submit new pitches via modal: upload a poster image OR paste a URL
- Hero section, glassmorphism navbar, trending view, mobile bottom navigation

## Supabase setup required

Run this SQL in Supabase SQL Editor once:
```sql
CREATE TABLE IF NOT EXISTS public.pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, genre text, image text,
  likes integer DEFAULT 0, year integer, logline text,
  trending boolean DEFAULT false, rating integer DEFAULT 4,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pitches TO anon;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read"   ON public.pitches FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.pitches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.pitches FOR UPDATE USING (true);
```

For image uploads: create a public Storage bucket named `posters` in Supabase → Storage.
For realtime: enable replication on the `pitches` table in Supabase → Database → Replication.

## Gotchas

- `VITE_` prefix is required on env vars — they're injected at Vite build/dev time via `import.meta.env`
- The realtime subscription only fires if replication is enabled for the `pitches` table in Supabase
- Image uploads require the `posters` Storage bucket to be created with public access policy

## Pointers

- See `pnpm-workspace` skill for workspace structure
