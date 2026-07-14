-- BEV Owners Issue Tracker — initial schema
--
-- Architecture (see README "Backend setup" for the full picture):
--   * All writes go through the `submit-report` Edge Function, never straight
--     from the browser. The function verifies Turnstile + rate-limits, then
--     inserts using the service role key. Because of that, anon/authenticated
--     roles get NO insert/update/delete grants on these tables at all — only
--     SELECT on the public, non-PII data. This is simpler and safer than
--     hand-rolling RLS insert policies that a client could try to abuse.
--   * PII (registration number, name, contact number) lives in a separate
--     table with no SELECT grant for anon/authenticated at all — it is only
--     ever readable via the service role (e.g. from an admin script), so it
--     never appears in the public REST/GraphQL API responses.
--   * Duplicate detection hashes the normalized registration number (with a
--     server-side pepper) so we can flag likely dupes without ever storing
--     or exposing the plaintext number outside `report_private`.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Public, non-PII report data. Freely readable once not removed.
-- ---------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  car_model text not null check (car_model in ('BE 6', 'XEV 9e', 'XEV 9S')),
  variant text not null,
  purchase_year int not null check (purchase_year between 2023 and extract(year from now())::int + 1),
  odo_km int not null check (odo_km >= 0 and odo_km < 500000),
  city text not null,
  service_center text,

  major_issues text[] not null default '{}',
  minor_issues text[] not null default '{}',

  hardware_rating smallint not null check (hardware_rating between 1 and 5),
  software_rating smallint not null check (software_rating between 1 and 5),
  service_rating smallint not null check (service_rating between 1 and 5),
  overall_rating smallint not null check (overall_rating between 1 and 5),

  notes text,

  -- moderation lifecycle: pending -> verified (auto after N days w/ no reports,
  -- or manual) | flagged (dup/suspicious, hidden from analytics) | removed
  status text not null default 'pending' check (status in ('pending', 'verified', 'flagged', 'removed')),
  duplicate_suspected boolean not null default false,

  submitter_ip_hash text -- sha256(ip + pepper), for rate limiting only, never exposed via API
);

create index reports_car_model_idx on public.reports (car_model);
create index reports_created_at_idx on public.reports (created_at desc);
create index reports_status_idx on public.reports (status);

comment on column public.reports.submitter_ip_hash is
  'Hashed IP for rate-limit lookups by the Edge Function. Not selectable by anon (column-level RLS not needed since anon has no UPDATE, but keep out of any public view).';

-- ---------------------------------------------------------------------------
-- PII, kept fully separate. No anon/authenticated grants whatsoever.
-- ---------------------------------------------------------------------------
create table public.report_private (
  report_id uuid primary key references public.reports (id) on delete cascade,
  reg_number text,       -- plaintext, optional; only ever written/read by service role
  owner_name text,
  contact_number text,
  reg_hash text          -- sha256(normalized reg_number + pepper), for dedup matching
);

create index report_private_reg_hash_idx on public.report_private (reg_hash) where reg_hash is not null;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.reports enable row level security;
alter table public.report_private enable row level security;

-- Public can read reports that aren't removed/flagged. No insert/update/delete
-- policies exist for anon/authenticated, so the REST API can never write here
-- directly — only the service-role Edge Function can (service role bypasses RLS).
create policy "public can read visible reports"
  on public.reports for select
  to anon, authenticated
  using (status in ('verified', 'pending'));

-- report_private has RLS enabled and zero policies for anon/authenticated,
-- which means the table is completely inaccessible from the public API
-- (Postgres RLS default-denies when no policy matches).

-- ---------------------------------------------------------------------------
-- Analytics views — pre-aggregated, safe for anon SELECT, drive the dashboard.
-- ---------------------------------------------------------------------------
create or replace view public.analytics_issue_frequency as
select
  car_model,
  issue,
  'major' as severity,
  count(*) as occurrences
from public.reports, unnest(major_issues) as issue
where status in ('verified', 'pending')
group by car_model, issue
union all
select
  car_model,
  issue,
  'minor' as severity,
  count(*) as occurrences
from public.reports, unnest(minor_issues) as issue
where status in ('verified', 'pending')
group by car_model, issue;

create or replace view public.analytics_satisfaction as
select
  car_model,
  round(avg(hardware_rating)::numeric, 2) as avg_hardware,
  round(avg(software_rating)::numeric, 2) as avg_software,
  round(avg(service_rating)::numeric, 2) as avg_service,
  round(avg(overall_rating)::numeric, 2) as avg_overall,
  count(*) as report_count
from public.reports
where status in ('verified', 'pending')
group by car_model;

create or replace view public.analytics_summary as
select
  count(*) as total_reports,
  count(*) filter (where status = 'verified') as verified_reports,
  count(distinct city) as cities_represented
from public.reports
where status in ('verified', 'pending');

grant select on public.analytics_issue_frequency to anon, authenticated;
grant select on public.analytics_satisfaction to anon, authenticated;
grant select on public.analytics_summary to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Auto-verify: once a report has been visible for 14 days without being
-- flagged/removed, promote it from 'pending' to 'verified'. Run via
-- Supabase's pg_cron (enable the extension, then schedule daily), or call
-- manually — see README.
-- ---------------------------------------------------------------------------
create or replace function public.auto_verify_reports() returns void as $$
  update public.reports
  set status = 'verified'
  where status = 'pending'
    and created_at < now() - interval '14 days';
$$ language sql security definer;
