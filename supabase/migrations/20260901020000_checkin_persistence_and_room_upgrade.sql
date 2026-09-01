-- 1. "Your Journey" showed check-in answers that never survived a reload
-- because complete_guest_checkin() only ever flipped reservation status —
-- the transport/preferences the guest picked were merged into React state
-- only and got wiped by the next server refresh. Add real columns and have
-- the RPC persist them.
alter table public.reservations
  add column if not exists arrival_transport text,
  add column if not exists preferences text[] not null default '{}';

create or replace function public.complete_guest_checkin(
  p_reservation_id text,
  p_arrival_time text default null,
  p_arrival_transport text default null,
  p_special_requests text default null,
  p_preferences text[] default null
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.reservations;
begin
  update public.reservations r
  set status = 'checked_in',
      arrival_time = coalesce(p_arrival_time, r.arrival_time),
      arrival_transport = coalesce(p_arrival_transport, r.arrival_transport),
      special_requests = coalesce(p_special_requests, r.special_requests),
      preferences = coalesce(p_preferences, r.preferences)
  where r.id = p_reservation_id
    and r.status = 'confirmed'
    and r.guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  returning * into updated;

  if updated is null then
    raise exception 'Reservation not found or not eligible for check-in';
  end if;

  return updated;
end;
$$;

revoke all on function public.complete_guest_checkin(text, text, text, text, text[]) from public;
grant execute on function public.complete_guest_checkin(text, text, text, text, text[]) to authenticated;

-- 2. Completing a "Room Upgrade" service request never actually moved the
-- guest to a new room — it only flipped the request's own status. This RPC
-- does the real reassignment atomically: moves the guest's active
-- reservation onto the new room, frees the old room for housekeeping, and
-- marks the request Completed, all in one staff-authorized transaction.
create or replace function public.complete_room_upgrade(p_request_id text, p_new_room_id text)
returns public.service_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.service_requests;
  res public.reservations;
  old_room_id text;
begin
  if not public.is_staff() then
    raise exception 'Not authorized';
  end if;

  select * into req from public.service_requests where id = p_request_id;
  if req is null then
    raise exception 'Request not found';
  end if;

  select * into res from public.reservations
    where guest_id = req.guest_id and status in ('confirmed', 'checked_in')
    order by created_at desc
    limit 1;
  if res is null then
    raise exception 'No active reservation found for this guest';
  end if;

  if res.room_id is distinct from p_new_room_id then
    old_room_id := res.room_id;
    update public.reservations set room_id = p_new_room_id where id = res.id;
    if old_room_id is not null then
      update public.rooms set status = 'VACANT_DIRTY' where id = old_room_id;
    end if;
    update public.rooms set status = 'OCCUPIED_CLEAN' where id = p_new_room_id;
  end if;

  update public.service_requests
  set status = 'Completed', completed_at = now()
  where id = p_request_id
  returning * into req;

  return req;
end;
$$;

revoke all on function public.complete_room_upgrade(text, text) from public;
grant execute on function public.complete_room_upgrade(text, text) to authenticated;

-- 3. A guest's Itinerary was a session-only bookmark list (React state
-- that reset on every relaunch) with no persistence and no connection to
-- the guest's real activity bookings, which is why it read as blank even
-- with real reservations behind it. Activity bookings are already real
-- rows (activity_bookings); this table backs the other case — a guest
-- bookmarking an event they haven't "booked" (events have no booking flow).
create table public.itinerary_saved_events (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (guest_id, event_id)
);

alter table public.itinerary_saved_events enable row level security;

create policy itinerary_saved_events_self on public.itinerary_saved_events
for select using (guest_id in (select id from public.guests where auth_user_id = auth.uid()));

create policy itinerary_saved_events_self_insert on public.itinerary_saved_events
for insert with check (guest_id in (select id from public.guests where auth_user_id = auth.uid()));

create policy itinerary_saved_events_self_delete on public.itinerary_saved_events
for delete using (guest_id in (select id from public.guests where auth_user_id = auth.uid()));
