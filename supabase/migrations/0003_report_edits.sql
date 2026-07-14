-- Support editing a previously submitted report, keyed on the (optional)
-- registration number the owner supplied at submission time. See
-- supabase/functions/find-report and supabase/functions/update-report —
-- together they let an owner locate their report and edit it days later
-- without an account, re-verifying via the same reg-number hash used for
-- duplicate detection.

alter table public.reports add column if not exists updated_at timestamptz not null default now();
alter table public.reports add column if not exists edit_count int not null default 0;

-- Rate-limits the find-report lookup endpoint (which lets someone test
-- whether a given registration number has a report at all). No anon/
-- authenticated grants at all — service-role only, same pattern as
-- report_private.
create table public.report_lookup_log (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.report_lookup_log enable row level security;

create index report_lookup_log_ip_created_idx on public.report_lookup_log (ip_hash, created_at desc);
