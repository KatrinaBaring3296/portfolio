-- =============================================================================
-- Videos in work samples: a "videos" storage bucket for uploaded clips (MP4,
-- WebM, MOV, 50 MB max, the largest upload the free plan allows). Video links
-- (YouTube, Loom, Vimeo, Google Drive) need no setup: they're stored in the
-- sample's items like photos and PDFs.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste this whole
-- file > Run. Run it ONCE (only needed if setup.sql was run before this existed).
-- =============================================================================

-- Public like the other buckets: anyone with a video's link can watch it.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('videos', 'videos', true, 52428800, -- 50 MB
    array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do nothing;

-- Same rules as the images and resumes buckets: only the admin can upload,
-- replace, or delete. Recreated to add the new bucket to each one.
drop policy "Admin can see files" on storage.objects;
drop policy "Admin can upload files" on storage.objects;
drop policy "Admin can replace files" on storage.objects;
drop policy "Admin can delete files" on storage.objects;

create policy "Admin can see files" on storage.objects
  for select to authenticated
  using (bucket_id in ('images', 'resumes', 'videos') and (select private.is_admin()));

create policy "Admin can upload files" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('images', 'resumes', 'videos') and (select private.is_admin()));

create policy "Admin can replace files" on storage.objects
  for update to authenticated
  using (bucket_id in ('images', 'resumes', 'videos') and (select private.is_admin()))
  with check (bucket_id in ('images', 'resumes', 'videos') and (select private.is_admin()));

create policy "Admin can delete files" on storage.objects
  for delete to authenticated
  using (bucket_id in ('images', 'resumes', 'videos') and (select private.is_admin()));
