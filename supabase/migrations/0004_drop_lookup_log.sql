-- report_lookup_log supported a separate find-report/update-report lookup
-- flow that was replaced by a simpler design: re-submitting the report form
-- with the same registration number updates the existing report in-place
-- (see submit-report). No lookup endpoint exists anymore, so this table is
-- no longer needed.
drop table if exists public.report_lookup_log;
