-- =============================================================================
-- A one-line result for each work sample (e.g. "Cut reporting from 3 hours to
-- 20 minutes"), shown first on the sample card and page.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. Run it ONCE (only needed if setup.sql was run before this existed).
-- =============================================================================

alter table public.work_samples
  add column result text not null default '' check (char_length(result) <= 160);
