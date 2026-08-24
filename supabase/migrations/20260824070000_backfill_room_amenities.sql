-- The rooms seeded from the app's local mock data never carried amenities
-- (defaulted to '[]'), so guests saw an empty "Room Amenities" section.
-- Backfill real, tier-appropriate amenities per room type. The base set is
-- confirmed from the hotel's own accommodations page
-- (oceanoasisdominica.com/accommodation-dominica); tier extras follow the
-- app's existing room-type catalog (src/data/mockData.js ROOM_TYPES).
update public.rooms set amenities = case type
  when 'Garden View Room' then '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi"]'::jsonb
  when 'Ocean View Room' then '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi","Ocean view","Rain shower"]'::jsonb
  when 'Ocean View Suite' then '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi","Ocean view","Rain shower","Mini bar","Separate living area"]'::jsonb
  when 'Family Suite' then '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi","Ocean view","Rain shower","Mini bar","Two sleeping areas","Extra bedding on request"]'::jsonb
  when 'Presidential Suite' then '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi","Ocean view","Rain shower","Premium mini bar","Separate living area","Private plunge pool access","Priority concierge service"]'::jsonb
  else '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi"]'::jsonb
end
where amenities = '[]'::jsonb or amenities is null;
