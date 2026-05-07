create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  source_type text not null default 'manual' check (source_type in ('project', 'image_review', 'manual')),
  source_project_id uuid references public.projects(id) on delete set null,
  cover_image text,
  excerpt text,
  content text,
  ai_prompt_source text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insight_images (
  id uuid primary key default gen_random_uuid(),
  insight_id uuid not null references public.insights(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_insights_updated_at on public.insights;
create trigger update_insights_updated_at
before update on public.insights
for each row execute function public.update_updated_at_column();

alter table public.insights enable row level security;
alter table public.insight_images enable row level security;

-- TODO(security-phase): harden RLS policy for production with proper role/auth checks.
create policy insights_public_read on public.insights for select using (is_published = true);
create policy insights_admin_all on public.insights for all using (true) with check (true);
create policy insight_images_public_read on public.insight_images for select using (
  exists(select 1 from public.insights i where i.id = insight_images.insight_id and i.is_published = true)
);
create policy insight_images_admin_all on public.insight_images for all using (true) with check (true);
