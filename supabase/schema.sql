-- Eryawan Studio portfolio CMS schema
-- Run this file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  cover_image text,
  problem text,
  solution text,
  impact text,
  created_at timestamp with time zone not null default now()
);

alter table public.projects enable row level security;

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

-- Optional starter data. Run only if you want demo projects.
-- insert into public.projects (title, slug, category, problem, solution, impact)
-- values
-- ('Project 01 — Residential Interior', 'residential-interior', 'Residential Interior', 'Sirkulasi harian tidak efisien dan area publik belum bekerja sebagai penghubung aktivitas.', 'Flow ruang disusun ulang dengan prioritas pada zoning, titik aktivitas, dan kemudahan bergerak.', 'Ruang menjadi lebih efisien, aktivitas harian lebih lancar, keputusan klien lebih cepat, dan revisi layout dapat dikurangi sejak fase awal.'),
-- ('Project 02 — Workspace Interior', 'workspace-interior', 'Workspace Interior', 'Area kerja belum membagi fokus, kolaborasi, dan privasi secara jelas.', 'Ruang dibagi berdasarkan intensitas aktivitas, kebutuhan privasi, dan alur kerja pengguna ruang.', 'Ritme kerja lebih terarah, pengalaman ruang meningkat, dan keputusan desain lebih mudah dipahami.')
-- on conflict (slug) do nothing;
