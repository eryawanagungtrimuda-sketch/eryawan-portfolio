alter table public.project_inquiries
  add column if not exists paket_id text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'project_inquiries_paket_id_check'
      and conrelid = 'public.project_inquiries'::regclass
  ) then
    alter table public.project_inquiries
      add constraint project_inquiries_paket_id_check
      check (paket_id is null or paket_id in ('opsi-1', 'opsi-2', 'opsi-3', 'opsi-4'));
  end if;
end $$;

-- Preserve package selections embedded in older free-text briefs when recognizable.
update public.project_inquiries
set paket_id = case
  when kebutuhan_utama ilike '%Paket jasa yang ingin didiskusikan: Opsi 1%' then 'opsi-1'
  when kebutuhan_utama ilike '%Paket jasa yang ingin didiskusikan: Opsi 2%' then 'opsi-2'
  when kebutuhan_utama ilike '%Paket jasa yang ingin didiskusikan: Opsi 3%' then 'opsi-3'
  when kebutuhan_utama ilike '%Paket jasa yang ingin didiskusikan: Opsi 4%' then 'opsi-4'
  else paket_id
end
where paket_id is null
  and kebutuhan_utama ilike '%Paket jasa yang ingin didiskusikan: Opsi %';

create index if not exists project_inquiries_utm_source_idx
  on public.project_inquiries (utm_source);
create index if not exists project_inquiries_utm_campaign_idx
  on public.project_inquiries (utm_campaign);
