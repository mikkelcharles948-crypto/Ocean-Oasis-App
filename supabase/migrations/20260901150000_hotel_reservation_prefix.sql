-- create_reservation() hardcoded 'OO-' as the reservation number prefix
-- for every hotel -- harmless with one hotel, visibly wrong for a second
-- (a Fort Young guest getting an "OO-58213" confirmation number). Adds a
-- short per-hotel code the platform admin can set, defaulting to one
-- derived from the existing two hotels' names.
alter table public.hotels add column code text;
update public.hotels set code = 'OO' where slug = 'ocean-oasis-dm';
update public.hotels set code = 'FY' where slug = 'fort-young-dm';
alter table public.hotels alter column code set not null;
alter table public.hotels add constraint hotels_code_key unique (code);

create or replace function public.create_reservation(
  p_room_id text, p_check_in date, p_check_out date, p_adults integer, p_children integer default 0,
  p_special_requests text default null, p_arrival_time text default null, p_guest_id uuid default null,
  p_hotel_id uuid default null
)
returns public.reservations
language plpgsql security definer set search_path = public
as $$
declare
  resolved_guest_id uuid;
  resolved_hotel_id uuid;
  hotel_code text;
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

  if p_hotel_id is not null then
    resolved_hotel_id := p_hotel_id;
  elsif (select count(*) from public.hotels) = 1 then
    select id into resolved_hotel_id from public.hotels limit 1;
  else
    raise exception using errcode = '22023', message = 'hotel_id is required';
  end if;

  select code into hotel_code from public.hotels where id = resolved_hotel_id;

  if p_check_in is null or p_check_out is null or p_check_out <= p_check_in then
    raise exception using errcode = '22023', message = 'Check-out date must be after check-in date';
  end if;
  if p_check_in < current_date then
    raise exception using errcode = '22023', message = 'Check-in date cannot be in the past';
  end if;
  if coalesce(p_adults, 0) < 1 then
    raise exception using errcode = '22023', message = 'At least one adult is required';
  end if;

  select * into room_row from public.rooms where id = p_room_id and hotel_id = resolved_hotel_id;
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
      adults, children, status, arrival_time, special_requests, hotel_id
    ) values (
      reservation_id, hotel_code || '-' || nextval('public.reservation_number_seq'), resolved_guest_id, p_room_id,
      p_check_in, p_check_out, nights, p_adults, coalesce(p_children, 0), 'confirmed',
      p_arrival_time, p_special_requests, resolved_hotel_id
    )
    returning * into reservation_row;
  exception when exclusion_violation then
    raise exception using errcode = 'P0001', message = 'This room is no longer available for those dates';
  end;

  update public.guests set hotel_id = resolved_hotel_id where id = resolved_guest_id;

  return reservation_row;
end;
$$;
