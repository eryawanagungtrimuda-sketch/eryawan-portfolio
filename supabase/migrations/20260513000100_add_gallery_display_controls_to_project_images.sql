alter table public.project_images
add column if not exists display_ratio text default 'landscape',
add column if not exists object_position text default 'center';
