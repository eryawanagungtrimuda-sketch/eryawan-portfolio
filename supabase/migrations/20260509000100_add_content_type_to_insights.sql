alter table public.insights
add column if not exists content_type text not null default 'artikel'
check (content_type in ('artikel', 'review_karya'));
