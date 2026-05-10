create table if not exists public.project_inquiries (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  perusahaan text,
  email text,
  whatsapp text,
  jenis_kebutuhan text not null,
  lokasi_project text,
  estimasi_luas text,
  tahap_project text,
  timeline text,
  budget_range text,
  kebutuhan_utama text not null,
  status_file text,
  message_preview text not null,
  status text not null default 'baru' check (status in ('baru', 'ditinjau', 'dihubungi', 'selesai', 'arsip')),
  source text not null default 'mulai_project',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists update_project_inquiries_updated_at on public.project_inquiries;
create trigger update_project_inquiries_updated_at
before update on public.project_inquiries
for each row execute function public.update_updated_at_column();

revoke all on public.project_inquiries from anon, authenticated;

grant insert on public.project_inquiries to anon;
grant select, update on public.project_inquiries to authenticated;

alter table public.project_inquiries enable row level security;

drop policy if exists project_inquiries_anon_insert on public.project_inquiries;
create policy project_inquiries_anon_insert on public.project_inquiries
for insert to anon
with check (true);

drop policy if exists project_inquiries_authenticated_select on public.project_inquiries;
create policy project_inquiries_admin_select on public.project_inquiries
for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_inquiries_authenticated_update on public.project_inquiries;
create policy project_inquiries_admin_update on public.project_inquiries
for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com')
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com'
  and status in ('baru', 'ditinjau', 'dihubungi', 'selesai', 'arsip')
);
