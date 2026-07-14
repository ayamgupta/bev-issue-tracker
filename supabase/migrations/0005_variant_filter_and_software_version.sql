-- 1. Add `variant` to the issue-frequency view so the dashboard can filter
--    by variant, not just car model. CREATE OR REPLACE can't reorder/insert
--    columns mid-list, so drop and recreate.
drop view if exists public.analytics_issue_frequency;

create view public.analytics_issue_frequency as
select
  car_model,
  variant,
  issue,
  'major' as severity,
  count(*) as occurrences
from public.reports, unnest(major_issues) as issue
where status in ('verified', 'pending')
group by car_model, variant, issue
union all
select
  car_model,
  variant,
  issue,
  'minor' as severity,
  count(*) as occurrences
from public.reports, unnest(minor_issues) as issue
where status in ('verified', 'pending')
group by car_model, variant, issue;

grant select on public.analytics_issue_frequency to anon, authenticated;

-- 2. Collect the vehicle's current software/firmware version, self-reported
--    (there's no fixed list yet — see analytics_software_versions below,
--    which is meant to surface what versions are actually out there first).
alter table public.reports add column if not exists software_version text;

create or replace view public.analytics_software_versions as
select
  car_model,
  software_version,
  count(*) as occurrences
from public.reports
where status in ('verified', 'pending')
  and software_version is not null
  and software_version <> ''
group by car_model, software_version;

grant select on public.analytics_software_versions to anon, authenticated;
