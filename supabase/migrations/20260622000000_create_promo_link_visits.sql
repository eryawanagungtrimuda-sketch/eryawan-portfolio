create table if not exists public.promo_link_visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null,
  utm_source text not null,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  referrer text,
  session_id text
);

create index if not exists promo_link_visits_created_at_idx on public.promo_link_visits (created_at desc);
create index if not exists promo_link_visits_utm_source_idx on public.promo_link_visits (utm_source);
create index if not exists promo_link_visits_utm_campaign_idx on public.promo_link_visits (utm_campaign);
create index if not exists promo_link_visits_utm_content_idx on public.promo_link_visits (utm_content);
create index if not exists promo_link_visits_path_idx on public.promo_link_visits (path);

alter table public.promo_link_visits enable row level security;

-- Raw promo visit rows are inserted and read only from server-side API routes
-- using the Supabase service role key. No public SELECT/INSERT policy is added.
