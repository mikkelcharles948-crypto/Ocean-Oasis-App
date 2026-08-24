alter table public.service_requests alter column id set default ('sr_' || replace(gen_random_uuid()::text, '-', ''));
alter table public.activities alter column id set default ('a_' || replace(gen_random_uuid()::text, '-', ''));
alter table public.activity_bookings alter column id set default ('ab_' || replace(gen_random_uuid()::text, '-', ''));
alter table public.events alter column id set default ('e_' || replace(gen_random_uuid()::text, '-', ''));
alter table public.promotions alter column id set default ('p_' || replace(gen_random_uuid()::text, '-', ''));
alter table public.maintenance_issues alter column id set default ('m_' || replace(gen_random_uuid()::text, '-', ''));
alter table public.content_items alter column id set default ('c_' || replace(gen_random_uuid()::text, '-', ''));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'first_name', ''), coalesce(new.raw_user_meta_data ->> 'last_name', ''))
  on conflict (id) do nothing;
  insert into public.guests (auth_user_id, first_name, last_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'first_name', ''), coalesce(new.raw_user_meta_data ->> 'last_name', ''), new.email)
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

create or replace function public.book_activity(requested_activity_id text, requested_guests integer)
returns public.activity_bookings
language plpgsql security definer set search_path = public
as $$
declare activity_row public.activities; guest_id_value uuid; booked_count integer; booking_row public.activity_bookings;
begin
  if auth.uid() is null then raise exception using errcode = '42501', message = 'Authentication required'; end if;
  if requested_guests is null or requested_guests < 1 then raise exception using errcode = '22023', message = 'Guest count must be positive'; end if;
  select id into guest_id_value from public.guests where auth_user_id = auth.uid() for share;
  if guest_id_value is null then raise exception using errcode = '42501', message = 'Guest profile not found'; end if;
  select * into activity_row from public.activities where id = requested_activity_id and status = 'PUBLISHED' for update;
  if activity_row.id is null then raise exception using errcode = 'P0002', message = 'Activity unavailable'; end if;
  select coalesce(sum(guests), 0) into booked_count from public.activity_bookings where activity_id = requested_activity_id and status = 'CONFIRMED';
  if booked_count + requested_guests > activity_row.capacity then raise exception using errcode = 'P0001', message = 'Activity is full'; end if;
  if exists (select 1 from public.activity_bookings where activity_id = requested_activity_id and guest_id = guest_id_value and status = 'CONFIRMED') then raise exception using errcode = '23505', message = 'Activity already booked'; end if;
  insert into public.activity_bookings (activity_id, guest_id, guests, amount) values (requested_activity_id, guest_id_value, requested_guests, activity_row.price_value * requested_guests) returning * into booking_row;
  return booking_row;
end;
$$;
