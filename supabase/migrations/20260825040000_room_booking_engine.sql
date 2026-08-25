-- Phase 1 of the development roadmap: a real room-booking engine.
-- Previously `reservations` had no INSERT path at all — guests arrived
-- with a reservation that could only be created by seeding/admin access.
-- This adds: a database-level guarantee against overlapping room bookings
-- (not just application logic), an availability-search RPC, and a
-- create_reservation RPC usable by both a self-service guest and staff
-- creating a booking on a guest's behalf.

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------
-- Overlap prevention at the data layer. This is the real guarantee —
-- even a bug in application code, a second concurrent RPC call, or a
-- direct API call cannot create two confirmed/checked-in reservations
-- for the same room on overlapping dates. Cancelled/checked-out
-- reservations don't block new bookings for those dates.
-- ---------------------------------------------------------------------
alter table public.reservations
  add constraint reservations_no_overlapping_room_dates
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status in ('confirmed', 'checked_in') and room_id is not null);

-- Reservation numbers were previously seeded by hand (OO-58213 style).
-- A sequence guarantees uniqueness for every new booking from here on.
create sequence if not exists public.reservation_number_seq start 90000;

-- ---------------------------------------------------------------------
-- Availability search — read-only, safe for any authenticated user
-- (guests need to see what's bookable before they can book it).
-- ---------------------------------------------------------------------
create or replace function public.search_available_rooms(
  p_check_in date,
  p_check_out date,
  p_room_type text default null,
  p_guests integer default 1
)
returns setof public.rooms
language sql
stable
security definer
set search_path = public
as $$
  select r.*
  from public.rooms r
  where r.status <> 'OUT_OF_ORDER'
    and (p_room_type is null or r.type = p_room_type)
    and r.max_occupancy >= coalesce(p_guests, 1)
    and not exists (
      select 1 from public.reservations res
      where res.room_id = r.id
        and res.status in ('confirmed', 'checked_in')
        and daterange(res.check_in, res.check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
    )
  order by r.number;
$$;

revoke all on function public.search_available_rooms(date, date, text, integer) from public;
grant execute on function public.search_available_rooms(date, date, text, integer) to authenticated;

-- ---------------------------------------------------------------------
-- Booking creation. Two callers:
--  - a guest booking for themselves: pass p_guest_id => null, resolved
--    from auth.uid()
--  - staff booking on a guest's behalf (front desk, phone reservation):
--    pass an explicit p_guest_id, requires is_staff()
-- The EXCLUDE constraint above is the actual double-booking guarantee;
-- this function's own checks exist to fail with a clear message instead
-- of a raw constraint-violation error, and to validate business rules
-- (dates, occupancy) before that constraint is even reached.
-- ---------------------------------------------------------------------
create or replace function public.create_reservation(
  p_room_id text,
  p_check_in date,
  p_check_out date,
  p_adults integer,
  p_children integer default 0,
  p_special_requests text default null,
  p_arrival_time text default null,
  p_guest_id uuid default null
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_guest_id uuid;
  room_row public.rooms;
  reservation_row public.reservations;
  reservation_id text;
  nights integer;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if p_guest_id is not null then
    if not public.is_staff() then
      raise exception using errcode = '42501', message = 'Only staff can create a reservation for another guest';
    end if;
    resolved_guest_id := p_guest_id;
  else
    select id into resolved_guest_id from public.guests where auth_user_id = auth.uid();
    if resolved_guest_id is null then
      raise exception using errcode = '42501', message = 'Guest profile not found';
    end if;
  end if;

  if p_check_in is null or p_check_out is null or p_check_out <= p_check_in then
    raise exception using errcode = '22023', message = 'Check-out date must be after check-in date';
  end if;
  if p_check_in < current_date then
    raise exception using errcode = '22023', message = 'Check-in date cannot be in the past';
  end if;
  if coalesce(p_adults, 0) < 1 then
    raise exception using errcode = '22023', message = 'At least one adult is required';
  end if;

  select * into room_row from public.rooms where id = p_room_id;
  if room_row.id is null then
    raise exception using errcode = 'P0002', message = 'Room not found';
  end if;
  if room_row.status = 'OUT_OF_ORDER' then
    raise exception using errcode = 'P0001', message = 'This room is out of service';
  end if;
  if coalesce(p_adults, 0) + coalesce(p_children, 0) > room_row.max_occupancy then
    raise exception using errcode = 'P0001', message = 'This room does not accommodate that many guests';
  end if;

  nights := p_check_out - p_check_in;
  reservation_id := 'r_' || replace(gen_random_uuid()::text, '-', '');

  begin
    insert into public.reservations (
      id, reservation_number, guest_id, room_id, check_in, check_out, nights,
      adults, children, status, arrival_time, special_requests
    ) values (
      reservation_id, 'OO-' || nextval('public.reservation_number_seq'), resolved_guest_id, p_room_id,
      p_check_in, p_check_out, nights, p_adults, coalesce(p_children, 0), 'confirmed',
      p_arrival_time, p_special_requests
    )
    returning * into reservation_row;
  exception when exclusion_violation then
    raise exception using errcode = 'P0001', message = 'This room is no longer available for those dates';
  end;

  return reservation_row;
end;
$$;

revoke all on function public.create_reservation(text, date, date, integer, integer, text, text, uuid) from public;
grant execute on function public.create_reservation(text, date, date, integer, integer, text, text, uuid) to authenticated;

-- Lets staff create a plain guest profile (no login account) for a
-- walk-in or phone booking — guests.auth_user_id is nullable precisely
-- for this case; the person can be invited to create an account later
-- without changing this row.
create or replace function public.create_guest_profile(
  p_first_name text,
  p_last_name text,
  p_email text default null,
  p_phone text default null
)
returns public.guests
language plpgsql
security definer
set search_path = public
as $$
declare
  guest_row public.guests;
begin
  if not public.is_staff() then
    raise exception using errcode = '42501', message = 'Only staff can create a guest profile';
  end if;
  if coalesce(trim(p_first_name), '') = '' or coalesce(trim(p_last_name), '') = '' then
    raise exception using errcode = '22023', message = 'First and last name are required';
  end if;

  insert into public.guests (first_name, last_name, email, phone)
  values (trim(p_first_name), trim(p_last_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''))
  returning * into guest_row;

  return guest_row;
end;
$$;

revoke all on function public.create_guest_profile(text, text, text, text) from public;
grant execute on function public.create_guest_profile(text, text, text, text) to authenticated;

-- Defense-in-depth INSERT policy alongside the RPC (which is
-- SECURITY DEFINER and bypasses RLS) — keeps the table's own policy set
-- consistent with the rest of this project's pattern (e.g.
-- activity_bookings_guest_insert_safe) in case anything ever reads
-- policies to reason about what's allowed.
create policy reservations_guest_insert_safe on public.reservations
for insert to authenticated
with check (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  or public.is_staff()
);
