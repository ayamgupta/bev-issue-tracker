-- Replace the theme-tag view (felt redundant with the issues chart — a
-- category+count told you nothing a checkbox didn't already) with real,
-- opt-in owner quotes, still clustered by the same theme keywords so
-- related complaints stay grouped together instead of becoming a flat,
-- unsorted list. Notes are only ever shown publicly verbatim when the
-- submitter explicitly checked the new opt-in box on the report form; the
-- default stays false, so existing/past submissions are never surfaced here
-- retroactively.
drop view if exists public.analytics_notes_themes;

alter table public.reports add column if not exists notes_public_opt_in boolean not null default false;

create or replace view public.analytics_public_notes as
with themes(rank, theme, pattern) as (
  values
    (1, 'Charging', '(charg|plug)'),
    (2, 'Battery / range', '(batter|range|degrad)'),
    (3, 'Software / infotainment', '(software|infotainment|firmware|update|freeze|crash|glitch|bug|\yapp\y|fault|error)'),
    (4, 'Audio', '(audio|speaker|\ysound\y|bass|distort|crackl)'),
    (5, 'Noise / rattle', '(noise|rattle|squeak|vibrat)'),
    (6, 'Steering / handling', '(steering|handling|alignment)'),
    (7, 'ADAS / safety', '(adas|collision|brake|airbag|\ysafety\y)'),
    (8, 'Fit & finish', '(panel|paint|fit and finish|\ygap\y)'),
    (9, 'Service experience', '(service|dealer|technician|\ycentre\y|\ycenter\y)'),
    (10, 'Delivery / waiting', '(deliver|waiting|booking)')
),
opted_in as (
  select id, car_model, city, notes, created_at
  from public.reports
  where status in ('verified', 'pending')
    and notes_public_opt_in = true
    and notes is not null
    and notes <> ''
)
select
  o.id,
  o.car_model,
  o.city,
  o.notes,
  o.created_at,
  coalesce(
    (select t.theme from themes t where o.notes ~* t.pattern order by t.rank limit 1),
    'General'
  ) as theme
from opted_in o
order by created_at desc
limit 50;

grant select on public.analytics_public_notes to anon, authenticated;
