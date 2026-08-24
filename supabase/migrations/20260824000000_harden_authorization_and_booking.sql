alter table public.profiles alter column role drop not null;
alter table public.profiles alter column role drop default;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role from public.profiles p where p.id = auth.uid();
$$;

create or replace function public.has_role(allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = any(allowed_roles), false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(array[
    'SUPER_ADMIN'::public.app_role,
    'GENERAL_MANAGER'::public.app_role,
    'MANAGEMENT'::public.app_role,
    'FRONT_DESK'::public.app_role,
    'CONCIERGE'::public.app_role,
    'HOUSEKEEPING'::public.app_role,
    'MAINTENANCE'::public.app_role,
    'FOOD_AND_BEVERAGE'::public.app_role,
    'ACTIVITIES_MANAGER'::public.app_role,
    'MARKETING'::public.app_role
  ]);
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(array[
    'SUPER_ADMIN'::public.app_role,
    'GENERAL_MANAGER'::public.app_role,
    'MANAGEMENT'::public.app_role,
    'MARKETING'::public.app_role
  ]);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  insert into public.guests (auth_user_id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email
  );
  return new;
end;
$$;

 drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update_safe on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (first_name, last_name, phone, avatar_url) on public.profiles to authenticated;
revoke update on public.guests from authenticated;
grant update (first_name, last_name, phone, language, interests) on public.guests to authenticated;

drop policy if exists profiles_self_or_staff on public.profiles;
create policy profiles_self_or_authorized_staff on public.profiles
for select using (id = auth.uid() or public.is_staff());

drop policy if exists guests_self_or_staff on public.guests;
create policy guests_self_or_authorized_staff on public.guests
for select using (auth_user_id = auth.uid() or public.is_staff());

drop policy if exists guests_self_update on public.guests;
create policy guests_self_update_safe on public.guests
for update using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

drop policy if exists reservations_self_or_staff on public.reservations;
create policy reservations_self_or_authorized_staff on public.reservations
for select using (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  or public.is_staff()
);

drop policy if exists rooms_authenticated_read on public.rooms;
create policy rooms_authenticated_read_safe on public.rooms
for select to authenticated using (public.is_staff() or id in (
  select r.room_id from public.reservations r
  join public.guests g on g.id = r.guest_id
  where g.auth_user_id = auth.uid()
));

drop policy if exists activities_staff_write on public.activities;
create policy activities_staff_write_safe on public.activities
for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists activity_bookings_guest_insert on public.activity_bookings;
create policy activity_bookings_guest_insert_safe on public.activity_bookings
for insert with check (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
);

drop policy if exists service_requests_self_or_staff on public.service_requests;
create policy service_requests_self_or_authorized_staff on public.service_requests
for select using (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  or public.is_staff()
);

drop policy if exists requests_guest_insert on public.service_requests;
create policy requests_guest_insert_safe on public.service_requests
for insert with check (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
);

drop policy if exists requests_staff_update on public.service_requests;
create policy requests_staff_update_safe on public.service_requests
for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists audit_staff_insert on public.audit_log;
create policy audit_staff_insert_safe on public.audit_log
for insert with check (public.is_staff() and actor_id = auth.uid());

create or replace function public.book_activity(
  requested_activity_id text,
  requested_guests integer
)
returns public.activity_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  activity_row public.activities;
  guest_row public.guests;
  booked_count integer;
  booking_row public.activity_bookings;
  booking_id text;
begin
  if auth.uid() is null then raise exception using errcode = '42501', message = 'Authentication required'; end if;
  if requested_guests is null or requested_guests < 1 then raise exception using errcode = '22023', message = 'Guest count must be positive'; end if;

  select * into guest_row from public.guests where auth_user_id = auth.uid() for share;
  if guest_row.id is null then raise exception using errcode = '42501', message = 'Guest profile not found'; end if;

  select * into activity_row from public.activities where id = requested_activity_id and status = 'PUBLISHED' for update;
  if activity_row.id is null then raise exception using errcode = 'P0002', message = 'Activity unavailable'; end if;

  select coalesce(sum(guests), 0) into booked_count
  from public.activity_bookings
  where activity_id = requested_activity_id and status = 'CONFIRMED';
  if booked_count + requested_guests > activity_row.capacity then
    raise exception using errcode = 'P0001', message = 'Activity is full';
  end if;

  if exists (
    select 1 from public.activity_bookings
    where activity_id = requested_activity_id and guest_id = guest_row.id and status = 'CONFIRMED'
  ) then
    raise exception using errcode = '23505', message = 'Activity already booked';
  end if;

  booking_id := 'ab_' || replace(gen_random_uuid()::text, '-', '');
  insert into public.activity_bookings (id, activity_id, guest_id, guests, amount)
  values (booking_id, requested_activity_id, guest_row.id, requested_guests, activity_row.price_value * requested_guests)
  returning * into booking_row;
  return booking_row;
end;
$$;

revoke all on function public.book_activity(text, integer) from public;
grant execute on function public.book_activity(text, integer) to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists guests_touch_updated_at on public.guests;
create trigger guests_touch_updated_at before update on public.guests for each row execute function public.touch_updated_at();
drop trigger if exists activities_touch_updated_at on public.activities;
create trigger activities_touch_updated_at before update on public.activities for each row execute function public.touch_updated_at();
drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at before update on public.events for each row execute function public.touch_updated_at();
drop trigger if exists promotions_touch_updated_at on public.promotions;
create trigger promotions_touch_updated_at before update on public.promotions for each row execute function public.touch_updated_at();
drop trigger if exists content_items_touch_updated_at on public.content_items;
create trigger content_items_touch_updated_at before update on public.content_items for each row execute function public.touch_updated_at();
