-- Allow AI Interior Animation as a selectable service in project inquiries.
alter table public.project_inquiries
  drop constraint if exists project_inquiries_paket_id_check;

alter table public.project_inquiries
  add constraint project_inquiries_paket_id_check
  check (
    paket_id is null
    or paket_id in ('opsi-1', 'opsi-2', 'opsi-3', 'opsi-4', 'ai-animation')
  );
