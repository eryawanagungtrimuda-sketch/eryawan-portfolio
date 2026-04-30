-- Eryawan Studio portfolio CMS schema
-- Run this file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  design_category text,
  design_style text,
  area_type text,
  cover_image text,
  problem text,
  solution text,
  impact text,
  created_at timestamp with time zone not null default now()
);

alter table public.projects add column if not exists design_category text;
alter table public.projects add column if not exists design_style text;
alter table public.projects add column if not exists area_type text;

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

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

-- Required grants for Supabase API roles.
grant usage on schema public to anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant select on public.project_images to anon, authenticated;
grant insert, update, delete on public.project_images to authenticated;

alter table public.projects enable row level security;
alter table public.project_images enable row level security;

drop policy if exists "Public read projects" on public.projects;
create policy "Public read projects"
on public.projects
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated insert projects" on public.projects;
create policy "Authenticated insert projects"
on public.projects
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated update projects" on public.projects;
create policy "Authenticated update projects"
on public.projects
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated delete projects" on public.projects;
create policy "Authenticated delete projects"
on public.projects
for delete
to authenticated
using (true);

drop policy if exists "Public read project images table" on public.project_images;
drop policy if exists "Public read project images" on public.project_images;
create policy "Public read project images"
on public.project_images
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated insert project images table" on public.project_images;
drop policy if exists "Authenticated insert project images" on public.project_images;
create policy "Authenticated insert project images"
on public.project_images
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated update project images table" on public.project_images;
drop policy if exists "Authenticated update project images" on public.project_images;
create policy "Authenticated update project images"
on public.project_images
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated delete project images table" on public.project_images;
drop policy if exists "Authenticated delete project images" on public.project_images;
create policy "Authenticated delete project images"
on public.project_images
for delete
to authenticated
using (true);

-- Supabase Storage bucket for cover and gallery images.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read project images" on storage.objects;
create policy "Public read project images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'project-images');

drop policy if exists "Authenticated upload project images" on storage.objects;
create policy "Authenticated upload project images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'project-images');

drop policy if exists "Authenticated update project images" on storage.objects;
create policy "Authenticated update project images"
on storage.objects
for update
to authenticated
using (bucket_id = 'project-images')
with check (bucket_id = 'project-images');

drop policy if exists "Authenticated delete project images" on storage.objects;
create policy "Authenticated delete project images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'project-images');

-- Optional starter data. Run only if you want demo projects.
-- insert into public.projects (title, slug, category, design_category, design_style, area_type, problem, solution, impact)
-- values
-- ('Project 01 — Residential Interior', 'residential-interior', 'Residential Interior', 'Interior', 'Modern', 'Full House', 'Sirkulasi harian tidak efisien dan area publik belum bekerja sebagai penghubung aktivitas.', 'Flow ruang disusun ulang dengan prioritas pada zoning, titik aktivitas, dan kemudahan bergerak.', 'Ruang menjadi lebih efisien, aktivitas harian lebih lancar, keputusan klien lebih cepat, dan revisi layout dapat dikurangi sejak fase awal.'),
-- ('Project 02 — Workspace Interior', 'workspace-interior', 'Workspace Interior', 'Interior', 'Contemporary', 'Office', 'Area kerja belum membagi fokus, kolaborasi, dan privasi secara jelas.', 'Ruang dibagi berdasarkan intensitas aktivitas, kebutuhan privasi, dan alur kerja pengguna ruang.', 'Ritme kerja lebih terarah, pengalaman ruang meningkat, dan keputusan desain lebih mudah dipahami.')
-- on conflict (slug) do nothing;
