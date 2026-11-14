-- Create the dedicated public QRIS bucket only when it does not exist.
-- Never change the visibility of an existing bucket implicitly.
insert into storage.buckets (id, name, public)
values ('invoice-assets', 'invoice-assets', true)
on conflict (id) do nothing;

do $
begin
  if not exists (
    select 1
    from storage.buckets as bucket
    where bucket.id = 'invoice-assets'
      and bucket.public is true
  ) then
    raise exception 'Bucket invoice-assets already exists but is not public. The migration will not change an existing bucket''s visibility. Review it manually before retrying.';
  end if;
end;
$;

-- Keep invoice timestamps isolated from the shared helper used by other tables.
create or replace function public.set_project_invoice_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $
begin
  new.updated_at = now();
  return new;
end;
$;

create table if not exists public.project_invoice_settings (
  id smallint primary key default 1 check (id = 1),
  billing_name text,
  billing_contact text,
  billing_address text,
  qris_image_path text,
  tax_note text not null default 'Pajak tidak ditambahkan pada invoice ini.',
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.project_invoice_settings (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.project_inquiry_billing_profiles (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null unique references public.project_inquiries(id) on delete cascade,
  agreed_total_fee bigint not null check (agreed_total_fee > 0),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_invoice_number_sequences (
  invoice_year integer primary key,
  last_number integer not null default 0 check (last_number >= 0)
);

create table if not exists public.project_invoices (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.project_inquiries(id) on delete restrict,
  invoice_number text not null unique,
  installment_stage text not null check (installment_stage in ('dp', 'progress', 'final')),
  installment_percentage integer not null check (
    (installment_stage = 'dp' and installment_percentage = 50) or
    (installment_stage = 'progress' and installment_percentage = 30) or
    (installment_stage = 'final' and installment_percentage = 20)
  ),
  total_project_fee bigint not null check (total_project_fee > 0),
  amount_due bigint not null check (amount_due > 0),
  payment_method text not null default 'qris_shopee' check (payment_method = 'qris_shopee'),
  issue_date date not null default current_date,
  due_date date not null,
  invoice_status text not null default 'draft' check (invoice_status in ('draft', 'waiting_approval', 'approved', 'sent', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  sent_channel text check (sent_channel in ('whatsapp', 'email', 'manual')),
  client_name_snapshot text not null,
  client_email_snapshot text,
  client_whatsapp_snapshot text,
  project_label_snapshot text not null,
  billing_name_snapshot text,
  billing_contact_snapshot text,
  billing_address_snapshot text,
  qris_image_path_snapshot text,
  tax_note_snapshot text not null default 'Pajak tidak ditambahkan pada invoice ini.',
  approved_by text,
  approved_at timestamptz,
  sent_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date >= issue_date)
);

create unique index if not exists idx_project_invoices_one_active_stage
on public.project_invoices (inquiry_id, installment_stage)
where invoice_status <> 'cancelled';

create index if not exists idx_project_invoices_inquiry_created
on public.project_invoices (inquiry_id, created_at desc);

create table if not exists public.project_invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.project_invoices(id) on delete restrict,
  amount bigint not null check (amount > 0),
  paid_at date not null default current_date,
  payment_method text not null default 'qris_shopee' check (payment_method = 'qris_shopee'),
  reference text,
  notes text,
  verified_by text not null,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_project_invoice_payments_invoice
on public.project_invoice_payments (invoice_id, paid_at desc);

create table if not exists public.project_invoice_reminder_drafts (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.project_invoices(id) on delete restrict,
  channel text not null check (channel in ('whatsapp', 'email')),
  reminder_type text not null check (reminder_type in ('h_minus_1', 'due_today', 'overdue')),
  status text not null default 'draft' check (status in ('draft', 'waiting_approval', 'approved', 'sent', 'archived')),
  subject text,
  message_body text not null,
  created_by text,
  approved_by text,
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_invoice_reminders_invoice
on public.project_invoice_reminder_drafts (invoice_id, created_at desc);

create table if not exists public.project_invoice_audit_log (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.project_invoices(id) on delete restrict,
  event_key text not null,
  actor_email text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_invoice_audit_log_invoice
on public.project_invoice_audit_log (invoice_id, created_at desc);

create or replace function public.assign_project_invoice_number()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $
declare
  target_year integer;
  next_number integer;
begin
  if new.invoice_number is null or btrim(new.invoice_number) = '' then
    target_year := extract(year from new.issue_date)::integer;
    insert into public.project_invoice_number_sequences (invoice_year, last_number)
    values (target_year, 1)
    on conflict (invoice_year)
    do update set last_number = public.project_invoice_number_sequences.last_number + 1
    returning last_number into next_number;
    new.invoice_number := 'EA-INV-' || target_year::text || '-' || lpad(next_number::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists assign_project_invoice_number_before_insert on public.project_invoices;
create trigger assign_project_invoice_number_before_insert
before insert on public.project_invoices
for each row execute function public.assign_project_invoice_number();

drop trigger if exists update_project_invoice_settings_updated_at on public.project_invoice_settings;
create trigger update_project_invoice_settings_updated_at
before update on public.project_invoice_settings
for each row execute function public.set_project_invoice_updated_at();

drop trigger if exists update_project_inquiry_billing_profiles_updated_at on public.project_inquiry_billing_profiles;
create trigger update_project_inquiry_billing_profiles_updated_at
before update on public.project_inquiry_billing_profiles
for each row execute function public.set_project_invoice_updated_at();

drop trigger if exists update_project_invoices_updated_at on public.project_invoices;
create trigger update_project_invoices_updated_at
before update on public.project_invoices
for each row execute function public.set_project_invoice_updated_at();

drop trigger if exists update_project_invoice_reminders_updated_at on public.project_invoice_reminder_drafts;
create trigger update_project_invoice_reminders_updated_at
before update on public.project_invoice_reminder_drafts
for each row execute function public.set_project_invoice_updated_at();

-- These functions are trigger-only; do not expose direct execution to API roles.
revoke all on function public.assign_project_invoice_number() from public, anon, authenticated;
revoke all on function public.set_project_invoice_updated_at() from public, anon, authenticated;

alter table public.project_invoice_settings enable row level security;
alter table public.project_inquiry_billing_profiles enable row level security;
alter table public.project_invoice_number_sequences enable row level security;
alter table public.project_invoices enable row level security;
alter table public.project_invoice_payments enable row level security;
alter table public.project_invoice_reminder_drafts enable row level security;
alter table public.project_invoice_audit_log enable row level security;

revoke all on public.project_invoice_settings from anon, authenticated;
revoke all on public.project_inquiry_billing_profiles from anon, authenticated;
revoke all on public.project_invoice_number_sequences from anon, authenticated;
revoke all on public.project_invoices from anon, authenticated;
revoke all on public.project_invoice_payments from anon, authenticated;
revoke all on public.project_invoice_reminder_drafts from anon, authenticated;
revoke all on public.project_invoice_audit_log from anon, authenticated;

grant select, insert, update on public.project_invoice_settings to authenticated;
grant select, insert, update on public.project_inquiry_billing_profiles to authenticated;
grant select, insert, update on public.project_invoices to authenticated;
grant select, insert, update on public.project_invoice_payments to authenticated;
grant select, insert, update on public.project_invoice_reminder_drafts to authenticated;
grant select, insert on public.project_invoice_audit_log to authenticated;

drop policy if exists project_invoice_settings_admin_all on public.project_invoice_settings;
create policy project_invoice_settings_admin_all on public.project_invoice_settings
for all to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_inquiry_billing_profiles_admin_all on public.project_inquiry_billing_profiles;
create policy project_inquiry_billing_profiles_admin_all on public.project_inquiry_billing_profiles
for all to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_invoices_admin_all on public.project_invoices;
create policy project_invoices_admin_all on public.project_invoices
for all to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_invoice_payments_admin_all on public.project_invoice_payments;
create policy project_invoice_payments_admin_all on public.project_invoice_payments
for all to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_invoice_reminders_admin_all on public.project_invoice_reminder_drafts;
create policy project_invoice_reminders_admin_all on public.project_invoice_reminder_drafts
for all to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_invoice_audit_log_admin_select on public.project_invoice_audit_log;
create policy project_invoice_audit_log_admin_select on public.project_invoice_audit_log
for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_invoice_audit_log_admin_insert on public.project_invoice_audit_log;
create policy project_invoice_audit_log_admin_insert on public.project_invoice_audit_log
for insert to authenticated
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists invoice_assets_admin_insert on storage.objects;
create policy invoice_assets_admin_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'invoice-assets'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com'
);

drop policy if exists invoice_assets_admin_update on storage.objects;
create policy invoice_assets_admin_update on storage.objects
for update to authenticated
using (
  bucket_id = 'invoice-assets'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com'
)
with check (
  bucket_id = 'invoice-assets'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com'
);

drop policy if exists invoice_assets_admin_delete on storage.objects;
create policy invoice_assets_admin_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'invoice-assets'
  and lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com'
);
