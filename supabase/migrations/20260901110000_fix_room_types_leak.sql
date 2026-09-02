-- Phase 6 security audit caught this live: room_types_browse_active (added
-- in Phase 4 so a guest picking a hotel to book at could see that hotel's
-- room types before having any other relationship to it) is a blanket RLS
-- policy -- Postgres RLS policies are OR'd together, so it didn't just
-- enable the hotel-picker flow, it also widened every OTHER "give me my
-- own hotel's room types" read (loadGuestData/loadStaffData's plain
-- `select('*')`, relying on RLS to narrow it) into "give me every active
-- hotel's room types". Confirmed live: a guest scoped to Fort Young could
-- read all 5 Ocean Oasis room types back through the ordinary context load.
--
-- Fix: drop the blanket policy, and give the one legitimate exception (a
-- guest browsing hotels before booking) its own narrow, purpose-built
-- SECURITY DEFINER RPC instead -- it doesn't touch the general RLS ceiling
-- for room_types at all, so it can't leak into any other read path again.
drop policy room_types_browse_active on public.room_types;

create or replace function public.browse_room_types(p_hotel_id uuid)
returns setof public.room_types
language sql stable security definer set search_path = public
as $$
  select rt.* from public.room_types rt
  join public.hotels h on h.id = rt.hotel_id
  where rt.hotel_id = p_hotel_id and h.status = 'ACTIVE';
$$;

revoke all on function public.browse_room_types(uuid) from public;
grant execute on function public.browse_room_types(uuid) to authenticated;
