-- =============================================================================
-- Portfolio database: EVERYTHING in one file (tables, security rules (RLS),
-- storage buckets, and starting content).
--
-- BEFORE RUNNING: replace you@example.com below (search "CHANGE THIS") with
-- the email used to log in to /admin (the same one as ADMIN_EMAIL).
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. Run it ONCE, on a fresh project.
-- =============================================================================



-- #############################################################################
-- migrations/0001_initial_schema.sql
-- #############################################################################

-- =============================================================================
-- Portfolio database: tables, security rules (RLS), and storage buckets.
--
--
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Admin check
-- The "private" schema is not reachable through the public API, so visitors
-- can't read or change the admin email.
-- -----------------------------------------------------------------------------
create schema if not exists private;

create table private.admin (
  email text primary key
);

insert into private.admin (email) values ('you@example.com'); -- <-- CHANGE THIS to her admin email

-- True when the logged-in user's email is the admin email.
-- "security definer" lets it read private.admin on the visitor's behalf.
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.admin a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  );
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

-- Keeps updated_at current on every edit.
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- 2. Tables
-- status is one of: active (shown), coming_soon (shown with a badge),
-- hidden (only visible in the admin panel).
-- -----------------------------------------------------------------------------

create table public.focus_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), -- e.g. technical-va
  label text not null,
  headline text not null default '',
  pitch text not null default '',
  resume_url text,
  highlighted_category_ids uuid[] not null default '{}', -- shown first, in this order
  section_order jsonb not null
    default '["about","services","experience","projects","skills","testimonials","contact"]'
    check (jsonb_typeof(section_order) = 'array'),
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exactly one row (id is always 1).
create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  name text not null default '',
  photo_url text,
  email text not null default '',
  about text not null default '',
  social_links jsonb not null default '[]' check (jsonb_typeof(social_links) = 'array'), -- [{ "label": "LinkedIn", "url": "https://..." }]
  availability_text text not null default '',
  reply_time_text text not null default '',
  default_profile_id uuid references public.focus_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  icon text not null default 'Sparkles', -- a name from components/public/icon.tsx
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories (id) on delete cascade,
  title text not null,
  description text not null default '',
  icon text not null default 'Sparkles',
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  content text not null default '', -- markdown
  tech_stack text[] not null default '{}',
  cover_image text,
  gallery text[] not null default '{}',
  github_url text,
  demo_url text,
  featured boolean not null default false,
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  show_for uuid[] not null default '{}', -- profile IDs; empty = every profile
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  start_date date not null,
  end_date date, -- empty = present
  description text not null default '',
  category text not null default 'va' check (category in ('va', 'teaching', 'business')),
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  show_for uuid[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  skill_group text not null check (skill_group in ('admin', 'technical')),
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  show_for uuid[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  quote text not null,
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Contact form inbox. Length limits match lib/validation.ts.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254 and email like '%_@_%._%'),
  message text not null check (char_length(message) between 10 and 3000),
  profile_slug text check (char_length(profile_slug) <= 100), -- which profile page they came from
  ip_hash text, -- scrambled visitor IP, only used for rate limiting
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index messages_created_at_idx on public.messages (created_at desc);
create index messages_ip_hash_idx on public.messages (ip_hash, created_at);

-- updated_at triggers for every table
do $$
declare
  t text;
begin
  foreach t in array array[
    'focus_profiles', 'site_settings', 'service_categories', 'services',
    'projects', 'experience', 'skills', 'testimonials', 'messages'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function private.set_updated_at()', t);
  end loop;
end;
$$;


-- -----------------------------------------------------------------------------
-- 3. Contact form spam protection (rate limit)
-- Runs before every new message. Limits: 3 messages per visitor per
-- 10 minutes, and 30 messages per hour in total.
-- -----------------------------------------------------------------------------
create function private.limit_messages()
returns trigger
language plpgsql
security definer -- needs to count messages, which visitors can't read
set search_path = ''
as $$
begin
  if new.ip_hash is not null and (
    select count(*) from public.messages
    where ip_hash = new.ip_hash and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'rate_limited';
  end if;

  if (
    select count(*) from public.messages
    where created_at > now() - interval '1 hour'
  ) >= 30 then
    raise exception 'rate_limited';
  end if;

  -- Visitors can't pre-mark a message as read or fake its date
  new.is_read := false;
  new.created_at := now();
  return new;
end;
$$;

create trigger limit_messages before insert on public.messages
  for each row execute function private.limit_messages();


-- -----------------------------------------------------------------------------
-- 4. Row Level Security
-- Visitors: read anything not hidden, and send messages. Nothing else.
-- Admin: everything.
-- -----------------------------------------------------------------------------

-- Table permissions (RLS below decides which ROWS each person can touch)
revoke all on all tables in schema public from anon, authenticated;
grant select on
  public.focus_profiles, public.site_settings, public.service_categories, public.services,
  public.projects, public.experience, public.skills, public.testimonials
  to anon, authenticated;
grant insert, update, delete on
  public.focus_profiles, public.site_settings, public.service_categories, public.services,
  public.projects, public.experience, public.skills, public.testimonials
  to authenticated;
grant insert on public.messages to anon, authenticated;
grant select, update, delete on public.messages to authenticated;

-- The 7 tables with a status column all get the same four rules
do $$
declare
  t text;
begin
  foreach t in array array[
    'focus_profiles', 'service_categories', 'services',
    'projects', 'experience', 'skills', 'testimonials'
  ] loop
    execute format('alter table public.%I enable row level security', t);

    execute format(
      'create policy "Visitors see non-hidden rows; admin sees all" on public.%I
       for select to anon, authenticated
       using (status <> ''hidden'' or (select private.is_admin()))', t);

    execute format(
      'create policy "Admin can insert" on public.%I
       for insert to authenticated
       with check ((select private.is_admin()))', t);

    execute format(
      'create policy "Admin can update" on public.%I
       for update to authenticated
       using ((select private.is_admin()))
       with check ((select private.is_admin()))', t);

    execute format(
      'create policy "Admin can delete" on public.%I
       for delete to authenticated
       using ((select private.is_admin()))', t);
  end loop;
end;
$$;

-- Site settings: everyone can read, only admin can change
alter table public.site_settings enable row level security;

create policy "Everyone can read settings" on public.site_settings
  for select to anon, authenticated using (true);

create policy "Admin can insert settings" on public.site_settings
  for insert to authenticated with check ((select private.is_admin()));

create policy "Admin can update settings" on public.site_settings
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Messages: anyone can send, only admin can read, mark read, or delete
alter table public.messages enable row level security;

create policy "Anyone can send a message" on public.messages
  for insert to anon, authenticated with check (true);

create policy "Admin can read messages" on public.messages
  for select to authenticated using ((select private.is_admin()));

create policy "Admin can update messages" on public.messages
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admin can delete messages" on public.messages
  for delete to authenticated using ((select private.is_admin()));


-- -----------------------------------------------------------------------------
-- 5. Storage buckets
-- Public buckets: anyone with a file's link can view it. Only the admin can
-- upload, replace, or delete. Visitors can't list what's in a bucket.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('images', 'images', true, 5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']),
  ('resumes', 'resumes', true, 10485760, -- 10 MB
    array['application/pdf'])
on conflict (id) do nothing;

create policy "Admin can see files" on storage.objects
  for select to authenticated
  using (bucket_id in ('images', 'resumes') and (select private.is_admin()));

create policy "Admin can upload files" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('images', 'resumes') and (select private.is_admin()));

create policy "Admin can replace files" on storage.objects
  for update to authenticated
  using (bucket_id in ('images', 'resumes') and (select private.is_admin()))
  with check (bucket_id in ('images', 'resumes') and (select private.is_admin()));

create policy "Admin can delete files" on storage.objects
  for delete to authenticated
  using (bucket_id in ('images', 'resumes') and (select private.is_admin()));


-- #############################################################################
-- migrations/0002_certificates.sql
-- #############################################################################

-- =============================================================================
-- Certifications section.
--
-- =============================================================================

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,                -- e.g. Google IT Support Professional Certificate
  issuer text not null default '',    -- e.g. Coursera, TESDA
  credential_id text,                 -- the ID printed on the certificate
  issue_date date,
  expiry_date date,                   -- empty = no expiration
  credential_url text,                -- online "verify" page, if the issuer has one
  image_url text,                     -- watermarked preview (the original is never uploaded)
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  show_for uuid[] not null default '{}', -- profile IDs; empty = every profile
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expiry_date is null or issue_date is null or expiry_date >= issue_date)
);

create trigger set_updated_at before update on public.certificates
  for each row execute function private.set_updated_at();

-- Same rules as the other content tables: visitors read non-hidden rows,
-- only the admin can change anything.
grant select on public.certificates to anon, authenticated;
grant insert, update, delete on public.certificates to authenticated;

alter table public.certificates enable row level security;

create policy "Visitors see non-hidden rows; admin sees all" on public.certificates
  for select to anon, authenticated
  using (status <> 'hidden' or (select private.is_admin()));

create policy "Admin can insert" on public.certificates
  for insert to authenticated with check ((select private.is_admin()));

create policy "Admin can update" on public.certificates
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admin can delete" on public.certificates
  for delete to authenticated using ((select private.is_admin()));

-- Add the new section to every profile's homepage order (just before Contact),
-- and to the default for profiles created later.
update public.focus_profiles p
set section_order = (
  select jsonb_agg(item order by position)
  from (
    select value as item, ordinality::numeric as position
    from jsonb_array_elements(p.section_order) with ordinality
    union all
    select '"certifications"'::jsonb,
      coalesce(
        (select ordinality from jsonb_array_elements(p.section_order) with ordinality
         where value = '"contact"'),
        1000
      ) - 0.5
  ) as items
)
where not (p.section_order ? 'certifications');

alter table public.focus_profiles alter column section_order
  set default '["about","services","experience","projects","skills","certifications","testimonials","contact"]';


-- #############################################################################
-- migrations/0003_hiring_links_and_resume_stats.sql
-- #############################################################################

-- =============================================================================
-- Hiring links (booking, Upwork, OnlineJobs.ph) and résumé download counting.
--
-- =============================================================================

-- 1. New site-wide links, edited in Admin > Site settings
alter table public.site_settings
  add column booking_url text,      -- e.g. Calendly: shows a "Book a call" button
  add column upwork_url text,       -- shows a "Hire me on Upwork" button
  add column onlinejobs_url text;   -- shows a "Hire me on OnlineJobs.ph" button

-- 2. One row per résumé download, so the dashboard can show which
--    profile's résumé gets downloaded. No visitor details are stored.
create table public.resume_downloads (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null check (char_length(profile_slug) <= 100),
  created_at timestamptz not null default now()
);

create index resume_downloads_created_at_idx on public.resume_downloads (created_at desc);

grant insert on public.resume_downloads to anon, authenticated;
grant select, delete on public.resume_downloads to authenticated;

alter table public.resume_downloads enable row level security;

-- Anyone can record a download; only the admin can read the counts.
create policy "Anyone can record a download" on public.resume_downloads
  for insert to anon, authenticated with check (true);

create policy "Admin can read downloads" on public.resume_downloads
  for select to authenticated using ((select private.is_admin()));

create policy "Admin can delete downloads" on public.resume_downloads
  for delete to authenticated using ((select private.is_admin()));


-- #############################################################################
-- migrations/0004_hiring_platforms_list.sql
-- #############################################################################

-- =============================================================================
-- Hiring platforms as a list (Upwork, OnlineJobs.ph, VirtualStaff.ph, ...),
-- so you can add as many as you like in Admin > Site settings.
--
-- =============================================================================

alter table public.site_settings
  add column hiring_platforms jsonb not null default '[]'
    check (jsonb_typeof(hiring_platforms) = 'array'); -- [{ "label": "Upwork", "url": "https://..." }]

-- Move the Upwork and OnlineJobs.ph links you already saved into the new list
update public.site_settings
set hiring_platforms = coalesce(
  (
    select jsonb_agg(jsonb_build_object('label', label, 'url', url) order by position)
    from (values
      ('Upwork', upwork_url, 1),
      ('OnlineJobs.ph', onlinejobs_url, 2)
    ) as old_links (label, url, position)
    where url is not null and url <> ''
  ),
  '[]'
)
where id = 1;

-- The old single-platform columns are no longer used by the site.
-- They're kept (not deleted) so nothing breaks while the new code deploys.
comment on column public.site_settings.upwork_url is 'Replaced by hiring_platforms (0004)';
comment on column public.site_settings.onlinejobs_url is 'Replaced by hiring_platforms (0004)';


-- #############################################################################
-- migrations/0005_skill_logos.sql
-- #############################################################################

-- =============================================================================
-- Logos for skills and tools (shown as logo tiles in "Tools I use").
--
-- =============================================================================

alter table public.skills
  -- A logo from the built-in library (Simple Icons), e.g. 'gmail' or 'python'.
  -- Empty = match automatically by the skill's name; 'none' = never show a logo.
  add column icon text check (icon is null or icon ~ '^[a-z0-9]+$'),
  -- An uploaded logo image, for tools the library doesn't have (e.g. Canva).
  -- Takes priority over `icon`.
  add column logo_url text;


-- #############################################################################
-- migrations/0006_experience_proof.sql
-- #############################################################################

-- =============================================================================
-- Proof images on work experience entries (e.g. a delivery-partner
-- certificate), shown as a view-only "View proof" button on the timeline.
--
-- =============================================================================

alter table public.experience
  -- Watermarked preview images (the originals are never uploaded), in display order
  add column proof_images text[] not null default '{}';


-- #############################################################################
-- migrations/0007_experience_proof_captions.sql
-- #############################################################################

-- =============================================================================
-- Captions for experience proof images: each proof item is now an image plus
-- an optional caption, e.g. [{ "url": "https://...", "caption": "I built this sheet" }].
--
-- =============================================================================

alter table public.experience
  add column proof jsonb not null default '[]' check (jsonb_typeof(proof) = 'array');

-- Copy any proof images saved before this change (without captions)
update public.experience
set proof = (
  select coalesce(jsonb_agg(jsonb_build_object('url', url, 'caption', '') order by position), '[]')
  from unnest(proof_images) with ordinality as images (url, position)
)
where cardinality(proof_images) > 0;

-- The old column is no longer used by the site; kept so nothing breaks mid-update.
comment on column public.experience.proof_images is 'Replaced by proof (0007)';


-- #############################################################################
-- migrations/0008_testimonial_requests.sql
-- #############################################################################

-- =============================================================================
-- Testimonial request links: send someone a private, single-use link; they
-- fill in a form; the testimonial arrives in the admin as Hidden for review.
--
-- =============================================================================

create table public.testimonial_requests (
  id uuid primary key default gen_random_uuid(),
  token text not null unique check (char_length(token) >= 20), -- the secret part of the link
  name text not null check (char_length(name) between 1 and 100), -- who it was sent to
  created_at timestamptz not null default now(),
  used_at timestamptz, -- set when the form is submitted (each link works once)
  testimonial_id uuid references public.testimonials (id) on delete set null
);

-- Only the admin can see or manage the links directly
grant select, insert, update, delete on public.testimonial_requests to authenticated;
alter table public.testimonial_requests enable row level security;

create policy "Admin manages testimonial requests" on public.testimonial_requests
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Visitors never touch the table. These two functions are the only way in,
-- and they only work with a valid, unused link.

-- Who a link was sent to (to greet them on the form), or nothing if the link
-- is unknown or already used.
create function public.get_testimonial_request(p_token text)
returns table (name text)
language sql
stable
security definer
set search_path = ''
as $$
  select r.name from public.testimonial_requests r
  where r.token = p_token and r.used_at is null;
$$;

-- Saves the testimonial as Hidden (you review it before it shows), and uses up the link.
create function public.submit_testimonial(p_token text, p_name text, p_role text, p_quote text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_id uuid;
  new_id uuid;
begin
  if char_length(trim(p_name)) not between 1 and 100
     or char_length(trim(coalesce(p_role, ''))) > 120
     or char_length(trim(p_quote)) not between 20 and 1500 then
    raise exception 'invalid_input';
  end if;

  -- "for update" stops the same link being submitted twice at once
  select id into request_id from public.testimonial_requests
  where token = p_token and used_at is null
  for update;
  if request_id is null then
    raise exception 'invalid_link';
  end if;

  insert into public.testimonials (name, role, quote, status, sort_order)
  values (
    trim(p_name),
    trim(coalesce(p_role, '')),
    trim(p_quote),
    'hidden',
    (select coalesce(max(sort_order), 0) + 1 from public.testimonials)
  )
  returning id into new_id;

  update public.testimonial_requests
  set used_at = now(), testimonial_id = new_id
  where id = request_id;

  return new_id;
end;
$$;

revoke all on function public.get_testimonial_request(text) from public;
revoke all on function public.submit_testimonial(text, text, text, text) from public;
grant execute on function public.get_testimonial_request(text) to anon, authenticated;
grant execute on function public.submit_testimonial(text, text, text, text) to anon, authenticated;


-- #############################################################################
-- migrations/0009_faq_availability_2fa.sql
-- #############################################################################

-- =============================================================================
-- FAQ section, availability status, and two-step login (2FA) for the admin.
--
-- =============================================================================


-- 1. FAQ: questions and answers shown as an expandable list
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 1 and 200),
  answer text not null check (char_length(answer) between 1 and 2000),
  status text not null default 'active' check (status in ('active', 'coming_soon', 'hidden')),
  show_for uuid[] not null default '{}', -- profile IDs; empty = every profile
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.faqs
  for each row execute function private.set_updated_at();

grant select on public.faqs to anon, authenticated;
grant insert, update, delete on public.faqs to authenticated;
alter table public.faqs enable row level security;

create policy "Visitors see non-hidden rows; admin sees all" on public.faqs
  for select to anon, authenticated
  using (status <> 'hidden' or (select private.is_admin()));
create policy "Admin can insert" on public.faqs
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admin can update" on public.faqs
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admin can delete" on public.faqs
  for delete to authenticated using ((select private.is_admin()));


-- 2. Availability status: colors the badge above your headline
alter table public.site_settings
  add column availability_status text not null default 'available'
    check (availability_status in ('available', 'limited', 'booked'));


-- 3. Two-step login: once you turn on 2FA in Admin > Security, the database
--    only accepts admin changes from a session that also passed the 6-digit
--    code (Supabase marks those sessions "aal2"). A stolen password alone
--    can't change anything.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.admin a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  )
  and (
    -- passed the 2FA code in this session...
    coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    -- ...or 2FA isn't turned on for this account
    or not exists (
      select 1 from auth.mfa_factors f
      where f.user_id = auth.uid() and f.status = 'verified'
    )
  );
$$;


-- #############################################################################
-- seed.sql
-- #############################################################################

-- =============================================================================
-- Starting content (part of setup.sql; runs after the tables are created).
-- Personal text is placeholder [in brackets]: edit it in the admin panel.
-- Projects, experience, skills, certificates, testimonials, and FAQs start
-- empty on purpose.
-- =============================================================================

-- Service categories
insert into public.service_categories (name, slug, description, icon, status, sort_order) values
  ('Admin Support', 'admin', 'Organized, reliable help with the day-to-day tasks.', 'ClipboardList', 'active', 1),
  ('Customer Support', 'customer-support', 'Patient, friendly replies that keep your customers happy.', 'Headset', 'active', 2),
  ('Education Support', 'education', 'Behind-the-scenes help for schools, teachers, and course creators.', 'School', 'active', 3),
  ('Online Tutoring', 'tutoring', 'Clear, encouraging lessons for learners of all ages.', 'GraduationCap', 'active', 4);

-- Services, linked to their category by slug
insert into public.services (category_id, title, description, icon, status, sort_order)
select c.id, s.title, s.description, s.icon, s.status, s.sort_order
from (values
  ('admin', 'General VA', 'Email, scheduling, research, and everyday admin tasks.', 'Briefcase', 'active', 1),
  ('admin', 'Email & Calendar Management', 'An inbox that stays tidy and a calendar that stays on track.', 'CalendarDays', 'active', 2),
  ('admin', 'Data Entry & Documents', 'Accurate data entry, spreadsheets, and neatly formatted documents.', 'FileText', 'active', 3),
  ('customer-support', 'Email & Chat Support', 'Answering customer questions with care and clear explanations.', 'MessagesSquare', 'active', 1),
  ('customer-support', 'Customer Follow-ups', 'Order updates, inquiries, and keeping customer records up to date.', 'Mail', 'active', 2),
  ('education', 'Lesson Plans & Materials', 'Lesson plans, worksheets, and slides made ready to teach.', 'NotebookPen', 'active', 1),
  ('education', 'Grading & Student Records', 'Checking work, recording grades, and keeping records organized.', 'ClipboardList', 'active', 2),
  ('education', 'Online Class Setup', 'Setting up and managing Google Classroom and other learning platforms.', 'Presentation', 'active', 3),
  ('tutoring', 'English / ESL Lessons', 'Conversation, grammar, and reading lessons for English learners.', 'Languages', 'active', 1),
  ('tutoring', 'Academic Tutoring', 'One-on-one help with school subjects and homework.', 'BookOpen', 'active', 2)
) as s (category_slug, title, description, icon, status, sort_order)
join public.service_categories c on c.slug = s.category_slug;

-- Focus profiles. highlighted_category_ids lists category IDs in display order.
insert into public.focus_profiles
  (slug, label, headline, pitch, highlighted_category_ids, section_order, status, sort_order)
values
  ('general-va', 'General / Admin VA',
    '[Headline for General / Admin VA]',
    '[Pitch: one or two sentences about what you help clients with.]',
    array[
      (select id from public.service_categories where slug = 'admin'),
      (select id from public.service_categories where slug = 'customer-support')
    ],
    '["about","services","experience","skills","projects","certifications","testimonials","faq","contact"]',
    'active', 1),
  ('customer-support', 'Customer Support',
    '[Headline for Customer Support]',
    '[Pitch for Customer Support.]',
    array[(select id from public.service_categories where slug = 'customer-support')],
    '["about","services","experience","skills","projects","certifications","testimonials","faq","contact"]',
    'active', 2),
  ('education-va', 'Education VA',
    '[Headline for Education VA]',
    '[Pitch for Education VA.]',
    array[
      (select id from public.service_categories where slug = 'education'),
      (select id from public.service_categories where slug = 'admin')
    ],
    '["about","services","experience","projects","skills","certifications","testimonials","faq","contact"]',
    'active', 3),
  ('online-tutor', 'Online Tutor / ESL',
    '[Headline for Online Tutor / ESL]',
    '[Pitch for Online Tutor / ESL.]',
    array[(select id from public.service_categories where slug = 'tutoring')],
    '["about","services","experience","certifications","skills","projects","testimonials","faq","contact"]',
    'active', 4);

-- Site-wide settings (the single row)
insert into public.site_settings
  (id, name, email, about, social_links, availability_text, reply_time_text, default_profile_id)
values (
  1,
  '[Your Name]',
  'you@example.com',
  E'[About you: your teaching background, and the VA work you''re looking for now.]\n\n[How you work with clients: communication, time zone, reliability.]',
  '[]',
  'Available for work · Philippines (UTC+8) · Flexible hours',
  'Usually replies within 24 hours',
  (select id from public.focus_profiles where slug = 'general-va')
);
