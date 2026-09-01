-- Fixes a real regression from the multi-tenant RLS rewrite: a brand-new
-- guest has guests.hotel_id = null until their first reservation (by
-- design -- "hotel identified after login/check-in"), but every guest-
-- facing catalog read (activities/events/promotions/destinations/
-- dining_venues/room_types/concierge_faqs/photo_overrides) is scoped
-- through current_guest_hotel_id(). Before this, a fresh signup with no
-- reservation yet saw an empty Explore/Dining/Activities tab, when
-- previously (pre-multi-tenant) any authenticated guest saw everything.
--
-- Same fallback already used in search_available_rooms/create_reservation:
-- while there's only one hotel on the platform, resolve to it. Once a
-- second hotel exists, this stops guessing and a guest genuinely needs a
-- real reservation (or Phase 4's hotel-selection UX) to see any catalog.
create or replace function public.current_guest_hotel_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select hotel_id from public.guests where auth_user_id = auth.uid()),
    case when (select count(*) from public.hotels) = 1 then (select id from public.hotels limit 1) end
  );
$$;
