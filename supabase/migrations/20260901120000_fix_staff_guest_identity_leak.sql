-- Phase 6 security audit caught a second, more systemic leak: every signup
-- (handle_new_user()) creates BOTH a profiles row and a guests row,
-- unconditionally -- including for staff. A staff member therefore still
-- has a dormant guests.hotel_id from whichever hotel they originally
-- signed up at (or were backfilled to in the Phase 1 migration), and
-- current_guest_hotel_id() doesn't know to ignore it for them. Since that
-- function backs the guest-facing half of nearly every catalog RLS policy
-- (activities/events/promotions/destinations/dining_venues/room_types/
-- concierge_faqs/photo_overrides), a staff member reassigned to hotel B
-- could still read hotel A's PUBLISHED content through their old dormant
-- guest identity -- confirmed live: a manager reassigned to Fort Young
-- could still read all 12 of Ocean Oasis's activities.
--
-- Fix at the one shared source rather than patching every policy: a user
-- with a staff role should never be treated via their guest identity for
-- RLS purposes at all.
create or replace function public.current_guest_hotel_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select case
    when exists (select 1 from public.profiles where id = auth.uid() and role is not null) then null
    else coalesce(
      (select hotel_id from public.guests where auth_user_id = auth.uid()),
      case when (select count(*) from public.hotels) = 1 then (select id from public.hotels limit 1) end
    )
  end;
$$;
