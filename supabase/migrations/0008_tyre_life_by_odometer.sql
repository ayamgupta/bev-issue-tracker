-- Tyre life remaining only makes sense alongside odometer reading (70% left
-- means very different things at 5,000km vs 50,000km) — bucket by mileage
-- range instead of showing a brand-only average. odo_km already exists on
-- `reports` (required field), so no new column needed.
drop view if exists public.analytics_tyre_brands;

create view public.analytics_tyre_brands as
select
  car_model,
  tyre_brand,
  case
    when odo_km < 10000 then '0-10k km'
    when odo_km < 30000 then '10k-30k km'
    when odo_km < 60000 then '30k-60k km'
    else '60k+ km'
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
    when odo_km < 10000 then '0-10k km'
    when odo_km < 30000 then '10k-30k km'
    when odo_km < 60000 then '30k-60k km'
    else '60k+ km'
  end,
  case
    when odo_km < 10000 then 1
    when odo_km < 30000 then 2
    when odo_km < 60000 then 3
    else 4
  end;

grant select on public.analytics_tyre_brands to anon, authenticated;
