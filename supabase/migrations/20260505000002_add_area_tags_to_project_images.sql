alter table public.project_images add column if not exists area_tags text[] not null default '{}';
