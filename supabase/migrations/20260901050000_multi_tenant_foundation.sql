-- Phase 1 of the Ocean Oasis -> MCX Technologies multi-hotel platform pivot.
-- Adds a hotels table, hotel_id scoping across the schema, a platform-admin
-- role that sits above every hotel, and rewrites RLS so each hotel's data
-- is fully isolated. The existing Ocean Oasis data is backfilled as the
-- first hotel, so nothing about the live app's behavior changes today —
-- this only becomes visible once a second hotel is onboarded.

-- =========================================================================
-- 1. hotels table
-- =========================================================================
create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  legal_name text,
  address text,
  phone text,
  email text,
  timezone text not null default 'UTC',
  currency text not null default 'USD',
  theme jsonb not null default '{}'::jsonb,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','TRIAL','SUSPENDED')),
  created_at timestamptz not null default now()
);
alter table public.hotels enable row level security;

-- =========================================================================
-- 2. hotel_id columns (nullable for now — backfilled in step 4) — added
--    before the helper functions below, since a plain SQL function body is
--    validated against the schema at CREATE time.
-- =========================================================================
alter table public.profiles add column hotel_id uuid references public.hotels(id);
alter table public.guests add column hotel_id uuid references public.hotels(id);
alter table public.rooms add column hotel_id uuid references public.hotels(id);
alter table public.reservations add column hotel_id uuid references public.hotels(id);
alter table public.activities add column hotel_id uuid references public.hotels(id);
alter table public.events add column hotel_id uuid references public.hotels(id);
alter table public.promotions add column hotel_id uuid references public.hotels(id);
alter table public.service_requests add column hotel_id uuid references public.hotels(id);
alter table public.maintenance_issues add column hotel_id uuid references public.hotels(id);
alter table public.feedback add column hotel_id uuid references public.hotels(id);
alter table public.content_items add column hotel_id uuid references public.hotels(id);
alter table public.photo_overrides add column hotel_id uuid references public.hotels(id);
alter table public.notifications add column hotel_id uuid references public.hotels(id);
alter table public.audit_log add column hotel_id uuid references public.hotels(id);
alter table public.push_tokens add column hotel_id uuid references public.hotels(id);
-- concierge_conversations is the parent of concierge_messages; denormalizing
-- hotel_id here (set once, at creation) avoids a guests join on every RLS
-- check for both tables.
alter table public.concierge_conversations add column hotel_id uuid references public.hotels(id);

-- =========================================================================
-- 3. Tenant-scoping helper functions
-- =========================================================================
create or replace function public.current_hotel_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select hotel_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_guest_hotel_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select hotel_id from public.guests where auth_user_id = auth.uid();
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = 'PLATFORM_ADMIN', false);
$$;

create policy hotels_platform_admin_all on public.hotels
for all using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy hotels_own_read on public.hotels
for select using (id = public.current_hotel_id() or id = public.current_guest_hotel_id());

-- =========================================================================
-- 4. Backfill: today's data becomes hotel #1
-- =========================================================================
do $$
declare
  v_hotel_id uuid;
begin
  insert into public.hotels (slug, name, legal_name, address, phone, email, timezone, currency, status)
  values ('ocean-oasis-dm', 'Ocean Oasis', 'Ocean Oasis Hotel Dominica',
          'Castle Comfort, Roseau St. George, Dominica', '+1 (767) 255-8500',
          'stay@oceanoasisdominica.com', 'America/Dominica', 'USD', 'ACTIVE')
  returning id into v_hotel_id;

  update public.profiles set hotel_id = v_hotel_id where role is not null;
  update public.guests set hotel_id = v_hotel_id;
  update public.rooms set hotel_id = v_hotel_id;
  update public.reservations set hotel_id = v_hotel_id;
  update public.activities set hotel_id = v_hotel_id;
  update public.events set hotel_id = v_hotel_id;
  update public.promotions set hotel_id = v_hotel_id;
  update public.service_requests set hotel_id = v_hotel_id;
  update public.maintenance_issues set hotel_id = v_hotel_id;
  update public.feedback set hotel_id = v_hotel_id;
  update public.content_items set hotel_id = v_hotel_id;
  update public.photo_overrides set hotel_id = v_hotel_id;
  update public.notifications set hotel_id = v_hotel_id;
  update public.audit_log set hotel_id = v_hotel_id;
  update public.push_tokens set hotel_id = v_hotel_id;
  update public.concierge_conversations set hotel_id = v_hotel_id;
end $$;

alter table public.rooms alter column hotel_id set not null;
alter table public.reservations alter column hotel_id set not null;
alter table public.activities alter column hotel_id set not null;
alter table public.events alter column hotel_id set not null;
alter table public.promotions alter column hotel_id set not null;
alter table public.service_requests alter column hotel_id set not null;
alter table public.maintenance_issues alter column hotel_id set not null;
alter table public.feedback alter column hotel_id set not null;
alter table public.content_items alter column hotel_id set not null;
alter table public.photo_overrides alter column hotel_id set not null;
alter table public.concierge_conversations alter column hotel_id set not null;
-- profiles.hotel_id stays nullable (PLATFORM_ADMIN has none); guests.hotel_id
-- stays nullable (null until their first reservation); notifications/
-- audit_log/push_tokens stay nullable at the column level even though every
-- row today has one — new rows get it from the triggers in step 5, and a
-- not-null constraint isn't worth the risk of a trigger-ordering edge case
-- blocking a write outright.

-- =========================================================================
-- 5. Auto-fill hotel_id from the caller, so existing insert call sites
--    (registerPushToken, notifyStaffRole, etc.) need no client changes.
-- =========================================================================
create or replace function public.set_caller_hotel_id()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.hotel_id is null then
    new.hotel_id := coalesce(
      (select hotel_id from public.profiles where id = auth.uid()),
      (select hotel_id from public.guests where auth_user_id = auth.uid())
    );
  end if;
  return new;
end;
$$;

create trigger push_tokens_set_hotel before insert on public.push_tokens
for each row execute function public.set_caller_hotel_id();

create trigger notifications_set_hotel before insert on public.notifications
for each row execute function public.set_caller_hotel_id();

-- Covers the direct client-side audit_log inserts in supabaseStaffData.js's
-- writeAuditEntry (for tables the write_audit_entry() DB trigger doesn't
-- cover, e.g. creating an activity/event/promotion) — the trigger-generated
-- rows are stamped explicitly inside write_audit_entry() itself instead.
create trigger audit_log_set_hotel before insert on public.audit_log
for each row execute function public.set_caller_hotel_id();

-- =========================================================================
-- 6. RLS rewrite
-- =========================================================================

-- activities / events / promotions: identical staff-content pattern
drop policy activities_authenticated_read on public.activities;
create policy activities_authenticated_read on public.activities
for select using (
  (status = 'PUBLISHED' and hotel_id = public.current_guest_hotel_id())
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);
drop policy activities_staff_write_safe on public.activities;
create policy activities_staff_write on public.activities
for all using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

drop policy events_authenticated_read on public.events;
create policy events_authenticated_read on public.events
for select using (
  (status = 'PUBLISHED' and hotel_id = public.current_guest_hotel_id())
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);
drop policy events_staff_write on public.events;
create policy events_staff_write on public.events
for all using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

drop policy promotions_authenticated_read on public.promotions;
create policy promotions_authenticated_read on public.promotions
for select using (
  (status = 'PUBLISHED' and hotel_id = public.current_guest_hotel_id())
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);
drop policy promotions_staff_write on public.promotions;
create policy promotions_staff_write on public.promotions
for all using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

-- content_items / maintenance_issues / photo_overrides: staff-only, same shape
drop policy content_staff_only on public.content_items;
create policy content_staff_write on public.content_items
for all using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

drop policy maintenance_staff_only on public.maintenance_issues;
create policy maintenance_staff_write on public.maintenance_issues
for all using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

drop policy photo_overrides_read on public.photo_overrides;
create policy photo_overrides_read on public.photo_overrides
for select using (
  hotel_id = public.current_guest_hotel_id()
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);
drop policy photo_overrides_staff_write on public.photo_overrides;
create policy photo_overrides_staff_write on public.photo_overrides
for all using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

-- rooms
drop policy rooms_authenticated_read_safe on public.rooms;
create policy rooms_authenticated_read_safe on public.rooms
for select using (
  (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
  or id in (select r.room_id from public.reservations r join public.guests g on g.id = r.guest_id where g.auth_user_id = auth.uid())
);
drop policy rooms_staff_write on public.rooms;
create policy rooms_staff_write on public.rooms
for update using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

-- guests
drop policy guests_self_or_authorized_staff on public.guests;
create policy guests_self_or_authorized_staff on public.guests
for select using (
  auth_user_id = auth.uid()
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);

-- profiles
drop policy profiles_self_or_authorized_staff on public.profiles;
create policy profiles_self_or_authorized_staff on public.profiles
for select using (
  id = auth.uid()
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);

-- reservations
drop policy reservations_guest_insert_safe on public.reservations;
create policy reservations_guest_insert_safe on public.reservations
for insert with check (
  (guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid()) and hotel_id = public.current_guest_hotel_id())
  or (public.is_staff() and hotel_id = public.current_hotel_id())
);
drop policy reservations_self_or_authorized_staff on public.reservations;
create policy reservations_self_or_authorized_staff on public.reservations
for select using (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);

-- service_requests — also dedupes two identical legacy policies left over
-- from an earlier migration that never got cleaned up.
drop policy if exists requests_self_or_staff on public.service_requests;
drop policy if exists service_requests_self_or_authorized_staff on public.service_requests;
create policy service_requests_self_or_staff on public.service_requests
for select using (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);
drop policy requests_staff_update_safe on public.service_requests;
create policy requests_staff_update_safe on public.service_requests
for update using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

-- feedback
drop policy feedback_self_or_staff on public.feedback;
create policy feedback_self_or_staff on public.feedback
for select using (
  guest_id in (select id from public.guests where auth_user_id = auth.uid())
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);
drop policy feedback_staff_update on public.feedback;
create policy feedback_staff_update on public.feedback
for update using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

-- activity_bookings (no own hotel_id column — scope via the parent activity)
drop policy activity_bookings_guest_insert_safe on public.activity_bookings;
create policy activity_bookings_guest_insert_safe on public.activity_bookings
for insert with check (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  and activity_id in (select id from public.activities where hotel_id = public.current_guest_hotel_id())
);
drop policy activity_bookings_self_or_staff on public.activity_bookings;
create policy activity_bookings_self_or_staff on public.activity_bookings
for select using (
  guest_id in (select id from public.guests where auth_user_id = auth.uid())
  or (public.is_staff() and activity_id in (select id from public.activities where hotel_id = public.current_hotel_id()))
  or public.is_platform_admin()
);

-- notifications
drop policy notifications_broadcast_insert_safe on public.notifications;
create policy notifications_broadcast_insert_safe on public.notifications
for insert with check (
  auth.uid() is not null and recipient_user_id is null and recipient_role is not null
  and category = any (array['Requests','Activities','Feedback','Emergency','Concierge'])
  and (hotel_id = public.current_guest_hotel_id() or (public.is_staff() and hotel_id = public.current_hotel_id()))
);
drop policy notifications_recipient_or_staff on public.notifications;
create policy notifications_recipient_or_staff on public.notifications
for select using (
  recipient_user_id = auth.uid()
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);
drop policy notifications_staff_update on public.notifications;
create policy notifications_staff_update on public.notifications
for update using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

-- audit_log
drop policy audit_staff_insert_safe on public.audit_log;
create policy audit_staff_insert_safe on public.audit_log
for insert with check (public.is_staff() and actor_id = auth.uid() and hotel_id = public.current_hotel_id());
drop policy audit_staff_read on public.audit_log;
create policy audit_staff_read on public.audit_log
for select using ((public.is_staff() and hotel_id = public.current_hotel_id()) or public.is_platform_admin());

-- push_tokens
drop policy push_tokens_staff_read on public.push_tokens;
create policy push_tokens_staff_read on public.push_tokens
for select using ((public.is_staff() and hotel_id = public.current_hotel_id()) or public.is_platform_admin());

-- concierge_conversations / concierge_messages
drop policy concierge_conversations_guest_select on public.concierge_conversations;
create policy concierge_conversations_guest_select on public.concierge_conversations
for select using (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  or (public.is_staff() and hotel_id = public.current_hotel_id())
  or public.is_platform_admin()
);
drop policy concierge_conversations_staff_update on public.concierge_conversations;
create policy concierge_conversations_staff_update on public.concierge_conversations
for update using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

drop policy concierge_messages_select on public.concierge_messages;
create policy concierge_messages_select on public.concierge_messages
for select using (
  (public.is_staff() and conversation_id in (select id from public.concierge_conversations where hotel_id = public.current_hotel_id()))
  or public.is_platform_admin()
  or conversation_id in (select c.id from public.concierge_conversations c where c.guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid()))
);
drop policy concierge_messages_staff_insert on public.concierge_messages;
create policy concierge_messages_staff_insert on public.concierge_messages
for insert with check (
  public.is_staff() and role = 'staff' and staff_id = auth.uid()
  and conversation_id in (select id from public.concierge_conversations where hotel_id = public.current_hotel_id())
);

-- =========================================================================
-- 7. RPCs: hotel-aware booking, and closing two cross-tenant gaps found
--    while wiring this up (book_activity trusted any activity id; the
--    emergency broadcast had no hotel filter at all).
-- =========================================================================

create or replace function public.search_available_rooms(
  p_check_in date, p_check_out date, p_room_type text default null, p_guests integer default 1,
  p_hotel_id uuid default null
)
returns setof public.rooms
language plpgsql stable security definer set search_path = public
as $$
declare
  v_hotel_id uuid;
begin
  if p_hotel_id is not null then
    v_hotel_id := p_hotel_id;
  elsif (select count(*) from public.hotels) = 1 then
    select id into v_hotel_id from public.hotels limit 1;
  else
    raise exception using errcode = '22023', message = 'hotel_id is required';
  end if;

  return query
    select r.*
    from public.rooms r
    where r.hotel_id = v_hotel_id
      and r.status <> 'OUT_OF_ORDER'
      and (p_room_type is null or r.type = p_room_type)
      and r.max_occupancy >= coalesce(p_guests, 1)
      and not exists (
        select 1 from public.reservations res
        where res.room_id = r.id
          and res.status in ('confirmed', 'checked_in')
          and daterange(res.check_in, res.check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
      )
    order by r.number;
end;
$$;

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
      reservation_id, 'OO-' || nextval('public.reservation_number_seq'), resolved_guest_id, p_room_id,
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

create or replace function public.book_activity(requested_activity_id text, requested_guests integer)
returns public.activity_bookings
language plpgsql security definer set search_path = public
as $$
declare
  activity_row public.activities;
  guest_row public.guests;
  booked_count integer;
  booking_row public.activity_bookings;
begin
  if auth.uid() is null then raise exception using errcode = '42501', message = 'Authentication required'; end if;
  if requested_guests is null or requested_guests < 1 then raise exception using errcode = '22023', message = 'Guest count must be positive'; end if;
  select * into guest_row from public.guests where auth_user_id = auth.uid() for share;
  if guest_row.id is null then raise exception using errcode = '42501', message = 'Guest profile not found'; end if;
  select * into activity_row from public.activities where id = requested_activity_id and status = 'PUBLISHED' for update;
  if activity_row.id is null or activity_row.hotel_id is distinct from guest_row.hotel_id then
    raise exception using errcode = 'P0002', message = 'Activity unavailable';
  end if;
  select coalesce(sum(guests), 0) into booked_count from public.activity_bookings where activity_id = requested_activity_id and status = 'CONFIRMED';
  if booked_count + requested_guests > activity_row.capacity then raise exception using errcode = 'P0001', message = 'Activity is full'; end if;
  if exists (select 1 from public.activity_bookings where activity_id = requested_activity_id and guest_id = guest_row.id and status = 'CONFIRMED') then
    raise exception using errcode = '23505', message = 'Activity already booked';
  end if;
  insert into public.activity_bookings (activity_id, guest_id, guests, amount)
  values (requested_activity_id, guest_row.id, requested_guests, activity_row.price_value * requested_guests)
  returning * into booking_row;
  return booking_row;
end;
$$;

create or replace function public.create_guest_profile(p_first_name text, p_last_name text, p_email text default null, p_phone text default null)
returns public.guests
language plpgsql security definer set search_path = public
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

  insert into public.guests (first_name, last_name, email, phone, hotel_id)
  values (trim(p_first_name), trim(p_last_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), public.current_hotel_id())
  returning * into guest_row;

  return guest_row;
end;
$$;

create or replace function public.create_content_item(p_type text, p_title text, p_description text)
returns public.content_items
language plpgsql security definer set search_path = public
as $$
declare
  new_row public.content_items;
  new_id text;
begin
  if not public.is_staff() then
    raise exception 'Staff access required';
  end if;
  new_id := 'content_' || substr(gen_random_uuid()::text, 1, 8);
  insert into public.content_items (id, type, title, description, status, hotel_id)
  values (new_id, p_type, p_title, p_description, 'DRAFT', public.current_hotel_id())
  returning * into new_row;
  return new_row;
end;
$$;

create or replace function public.broadcast_emergency_alert(p_title text, p_body text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  inserted_count integer := 0;
  guest_row record;
  last_sent timestamptz;
  v_hotel_id uuid;
begin
  if not public.is_staff() then
    raise exception using errcode = '42501', message = 'Only staff can send emergency broadcasts';
  end if;
  v_hotel_id := public.current_hotel_id();

  select max(sent_at) into last_sent from public.emergency_broadcast_log where actor_id = auth.uid();
  if last_sent is not null and last_sent > now() - interval '5 minutes' then
    raise exception using errcode = '42901', message = 'Please wait a few minutes before sending another broadcast.';
  end if;

  for guest_row in
    select distinct g.auth_user_id
    from public.guests g
    join public.reservations r on r.guest_id = g.id
    where g.auth_user_id is not null
      and r.status in ('confirmed', 'checked_in')
      and g.hotel_id = v_hotel_id
  loop
    insert into public.notifications (id, recipient_user_id, category, title, body, hotel_id)
    values (
      'em_' || substr(md5(random()::text || guest_row.auth_user_id::text), 1, 20),
      guest_row.auth_user_id, 'Emergency', p_title, p_body, v_hotel_id
    );
    inserted_count := inserted_count + 1;
  end loop;

  insert into public.notifications (id, recipient_role, category, title, body, hotel_id)
  select 'em_staff_' || substr(md5(random()::text || role::text), 1, 16), role, 'Emergency', p_title, p_body, v_hotel_id
  from unnest(enum_range(null::public.app_role)) as role
  where role <> 'PLATFORM_ADMIN';

  insert into public.emergency_broadcast_log (actor_id) values (auth.uid());

  return inserted_count;
end;
$$;

-- complete_room_upgrade(): same shape as book_activity's fix above — this is
-- SECURITY DEFINER (bypasses RLS internally), so it needs its own explicit
-- check that the destination room belongs to the same hotel as the guest's
-- reservation, rather than trusting the caller.
create or replace function public.complete_room_upgrade(p_request_id text, p_new_room_id text)
returns public.service_requests
language plpgsql security definer set search_path = public
as $$
declare
  req public.service_requests;
  res public.reservations;
  new_room public.rooms;
  old_room_id text;
begin
  if not public.is_staff() then
    raise exception 'Not authorized';
  end if;

  select * into req from public.service_requests where id = p_request_id and hotel_id = public.current_hotel_id();
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

  select * into new_room from public.rooms where id = p_new_room_id and hotel_id = res.hotel_id;
  if new_room.id is null then
    raise exception 'Room not found';
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

-- write_audit_entry() trigger: same enrichment as before, now also stamping
-- hotel_id (staff actor's hotel, falling back to the guest's own hotel for
-- guest-triggered rows like a new activity_bookings insert via book_activity).
create or replace function public.write_audit_entry()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  actor_first text;
  actor_last text;
  actor_display_name text;
  changed jsonb := '{}'::jsonb;
  entry_hotel_id uuid;
begin
  select first_name, last_name into actor_first, actor_last from public.profiles where id = auth.uid();
  actor_display_name := case when actor_first is not null then trim(actor_first || ' ' || coalesce(actor_last, '')) else null end;
  entry_hotel_id := coalesce(public.current_hotel_id(), public.current_guest_hotel_id());

  if TG_TABLE_NAME = 'service_requests' and TG_OP = 'UPDATE' then
    if old.status is distinct from new.status then
      changed := changed || jsonb_build_object('status_from', old.status, 'status_to', new.status, 'category', new.category, 'room_number', new.room_number);
    end if;
    if old.assigned_staff_id is distinct from new.assigned_staff_id and new.assigned_staff_id is not null then
      changed := changed || jsonb_build_object('assigned_staff_id', new.assigned_staff_id, 'category', new.category, 'room_number', new.room_number);
    end if;
  elsif TG_TABLE_NAME = 'service_requests' and TG_OP = 'INSERT' then
    changed := jsonb_build_object('category', new.category, 'room_number', new.room_number);
  elsif TG_TABLE_NAME = 'rooms' and TG_OP = 'UPDATE' and old.status is distinct from new.status then
    changed := jsonb_build_object('room_number', new.number, 'status_from', old.status, 'status_to', new.status);
  elsif TG_TABLE_NAME = 'activity_bookings' and TG_OP = 'INSERT' then
    changed := jsonb_build_object('activity_id', new.activity_id, 'guests', new.guests);
  end if;

  insert into public.audit_log (actor_id, actor_name, actor_role, action, metadata, hotel_id)
  values (
    auth.uid(), actor_display_name, public.current_app_role(),
    lower(TG_OP) || ' ' || TG_TABLE_NAME,
    jsonb_build_object('entity_id', coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id'))) || changed,
    entry_hotel_id
  );
  return coalesce(new, old);
end;
$$;
