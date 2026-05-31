-- Eryawan Studio portfolio CMS schema
-- Run this file in Supabase SQL Editor.

-- Extensions
create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  design_category text,
  design_style text,
  area_type text,
  area_tags text[] not null default '{}',
  cover_image text,
  problem text,
  solution text,
  impact text,
  konteks text,
  konflik text,
  keputusan_desain text,
  pendekatan text,
  dampak text,
  insight_kunci text,
  client_problem_raw text,
  design_reference text,
  area_scope text,
  project_size text,
  project_status text check (project_status is null or project_status in ('konsep', 'berjalan', 'selesai')),
  completion_year integer,
  is_published boolean not null default true,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer default 0,
  area_tags text[] not null default '{}',
  display_ratio text default 'landscape',
  object_position text default 'center',
  crop_x numeric default 50,
  crop_y numeric default 50,
  crop_zoom numeric default 1,
  created_at timestamp with time zone default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  content_type text not null default 'artikel' check (content_type in ('artikel', 'review_karya')),
  source_type text not null default 'manual' check (source_type in ('project', 'image_review', 'manual')),
  source_project_id uuid references public.projects(id) on delete set null,
  cover_image text,
  excerpt text,
  content text,
  ai_prompt_source text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insight_images (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid not null references public.insights(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.project_inquiries (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  perusahaan text,
  email text,
  whatsapp text,
  jenis_kebutuhan text not null,
  lokasi_project text,
  estimasi_luas text,
  tahap_project text,
  timeline text,
  budget_range text,
  kebutuhan_utama text not null,
  status_file text,
  message_preview text not null,
  status text not null default 'baru' check (status in ('baru', 'ditinjau', 'dihubungi', 'selesai', 'arsip')),
  source text not null default 'mulai_project',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_inquiry_proposal_drafts (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.project_inquiries(id) on delete cascade,
  title text not null,
  draft_content text not null,
  follow_up_message text,
  status text not null default 'draft' check (status in ('draft', 'used', 'archived')),
  version integer not null default 1,
  model text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Compatibility alters
alter table public.projects add column if not exists design_category text;
alter table public.projects add column if not exists design_style text;
alter table public.projects add column if not exists area_type text;
alter table public.projects add column if not exists area_tags text[] not null default '{}';
alter table public.projects add column if not exists konteks text;
alter table public.projects add column if not exists konflik text;
alter table public.projects add column if not exists keputusan_desain text;
alter table public.projects add column if not exists pendekatan text;
alter table public.projects add column if not exists dampak text;
alter table public.projects add column if not exists insight_kunci text;
alter table public.projects add column if not exists is_published boolean not null default true;
alter table public.projects add column if not exists client_problem_raw text;
alter table public.projects add column if not exists design_reference text;
alter table public.projects add column if not exists area_scope text;
alter table public.projects add column if not exists project_size text;
alter table public.projects add column if not exists project_status text;
alter table public.projects add column if not exists completion_year integer;
alter table public.project_images add column if not exists area_tags text[] not null default '{}';
alter table public.project_images add column if not exists display_ratio text default 'landscape';
alter table public.project_images add column if not exists object_position text default 'center';
alter table public.project_images add column if not exists crop_x numeric default 50;
alter table public.project_images add column if not exists crop_y numeric default 50;
alter table public.project_images add column if not exists crop_zoom numeric default 1;
alter table public.insights add column if not exists content_type text not null default 'artikel';


-- Compatibility constraints
-- Add named constraints for databases upgraded from older schema snapshots.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_project_status_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_project_status_check
      check (project_status is null or project_status in ('konsep', 'berjalan', 'selesai'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'insights_content_type_check'
      and conrelid = 'public.insights'::regclass
  ) then
    alter table public.insights
      add constraint insights_content_type_check
      check (content_type in ('artikel', 'review_karya'));
  end if;
end $$;

-- Foreign keys
-- If project_images already existed without FK, add the relationship Supabase needs for embedded selects.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'project_images_project_id_fkey'
      and conrelid = 'public.project_images'::regclass
  ) then
    alter table public.project_images
    add constraint project_images_project_id_fkey
    foreign key (project_id)
    references public.projects(id)
    on delete cascade;
  end if;
end $$;


-- Timestamp helpers
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_insights_updated_at on public.insights;
create trigger update_insights_updated_at
before update on public.insights
for each row execute function public.update_updated_at_column();

drop trigger if exists update_project_inquiries_updated_at on public.project_inquiries;
create trigger update_project_inquiries_updated_at
before update on public.project_inquiries
for each row execute function public.update_updated_at_column();

drop trigger if exists update_project_inquiry_proposal_drafts_updated_at on public.project_inquiry_proposal_drafts;
create trigger update_project_inquiry_proposal_drafts_updated_at
before update on public.project_inquiry_proposal_drafts
for each row execute function public.update_updated_at_column();

-- Indexes
create index if not exists idx_project_inquiry_proposal_drafts_inquiry_id on public.project_inquiry_proposal_drafts(inquiry_id);
create index if not exists idx_project_inquiry_proposal_drafts_status on public.project_inquiry_proposal_drafts(status);
create index if not exists idx_project_inquiry_proposal_drafts_created_at_desc on public.project_inquiry_proposal_drafts(created_at desc);

-- Admin helper
-- Database-side CMS admin check matching the app fallback admin email.
-- Missing or non-admin JWT emails return false, keeping anon/authenticated calls safe.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com';
$$;

-- Grants
-- Required grants for Supabase API roles. Table DML grants remain available to
-- authenticated users so RLS can decide whether the current user is the admin.
grant usage on schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant select on public.project_images to anon, authenticated;
grant insert, update, delete on public.project_images to authenticated;
grant select on public.insights to anon, authenticated;
grant insert, update, delete on public.insights to authenticated;
grant select on public.insight_images to anon, authenticated;
grant insert, update, delete on public.insight_images to authenticated;
revoke all on public.project_inquiries from anon, authenticated;
grant insert on public.project_inquiries to anon;
grant select, update on public.project_inquiries to authenticated;
revoke all on public.project_inquiry_proposal_drafts from anon, authenticated;
grant select, insert, update on public.project_inquiry_proposal_drafts to authenticated;

-- RLS policies
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.insights enable row level security;
alter table public.insight_images enable row level security;
alter table public.project_inquiries enable row level security;
alter table public.project_inquiry_proposal_drafts enable row level security;

-- Projects: public reads only expose published projects; admins can read drafts.
drop policy if exists "Public read projects" on public.projects;
drop policy if exists "Read published projects" on public.projects;
create policy "Read published projects"
on public.projects
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Admin read all projects" on public.projects;
create policy "Admin read all projects"
on public.projects
for select
to authenticated
using (public.is_admin());

-- Projects: CMS mutations are restricted to the configured admin identity.
drop policy if exists "Authenticated insert projects" on public.projects;
drop policy if exists "Admin insert projects" on public.projects;
create policy "Admin insert projects"
on public.projects
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Authenticated update projects" on public.projects;
drop policy if exists "Admin update projects" on public.projects;
create policy "Admin update projects"
on public.projects
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated delete projects" on public.projects;
drop policy if exists "Admin delete projects" on public.projects;
create policy "Admin delete projects"
on public.projects
for delete
to authenticated
using (public.is_admin());

-- Project images: public reads are limited to images attached to published
-- projects; admins can read every image row, including draft project images.
drop policy if exists "Public read project images table" on public.project_images;
drop policy if exists "Public read project images" on public.project_images;
drop policy if exists "Read published project images" on public.project_images;
create policy "Read published project images"
on public.project_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = project_images.project_id
      and projects.is_published = true
  )
);

drop policy if exists "Admin read all project images" on public.project_images;
create policy "Admin read all project images"
on public.project_images
for select
to authenticated
using (
  public.is_admin()
  and exists (
    select 1
    from public.projects
    where projects.id = project_images.project_id
  )
);

-- Project images: CMS mutations are restricted to the configured admin identity.
drop policy if exists "Authenticated insert project images table" on public.project_images;
drop policy if exists "Authenticated insert project images" on public.project_images;
drop policy if exists "Admin insert project images" on public.project_images;
create policy "Admin insert project images"
on public.project_images
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Authenticated update project images table" on public.project_images;
drop policy if exists "Authenticated update project images" on public.project_images;
drop policy if exists "Admin update project images" on public.project_images;
create policy "Admin update project images"
on public.project_images
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated delete project images table" on public.project_images;
drop policy if exists "Authenticated delete project images" on public.project_images;
drop policy if exists "Admin delete project images" on public.project_images;
create policy "Admin delete project images"
on public.project_images
for delete
to authenticated
using (public.is_admin());


-- Insights: public reads only expose published rows; admins can read drafts.
drop policy if exists insights_public_read on public.insights;
drop policy if exists insights_authenticated_crud on public.insights;
drop policy if exists "Read published insights" on public.insights;
create policy "Read published insights"
on public.insights
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Admin read all insights" on public.insights;
create policy "Admin read all insights"
on public.insights
for select
to authenticated
using (public.is_admin());

-- Insights: CMS mutations are restricted to the configured admin identity.
drop policy if exists "Admin insert insights" on public.insights;
create policy "Admin insert insights"
on public.insights
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admin update insights" on public.insights;
create policy "Admin update insights"
on public.insights
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin delete insights" on public.insights;
create policy "Admin delete insights"
on public.insights
for delete
to authenticated
using (public.is_admin());

-- Insight images: public reads are limited to images attached to published
-- insights; admins can read every insight image row.
drop policy if exists insight_images_public_read on public.insight_images;
drop policy if exists insight_images_authenticated_crud on public.insight_images;
drop policy if exists "Read published insight images" on public.insight_images;
create policy "Read published insight images"
on public.insight_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.insights
    where insights.id = insight_images.insight_id
      and insights.is_published = true
  )
);

drop policy if exists "Admin read all insight images" on public.insight_images;
create policy "Admin read all insight images"
on public.insight_images
for select
to authenticated
using (public.is_admin());

-- Insight image mutations are admin-only.
drop policy if exists "Admin insert insight images" on public.insight_images;
create policy "Admin insert insight images"
on public.insight_images
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admin update insight images" on public.insight_images;
create policy "Admin update insight images"
on public.insight_images
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin delete insight images" on public.insight_images;
create policy "Admin delete insight images"
on public.insight_images
for delete
to authenticated
using (public.is_admin());

-- Project inquiry submissions are public inserts; review/update is admin-only.
drop policy if exists project_inquiries_anon_insert on public.project_inquiries;
create policy project_inquiries_anon_insert on public.project_inquiries
for insert to anon
with check (true);

drop policy if exists project_inquiries_authenticated_select on public.project_inquiries;
drop policy if exists project_inquiries_admin_select on public.project_inquiries;
create policy project_inquiries_admin_select on public.project_inquiries
for select to authenticated
using (public.is_admin());

drop policy if exists project_inquiries_authenticated_update on public.project_inquiries;
drop policy if exists project_inquiries_admin_update on public.project_inquiries;
create policy project_inquiries_admin_update on public.project_inquiries
for update to authenticated
using (public.is_admin())
with check (
  public.is_admin()
  and status in ('baru', 'ditinjau', 'dihubungi', 'selesai', 'arsip')
);

-- Proposal drafts are admin-only and intentionally unavailable to anon users.
drop policy if exists project_inquiry_proposal_drafts_admin_select on public.project_inquiry_proposal_drafts;
create policy project_inquiry_proposal_drafts_admin_select on public.project_inquiry_proposal_drafts
for select to authenticated
using (public.is_admin());

drop policy if exists project_inquiry_proposal_drafts_admin_insert on public.project_inquiry_proposal_drafts;
create policy project_inquiry_proposal_drafts_admin_insert on public.project_inquiry_proposal_drafts
for insert to authenticated
with check (public.is_admin());

drop policy if exists project_inquiry_proposal_drafts_admin_update on public.project_inquiry_proposal_drafts;
create policy project_inquiry_proposal_drafts_admin_update on public.project_inquiry_proposal_drafts
for update to authenticated
using (public.is_admin())
with check (
  public.is_admin()
  and status in ('draft', 'used', 'archived')
);

-- Storage buckets
-- Supabase Storage bucket for cover and gallery images.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

-- Storage policies
-- Storage objects stay publicly readable for image delivery from the public
-- project-images bucket, while object mutations require the admin identity.
drop policy if exists "Public read project images" on storage.objects;
drop policy if exists "Public read project image objects" on storage.objects;
create policy "Public read project image objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'project-images');

drop policy if exists "Authenticated upload project images" on storage.objects;
drop policy if exists "Admin upload project image objects" on storage.objects;
create policy "Admin upload project image objects"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'project-images' and public.is_admin());

drop policy if exists "Authenticated update project images" on storage.objects;
drop policy if exists "Admin update project image objects" on storage.objects;
create policy "Admin update project image objects"
on storage.objects
for update
to authenticated
using (bucket_id = 'project-images' and public.is_admin())
with check (bucket_id = 'project-images' and public.is_admin());

drop policy if exists "Authenticated delete project images" on storage.objects;
drop policy if exists "Admin delete project image objects" on storage.objects;
create policy "Admin delete project image objects"
on storage.objects
for delete
to authenticated
using (bucket_id = 'project-images' and public.is_admin());

-- Optional starter data
-- Run only if you want demo projects.
-- insert into public.projects (title, slug, category, design_category, design_style, area_type, problem, solution, impact)
-- values
-- ('Project 01 — Residential Interior', 'residential-interior', 'Residential Interior', 'Interior', 'Modern', 'Full House', 'Sirkulasi harian tidak efisien dan area publik belum bekerja sebagai penghubung aktivitas.', 'Flow ruang disusun ulang dengan prioritas pada zoning, titik aktivitas, dan kemudahan bergerak.', 'Ruang menjadi lebih efisien, aktivitas harian lebih lancar, keputusan klien lebih cepat, dan revisi layout dapat dikurangi sejak fase awal.'),
-- ('Project 02 — Workspace Interior', 'workspace-interior', 'Workspace Interior', 'Interior', 'Contemporary', 'Office', 'Area kerja belum membagi fokus, kolaborasi, dan privasi secara jelas.', 'Ruang dibagi berdasarkan intensitas aktivitas, kebutuhan privasi, dan alur kerja pengguna ruang.', 'Ritme kerja lebih terarah, pengalaman ruang meningkat, dan keputusan desain lebih mudah dipahami.')
-- on conflict (slug) do nothing;
