-- Ensure the admin check used by RLS policies exists before creating policies.
-- Keep this aligned with the existing Supabase schema's admin identity.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com';
$$;

grant usage on schema public to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.project_inquiry_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_inquiry_push_subscriptions_created_at_desc
  on public.project_inquiry_push_subscriptions(created_at desc);

drop trigger if exists update_project_inquiry_push_subscriptions_updated_at
  on public.project_inquiry_push_subscriptions;
create trigger update_project_inquiry_push_subscriptions_updated_at
before update on public.project_inquiry_push_subscriptions
for each row execute function public.update_updated_at_column();

revoke all on public.project_inquiry_push_subscriptions from anon, authenticated;
grant select, insert, update, delete on public.project_inquiry_push_subscriptions to authenticated;
grant all on public.project_inquiry_push_subscriptions to service_role;

alter table public.project_inquiry_push_subscriptions enable row level security;

drop policy if exists project_inquiry_push_subscriptions_admin_select on public.project_inquiry_push_subscriptions;
create policy project_inquiry_push_subscriptions_admin_select on public.project_inquiry_push_subscriptions
for select to authenticated
using (public.is_admin());

drop policy if exists project_inquiry_push_subscriptions_admin_insert on public.project_inquiry_push_subscriptions;
create policy project_inquiry_push_subscriptions_admin_insert on public.project_inquiry_push_subscriptions
for insert to authenticated
with check (public.is_admin());

drop policy if exists project_inquiry_push_subscriptions_admin_update on public.project_inquiry_push_subscriptions;
create policy project_inquiry_push_subscriptions_admin_update on public.project_inquiry_push_subscriptions
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists project_inquiry_push_subscriptions_admin_delete on public.project_inquiry_push_subscriptions;
create policy project_inquiry_push_subscriptions_admin_delete on public.project_inquiry_push_subscriptions
for delete to authenticated
using (public.is_admin());
