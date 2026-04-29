-- Eryawan Studio portfolio CMS schema
-- Run this file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create type public.project_status as enum ('draft', 'published');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  location text,
  year text,
  client_name text,
  area_size text,
  design_style text,
  short_description text,
  context text,
  problem text,
  strategic_decision text,
  execution text,
  impact text,
  status public.project_status not null default 'draft',
  featured boolean not null default false,
  cover_image_url text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  invited_by uuid references auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and email = 'eryawanagungtrimuda@gmail.com'
      and role = 'admin'
  );
$$ language sql stable security definer set search_path = public;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.admin_invites enable row level security;

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles" on public.profiles
for select using (public.is_admin());

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles" on public.profiles
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects" on public.projects
for select using (status = 'published');

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects" on public.projects
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public can read images from published projects" on public.project_images;
create policy "Public can read images from published projects" on public.project_images
for select using (
  exists (
    select 1 from public.projects
    where projects.id = project_images.project_id
      and projects.status = 'published'
  )
);

drop policy if exists "Admins can manage project images" on public.project_images;
create policy "Admins can manage project images" on public.project_images
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can manage invites" on public.admin_invites;
create policy "Admins can manage invites" on public.admin_invites
for all using (public.is_admin()) with check (public.is_admin());

-- Storage bucket for project images.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read project images" on storage.objects;
create policy "Public can read project images" on storage.objects
for select using (bucket_id = 'project-images');

drop policy if exists "Admins can upload project images" on storage.objects;
create policy "Admins can upload project images" on storage.objects
for insert with check (bucket_id = 'project-images' and public.is_admin());

drop policy if exists "Admins can update project images" on storage.objects;
create policy "Admins can update project images" on storage.objects
for update using (bucket_id = 'project-images' and public.is_admin()) with check (bucket_id = 'project-images' and public.is_admin());

drop policy if exists "Admins can delete project images" on storage.objects;
create policy "Admins can delete project images" on storage.objects
for delete using (bucket_id = 'project-images' and public.is_admin());

-- After creating the auth user, run this once to grant admin access:
-- insert into public.profiles (id, email, full_name, role)
-- select id, email, 'Eryawan Agung Trimuda', 'admin'
-- from auth.users
-- where email = 'eryawanagungtrimuda@gmail.com'
-- on conflict (id) do update set email = excluded.email, role = 'admin';
