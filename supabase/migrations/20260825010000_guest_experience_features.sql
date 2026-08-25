-- Housekeeping opt-out: guests choose daily cleaning vs. Do Not Disturb for
-- their current stay. Read by housekeeping so they can skip DND rooms.
alter table public.reservations add column if not exists housekeeping_preference text not null default 'DAILY_CLEANING'
  check (housekeeping_preference in ('DAILY_CLEANING', 'DO_NOT_DISTURB'));

create or replace function public.set_housekeeping_preference(p_reservation_id text, p_preference text)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.reservations;
begin
  if p_preference not in ('DAILY_CLEANING', 'DO_NOT_DISTURB') then
    raise exception 'Invalid housekeeping preference';
  end if;

  update public.reservations r
  set housekeeping_preference = p_preference
  where r.id = p_reservation_id
    and r.guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  returning * into updated;

  if updated is null then
    raise exception 'Reservation not found';
  end if;

  return updated;
end;
$$;

revoke all on function public.set_housekeeping_preference(text, text) from public;
grant execute on function public.set_housekeeping_preference(text, text) to authenticated;

-- Push notification tokens — one row per device. Guests/staff register their
-- own Expo push token on sign-in; a broadcast (e.g. an emergency alert) reads
-- across all of them to fan out real OS-level push notifications.
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  platform text,
  created_at timestamptz not null default now()
);
create index if not exists push_tokens_user_id_idx on public.push_tokens(user_id);

alter table public.push_tokens enable row level security;

create policy push_tokens_self_manage on public.push_tokens
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy push_tokens_staff_read on public.push_tokens
for select using (public.is_staff());

-- Emergency broadcast: fans out an in-app notification (visible instantly to
-- anyone with the app open, via the existing realtime notifications
-- subscription) to every guest with an active or upcoming reservation, and
-- to all staff/management. Restricted to staff. Does not itself send OS push
-- notifications — that's handled by a Supabase Edge Function reading
-- push_tokens, since Postgres can't make outbound HTTP calls to Expo's push
-- service on its own.
create or replace function public.broadcast_emergency_alert(p_title text, p_body text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
  guest_row record;
begin
  if not public.is_staff() then
    raise exception using errcode = '42501', message = 'Only staff can send emergency broadcasts';
  end if;

  for guest_row in
    select distinct g.auth_user_id
    from public.guests g
    join public.reservations r on r.guest_id = g.id
    where g.auth_user_id is not null
      and r.status in ('confirmed', 'checked_in')
  loop
    insert into public.notifications (id, recipient_user_id, category, title, body)
    values (
      'em_' || substr(md5(random()::text || guest_row.auth_user_id::text), 1, 20),
      guest_row.auth_user_id,
      'Emergency',
      p_title,
      p_body
    );
    inserted_count := inserted_count + 1;
  end loop;

  insert into public.notifications (id, recipient_role, category, title, body)
  select 'em_staff_' || substr(md5(random()::text || role::text), 1, 16), role, 'Emergency', p_title, p_body
  from unnest(enum_range(null::public.app_role)) as role;

  return inserted_count;
end;
$$;

revoke all on function public.broadcast_emergency_alert(text, text) from public;
grant execute on function public.broadcast_emergency_alert(text, text) to authenticated;

-- Property Management System sync log — a scaffold for a future real PMS
-- integration (e.g. Cloudbeds, Mews, Opera). No live PMS is connected today;
-- this table and the pms_sync_status view exist so a real integration has a
-- ready audit trail (what was pushed/pulled, when, and whether it succeeded)
-- to write into from day one, without a schema change at integration time.
create table if not exists public.pms_sync_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('reservation', 'guest_profile', 'room_status')),
  entity_id text not null,
  direction text not null check (direction in ('PULL_FROM_PMS', 'PUSH_TO_PMS')),
  external_reference text,
  status text not null default 'PENDING' check (status in ('PENDING', 'SUCCESS', 'FAILED')),
  detail text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.pms_sync_log enable row level security;
create policy pms_sync_log_staff_read on public.pms_sync_log for select using (public.is_staff());
