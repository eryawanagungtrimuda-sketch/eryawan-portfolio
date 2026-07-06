create table if not exists public.cv_access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company text,
  role text,
  purpose text not null,
  linkedin_url text,
  whatsapp text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  download_token_created_at timestamptz,
  download_expires_at timestamptz,
  download_count integer not null default 0
);

create index if not exists cv_access_requests_created_at_idx on public.cv_access_requests (created_at desc);
create index if not exists cv_access_requests_status_idx on public.cv_access_requests (status);

drop trigger if exists update_cv_access_requests_updated_at on public.cv_access_requests;
create trigger update_cv_access_requests_updated_at
before update on public.cv_access_requests
for each row execute function public.update_updated_at_column();

revoke all on public.cv_access_requests from anon, authenticated;
grant insert on public.cv_access_requests to anon;
grant select, update on public.cv_access_requests to authenticated;

alter table public.cv_access_requests enable row level security;

drop policy if exists cv_access_requests_anon_insert on public.cv_access_requests;
create policy cv_access_requests_anon_insert on public.cv_access_requests
for insert to anon
with check (status = 'pending');

drop policy if exists cv_access_requests_admin_select on public.cv_access_requests;
create policy cv_access_requests_admin_select on public.cv_access_requests
for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists cv_access_requests_admin_update on public.cv_access_requests;
create policy cv_access_requests_admin_update on public.cv_access_requests
for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com')
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com'
  and status in ('pending', 'approved', 'rejected')
);
