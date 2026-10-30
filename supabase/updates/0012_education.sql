-- =============================================================================
-- Education: schools, strands, and degrees (e.g. Bachelor of Elementary
-- Education), shown as their own homepage section, with optional diploma
-- photos or PDFs shown in a view-only viewer.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. Run it ONCE (only needed if setup.sql was run before this existed).
-- =============================================================================
create table public.education (
  id uuid primary key default gen_random_uuid(),
  school text not null check (char_length(school) between 1 and 150),
  program text not null check (char_length(program) between 1 and 150), -- e.g. "Senior High School · ABM Strand"
  location text not null default '' check (char_length(location) <= 100),
  start_year integer check (start_year between 1950 and 2100),
  end_year integer check (end_year between 1950 and 2100), -- graduation year, or the expected one
  in_progress boolean not null default false, -- still studying: end_year shows as "Expected"
  details text not null default '' check (char_length(details) <= 1000), -- honors, focus, thesis
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  show_for uuid[] not null default '{}', -- profile IDs; empty = every profile
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_year is null or start_year is null or end_year >= start_year)
);

create trigger set_updated_at before update on public.education
  for each row execute function private.set_updated_at();

-- Same rules as the other content tables: visitors read non-hidden rows,
-- only the admin can change anything.
grant select on public.education to anon, authenticated;
grant insert, update, delete on public.education to authenticated;
alter table public.education enable row level security;

create policy "Visitors see non-hidden rows; admin sees all" on public.education
  for select to anon, authenticated
  using (status <> 'hidden' or (select private.is_admin()));
create policy "Admin can insert" on public.education
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admin can update" on public.education
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admin can delete" on public.education
  for delete to authenticated using ((select private.is_admin()));

-- Add the new section to every profile's homepage order, right before
-- Certifications (or before Contact if a profile has no Certifications).
update public.focus_profiles p
set section_order = (
  select jsonb_agg(item order by position)
  from (
    select value as item, ordinality::numeric as position
    from jsonb_array_elements(p.section_order) with ordinality
    union all
    select '"education"'::jsonb,
      coalesce(
        (select ordinality - 0.5 from jsonb_array_elements(p.section_order) with ordinality
         where value = '"certifications"'),
        (select ordinality - 0.5 from jsonb_array_elements(p.section_order) with ordinality
         where value = '"contact"'),
        1000
      )
  ) as items
)
where not (p.section_order ? 'education');

alter table public.focus_profiles alter column section_order
  set default '["about","services","experience","samples","projects","skills","education","certifications","testimonials","faq","contact"]';

-- [{ "url": "https://...", "kind": "image" | "pdf", "name": "file name", "caption": "..." }]
-- Photos live in the "images" bucket, PDFs in the "resumes" bucket (both under education/).
alter table public.education
  add column files jsonb not null default '[]' check (jsonb_typeof(files) = 'array');
