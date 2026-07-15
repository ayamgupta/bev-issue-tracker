-- Narrow odometer buckets from 10k/30k/60k-wide bands to fixed 5,000km bands
-- (0-5k, 5k-10k, 10k-15k, ...) for a more precise read on tyre wear vs
-- mileage. odo_range_order is now the bucket's starting km, so numeric sort
-- still works with no cap on the number of buckets.
drop view if exists public.analytics_tyre_brands;

create view public.analytics_tyre_brands as
select
  car_model,
  tyre_brand,
  to_char(bucket * 5000, 'FM999,999') || '-' || to_char(bucket * 5000 + 5000, 'FM999,999') || ' km' as odo_range,
  bucket * 5000 as odo_range_order,
  count(*) as occurrences,
  round(avg(tyre_life_remaining_pct) filter (where tyre_life_remaining_pct is not null)::numeric, 0) as avg_life_remaining_pct
from (
  select *, (odo_km / 5000) as bucket
  from public.reports
  where status in ('verified', 'pending')
    and tyre_brand is not null
    and tyre_brand <> ''
) r
group by car_model, tyre_brand, bucket;

grant select on public.analytics_tyre_brands to anon, authenticated;
