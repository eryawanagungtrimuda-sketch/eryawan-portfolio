-- Server-only, privacy-preserving rate limits for public API endpoints.
-- The table stores keyed hashes, not raw IP addresses, and is inaccessible to
-- anon/authenticated clients. Only the service-role server client can call the RPC.

create table if not exists public.public_endpoint_rate_limits (
  key_hash text primary key check (length(key_hash) = 64),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists public_endpoint_rate_limits_updated_at_idx
  on public.public_endpoint_rate_limits (updated_at);

alter table public.public_endpoint_rate_limits enable row level security;

revoke all on table public.public_endpoint_rate_limits from public, anon, authenticated;
grant all on table public.public_endpoint_rate_limits to service_role;

create or replace function public.consume_public_endpoint_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_request_count integer;
  v_now timestamptz := now();
begin
  if p_key_hash is null
    or length(p_key_hash) <> 64
    or p_limit is null
    or p_limit < 1
    or p_window_seconds is null
    or p_window_seconds < 1
  then
    raise exception 'Invalid rate limit parameters' using errcode = '22023';
  end if;

  insert into public.public_endpoint_rate_limits (
    key_hash,
    window_started_at,
    request_count,
    updated_at
  )
  values (p_key_hash, v_now, 1, v_now)
  on conflict (key_hash) do update
  set
    request_count = case
      when public.public_endpoint_rate_limits.window_started_at
        <= v_now - make_interval(secs => p_window_seconds)
      then 1
      else public.public_endpoint_rate_limits.request_count + 1
    end,
    window_started_at = case
      when public.public_endpoint_rate_limits.window_started_at
        <= v_now - make_interval(secs => p_window_seconds)
      then v_now
      else public.public_endpoint_rate_limits.window_started_at
    end,
    updated_at = v_now
  returning request_count into v_request_count;

  -- Opportunistic cleanup keeps this small table from accumulating stale hashes.
  if random() < 0.02 then
    delete from public.public_endpoint_rate_limits
    where updated_at < v_now - interval '7 days';
  end if;

  return v_request_count <= p_limit;
end;
$function$;

revoke all on function public.consume_public_endpoint_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_public_endpoint_rate_limit(text, integer, integer)
  to service_role;
