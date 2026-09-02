-- A guest picking which hotel to book a NEW stay at needs to see that
-- hotel's room types/pricing before they have any other relationship to
-- it (no reservation, no guests.hotel_id match yet) -- the existing
-- room_types_read policy only shows a guest their own current hotel's
-- types. Room categories/pricing are already public marketing content on
-- any real hotel's own website, so this mirrors hotels_browse_active.
create policy room_types_browse_active on public.room_types
for select using (
  hotel_id in (select id from public.hotels where status = 'ACTIVE')
);
