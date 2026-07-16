-- Collect battery pack size (59 kWh or 79 kWh, same two options across all
-- three models) alongside variant. Nullable since existing reports predate
-- this field.
alter table public.reports add column if not exists battery_pack text
  check (battery_pack is null or battery_pack in ('59 kWh', '79 kWh'));
