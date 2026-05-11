create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.project_inquiry_proposal_drafts (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.project_inquiries(id) on delete cascade,
  title text not null,
  draft_content text not null,
  follow_up_message text,
  status text not null default 'draft' check (status in ('draft', 'used', 'archived')),
  version integer not null default 1,
  model text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_project_inquiry_proposal_drafts_inquiry_id on public.project_inquiry_proposal_drafts(inquiry_id);
create index if not exists idx_project_inquiry_proposal_drafts_status on public.project_inquiry_proposal_drafts(status);
create index if not exists idx_project_inquiry_proposal_drafts_created_at_desc on public.project_inquiry_proposal_drafts(created_at desc);

drop trigger if exists update_project_inquiry_proposal_drafts_updated_at on public.project_inquiry_proposal_drafts;
create trigger update_project_inquiry_proposal_drafts_updated_at
before update on public.project_inquiry_proposal_drafts
for each row execute function public.update_updated_at_column();

revoke all on public.project_inquiry_proposal_drafts from anon, authenticated;
grant select, insert, update on public.project_inquiry_proposal_drafts to authenticated;

alter table public.project_inquiry_proposal_drafts enable row level security;

drop policy if exists project_inquiry_proposal_drafts_admin_select on public.project_inquiry_proposal_drafts;
create policy project_inquiry_proposal_drafts_admin_select on public.project_inquiry_proposal_drafts
for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_inquiry_proposal_drafts_admin_insert on public.project_inquiry_proposal_drafts;
create policy project_inquiry_proposal_drafts_admin_insert on public.project_inquiry_proposal_drafts
for insert to authenticated
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_inquiry_proposal_drafts_admin_update on public.project_inquiry_proposal_drafts;
create policy project_inquiry_proposal_drafts_admin_update on public.project_inquiry_proposal_drafts
for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com')
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com'
  and status in ('draft', 'used', 'archived')
);
