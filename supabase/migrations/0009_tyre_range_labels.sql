-- Spell out odometer ranges in full (was "10k-30k km") — shorthand read as
-- ambiguous/disconnected from the tyre-life stat next to it on the dashboard.
drop view if exists public.analytics_tyre_brands;

create view public.analytics_tyre_brands as
select
  car_model,
  tyre_brand,
  case
    when odo_km < 10000 then '0-10,000 km'
    when odo_km < 30000 then '10,000-30,000 km'
    when odo_km < 60000 then '30,000-60,000 km'
    else '60,000+ km'
  end as odo_range,
  case
    when odo_km < 10000 then 1
    when odo_km < 30000 then 2
    when odo_km < 60000 then 3
    else 4
  end as odo_range_order,
  count(*) as occurrences,
  round(avg(tyre_life_remaining_pct) filter (where tyre_life_remaining_pct is not null)::numeric, 0) as avg_life_remaining_pct
from public.reports
where status in ('verified', 'pending')
  and tyre_brand is not null
  and tyre_brand <> ''
group by
  car_model,
  tyre_brand,
  case
    when odo_km < 10000 then '0-10,000 km'
    when odo_km < 30000 then '10,000-30,000 km'
    when odo_km < 60000 then '30,000-60,000 km'
    else '60,000+ km'
  end,
  case
    when odo_km < 10000 then 1
    when odo_km < 30000 then 2
    when odo_km < 60000 then 3
    else 4
  end;

grant select on public.analytics_tyre_brands to anon, authenticated;
