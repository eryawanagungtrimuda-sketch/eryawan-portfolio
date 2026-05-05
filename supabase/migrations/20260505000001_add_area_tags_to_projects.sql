alter table public.projects add column if not exists area_tags text[] not null default '{}';
