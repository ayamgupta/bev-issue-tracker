-- Add a unique-submitter count to the public analytics summary.
--
-- Reports are anonymous (no accounts), so "unique users" is approximated by
-- distinct hashed submitter IPs — the same signal already collected for
-- rate-limiting in the submit-report Edge Function. Only the COUNT is
-- exposed here, never the underlying submitter_ip_hash values.
create or replace view public.analytics_summary as
select
  count(*) as total_reports,
  count(*) filter (where status = 'verified') as verified_reports,
  count(distinct city) as cities_represented,
  count(distinct submitter_ip_hash) as unique_submitters
from public.reports
where status in ('verified', 'pending');
