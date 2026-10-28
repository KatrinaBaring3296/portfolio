-- =============================================================================
-- Sample Work: examples of your work, each with a main description and any
-- number of photos / PDFs, every one with its own description. Each sample
-- gets its own page at /samples/<slug>.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. Run it ONCE (only needed if setup.sql was run before Sample Work existed).
-- =============================================================================

create table public.work_samples (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), -- e.g. email-templates
  title text not null,
  summary text not null default '',      -- one sentence for the card
  description text not null default '',  -- main description (markdown)
  tools text[] not null default '{}',    -- e.g. {Google Sheets, Canva}
  -- The photos and PDFs, in display order:
  -- [{ "url": "https://...", "kind": "image" | "pdf", "name": "file name", "caption": "..." }]
  -- Photos live in the "images" bucket, PDFs in the "resumes" bucket (both under samples/).
  items jsonb not null default '[]' check (jsonb_typeof(items) = 'array'),
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  show_for uuid[] not null default '{}', -- profile IDs; empty = every profile
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.work_samples
  for each row execute function private.set_updated_at();

-- Same rules as the other content tables: visitors read non-hidden rows,
-- only the admin can change anything.
grant select on public.work_samples to anon, authenticated;
grant insert, update, delete on public.work_samples to authenticated;
alter table public.work_samples enable row level security;

create policy "Visitors see non-hidden rows; admin sees all" on public.work_samples
  for select to anon, authenticated
  using (status <> 'hidden' or (select private.is_admin()));
create policy "Admin can insert" on public.work_samples
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admin can update" on public.work_samples
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admin can delete" on public.work_samples
  for delete to authenticated using ((select private.is_admin()));

-- Add the new section to every profile's homepage order, right after
-- Experience (or before Contact if a profile has no Experience).
update public.focus_profiles p
set section_order = (
  select jsonb_agg(item order by position)
  from (
    select value as item, ordinality::numeric as position
    from jsonb_array_elements(p.section_order) with ordinality
    union all
    select '"samples"'::jsonb,
      coalesce(
        (select ordinality + 0.5 from jsonb_array_elements(p.section_order) with ordinality
         where value = '"experience"'),
        (select ordinality - 0.5 from jsonb_array_elements(p.section_order) with ordinality
         where value = '"contact"'),
        1000
      )
  ) as items
)
where not (p.section_order ? 'samples');

alter table public.focus_profiles alter column section_order
  set default '["about","services","experience","samples","projects","skills","certifications","testimonials","faq","contact"]';
