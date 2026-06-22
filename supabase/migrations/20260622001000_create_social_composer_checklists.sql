create table if not exists public.social_composer_checklists (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  content_type text not null,
  content_slug text not null,
  content_title text,
  instagram_posted boolean default false,
  threads_posted boolean default false,
  tiktok_posted boolean default false,
  facebook_posted boolean default false,
  youtube_shorts_posted boolean default false,
  linkedin_posted boolean default false,
  whatsapp_shared boolean default false,
  instagram_url text,
  threads_url text,
  tiktok_url text,
  facebook_url text,
  youtube_shorts_url text,
  linkedin_url text,
  whatsapp_url text,
  posting_date date,
  notes text,
  constraint social_composer_checklists_content_unique unique (content_type, content_slug)
);

alter table public.social_composer_checklists enable row level security;

-- Checklist rows are admin-only and accessed through the server-side admin API route.
