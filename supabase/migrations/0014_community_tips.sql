-- Owner-submitted "issue + fix" tips shown on the Known Issues page. Free-text,
-- lower barrier than the full report (no reg number), so kept simple: Turnstile
-- + IP rate limiting happen in the submit-tip Edge Function, not here. Publicly
-- readable immediately (same pattern as reports.notes_public_opt_in) since this
-- is explicitly public-facing content the submitter chose to share.
create table if not exists public.community_tips (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  car_model text check (car_model is null or car_model in ('BE 6', 'XEV 9e', 'XEV 9S')),
  issue text not null,
  fix text not null,
  submitter_ip_hash text
);

alter table public.community_tips enable row level security;

-- Anyone can read tips; only the service role (via submit-tip Edge Function) can insert.
create policy "community_tips_public_read" on public.community_tips
  for select using (true);
