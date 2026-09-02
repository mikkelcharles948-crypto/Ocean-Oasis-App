-- rooms.number was globally unique (not per-hotel) -- a real cross-tenant
-- bug the single-hotel setup never surfaced: two different hotels
-- absolutely can both have a "Room 101". Found while seeding this exact
-- scenario below. Room ids are already globally unique app-generated
-- strings, so this only loosens the numbering constraint, nothing else.
alter table public.rooms drop constraint rooms_number_key;
alter table public.rooms add constraint rooms_hotel_number_key unique (hotel_id, number);

-- The platform's second real hotel, so Phase 4 (hotel selection, staff
-- isolation) has something real to prove itself against. Details verified
-- from fortyounghotel.com / Wikipedia: a 71-room hotel built into the walls
-- of the 1770s Fort Young on the Roseau waterfront, Dominica.
do $$
declare
  v_hotel_id uuid;
begin
  insert into public.hotels (slug, name, legal_name, address, phone, email, timezone, currency, status)
  values (
    'fort-young-dm', 'Fort Young Hotel', 'Fort Young Hotel & Dive Resort',
    'Victoria Street, Roseau, Commonwealth of Dominica', '+1 767-448-5000',
    'info@fortyounghotel.com', 'America/Dominica', 'USD', 'ACTIVE'
  )
  returning id into v_hotel_id;

  insert into public.room_types (id, hotel_id, name, tier, description, bed_config, max_occupancy, amenities, from_price_per_night) values
    ('fy_mountain_view', v_hotel_id, 'Fort Mountain View Room', 1, 'Views across Roseau and the surrounding mountains, furnished with local woodwork and colorful Creole-inspired fabrics.', '1 King or 2 Double Beds', 2, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe"]'::jsonb, 220),
    ('fy_ocean_view', v_hotel_id, 'Fort Ocean View Room', 2, 'Views across the Caribbean Sea from a private balcony — interconnecting rooms available for groups.', '1 King or 2 Double Beds', 2, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view"]'::jsonb, 270),
    ('fy_oceanfront', v_hotel_id, 'Oceanfront Room', 3, 'Endless ocean views from a private balcony, with a spacious living area — well suited to families and groups.', '1 King Bed + Sofa Bed', 3, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view","Spacious living area"]'::jsonb, 330),
    ('fy_junior_suite', v_hotel_id, 'Oceanfront Junior Suite', 4, 'Sunset and sweeping ocean views from a private balcony, with understated Creole elegance throughout.', '1 King Bed', 2, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view","Premium bathroom"]'::jsonb, 390),
    ('fy_oceanfront_suite', v_hotel_id, 'Oceanfront Suite', 5, 'The hotel''s top category — a walk-through dressing room and two bathrooms, one with a whirlpool tub, behind far-reaching Caribbean Sea views.', '1 King Bed', 3, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view","Walk-through dressing room","Whirlpool tub","Two bathrooms"]'::jsonb, 520);

  insert into public.rooms (id, hotel_id, number, type, floor, bed_config, max_occupancy, amenities, status) values
    ('fy_101', v_hotel_id, '101', 'Fort Mountain View Room', 1, '1 King Bed', 2, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe"]'::jsonb, 'VACANT_CLEAN'),
    ('fy_102', v_hotel_id, '102', 'Fort Mountain View Room', 1, '2 Double Beds', 2, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe"]'::jsonb, 'VACANT_CLEAN'),
    ('fy_201', v_hotel_id, '201', 'Fort Ocean View Room', 2, '1 King Bed', 2, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view"]'::jsonb, 'VACANT_CLEAN'),
    ('fy_202', v_hotel_id, '202', 'Fort Ocean View Room', 2, '2 Double Beds', 2, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view"]'::jsonb, 'OCCUPIED_CLEAN'),
    ('fy_301', v_hotel_id, '301', 'Oceanfront Room', 3, '1 King Bed + Sofa Bed', 3, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view","Spacious living area"]'::jsonb, 'VACANT_CLEAN'),
    ('fy_302', v_hotel_id, '302', 'Oceanfront Room', 3, '1 King Bed + Sofa Bed', 3, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view","Spacious living area"]'::jsonb, 'VACANT_DIRTY'),
    ('fy_401', v_hotel_id, '401', 'Oceanfront Junior Suite', 4, '1 King Bed', 2, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view","Premium bathroom"]'::jsonb, 'VACANT_CLEAN'),
    ('fy_501', v_hotel_id, '501', 'Oceanfront Suite', 5, '1 King Bed', 3, '["Private balcony","Air conditioning","Free Wi-Fi","Coffee maker","Safe","Ocean view","Walk-through dressing room","Whirlpool tub","Two bathrooms"]'::jsonb, 'VACANT_CLEAN');
end $$;
