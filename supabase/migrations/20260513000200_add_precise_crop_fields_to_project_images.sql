alter table public.project_images
add column if not exists crop_x numeric default 50,
add column if not exists crop_y numeric default 50,
add column if not exists crop_zoom numeric default 1;
