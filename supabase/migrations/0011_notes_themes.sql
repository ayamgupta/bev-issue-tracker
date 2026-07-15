-- Replace the word-cloud view with theme tags — a fixed set of topics
-- (keyword-matched, case-insensitive) that reads much better on the
-- dashboard than a loose bag of words. Same privacy stance as before:
-- only aggregate theme+count ever reaches the browser, raw notes text
-- never does, and a theme needs >= 2 distinct reports to appear so a
-- single report's odd phrasing can't stand out on its own.
drop view if exists public.analytics_notes_word_frequency;

create or replace view public.analytics_notes_themes as
with themes(theme, pattern) as (
  values
    ('Charging', '(charg|plug)'),
    ('Battery / range', '(batter|range|degrad)'),
    ('Software / infotainment', '(software|infotainment|firmware|update|freeze|crash|glitch|bug|\yapp\y|fault|error)'),
    ('Audio', '(audio|speaker|\ysound\y|bass|distort|crackl)'),
    ('Noise / rattle', '(noise|rattle|squeak|vibrat)'),
    ('Steering / handling', '(steering|handling|alignment)'),
    ('ADAS / safety', '(adas|collision|brake|airbag|\ysafety\y)'),
    ('Fit & finish', '(panel|paint|fit and finish|\ygap\y)'),
    ('Service experience', '(service|dealer|technician|\ycentre\y|\ycenter\y)'),
    ('Delivery / waiting', '(deliver|waiting|booking)')
)
select
  t.theme,
  count(distinct r.id) as occurrences
from public.reports r
join themes t on r.notes ~* t.pattern
where r.status in ('verified', 'pending')
  and r.notes is not null
  and r.notes <> ''
group by t.theme
having count(distinct r.id) >= 2
order by occurrences desc;

grant select on public.analytics_notes_themes to anon, authenticated;
