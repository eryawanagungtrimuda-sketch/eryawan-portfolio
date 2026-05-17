alter table public.projects
  add column if not exists project_status text,
  add column if not exists completion_year integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_project_status_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_project_status_check
      check (project_status is null or project_status in ('konsep', 'berjalan', 'selesai'));
  end if;
end $$;
