-- Collect tyre brand and estimated remaining tyre life, self-reported
-- (owners asked for this — same self-reported pattern as software_version,
-- see 0005_variant_filter_and_software_version.sql).
alter table public.reports add column if not exists tyre_brand text;
alter table public.reports add column if not exists tyre_life_remaining_pct smallint
  check (tyre_life_remaining_pct is null or tyre_life_remaining_pct between 0 and 100);

create or replace view public.analytics_tyre_brands as
select
  car_model,
  tyre_brand,
  count(*) as occurrences,
  round(avg(tyre_life_remaining_pct) filter (where tyre_life_remaining_pct is not null)::numeric, 0) as avg_life_remaining_pct
from public.reports
where status in ('verified', 'pending')
  and tyre_brand is not null
  and tyre_brand <> ''
group by car_model, tyre_brand;

grant select on public.analytics_tyre_brands to anon, authenticated;
