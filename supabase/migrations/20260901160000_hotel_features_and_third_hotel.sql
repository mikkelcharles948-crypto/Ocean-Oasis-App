-- Per-hotel feature flags -- "do not assume every hotel offers every
-- service." Defaults to everything on, so existing hotels (Ocean Oasis,
-- Fort Young) see zero behavior change unless explicitly turned off below.
alter table public.hotels add column features jsonb not null default
  '{"dining": true, "activities": true, "concierge": true, "spa": false, "events": true, "promotions": true}'::jsonb;

-- Ocean Oasis: full-service tropical resort, everything on.
update public.hotels set features = '{"dining": true, "activities": true, "concierge": true, "spa": true, "events": true, "promotions": true}'::jsonb
where slug = 'ocean-oasis-dm';

-- Fort Young: heritage waterfront hotel with a dive center, no spa/events yet.
update public.hotels set features = '{"dining": true, "activities": true, "concierge": true, "spa": false, "events": false, "promotions": true}'::jsonb
where slug = 'fort-young-dm';

-- Test hotel #3: a modern, minimalist business hotel -- deliberately the
-- opposite archetype from Ocean Oasis's tropical resort and Fort Young's
-- historic waterfront property, to prove the theme/content architecture
-- supports genuinely different personalities, not just palette swaps.
-- Fictional (no real property of this name exists) -- a pure architecture
-- test, not a customer.
do $$
declare v_hotel_id uuid;
begin
  insert into public.hotels (slug, name, legal_name, address, phone, email, timezone, currency, status, plan, mrr, code, theme, features)
  values (
    'meridian-bay-dm', 'Meridian Bay Hotel', 'Meridian Bay Hotel & Business Centre',
    'Bayfront Street, Roseau, Commonwealth of Dominica', '+1 767-440-2100',
    'stay@meridianbay.test', 'America/Dominica', 'USD', 'ACTIVE', 'starter', 249, 'MB',
    '{"colors": {"deepOcean": "#1C2B3A", "turquoise": "#3D7BD9", "turquoiseDark": "#2C5FB0"}}'::jsonb,
    '{"dining": true, "activities": false, "concierge": true, "spa": false, "events": false, "promotions": false}'::jsonb
  )
  returning id into v_hotel_id;

  insert into public.room_types (id, hotel_id, name, tier, description, bed_config, max_occupancy, amenities, from_price_per_night) values
    ('mb_standard', v_hotel_id, 'Standard King', 1, 'A clean, efficient room built for business travel — fast Wi-Fi and a proper desk, nothing you don''t need.', '1 King Bed', 2, '["Work desk","High-speed Wi-Fi","Air conditioning","Coffee maker","Blackout curtains"]'::jsonb, 165),
    ('mb_executive', v_hotel_id, 'Executive Room', 2, 'Extra desk space and a lounge chair, for longer stays.', '1 King Bed', 2, '["Work desk","High-speed Wi-Fi","Air conditioning","Coffee maker","Blackout curtains","Lounge chair","Bay view"]'::jsonb, 210),
    ('mb_suite', v_hotel_id, 'Bayfront Suite', 3, 'A separate meeting/lounge area with a harbor view, for extended business stays.', '1 King Bed + Sofa', 3, '["Work desk","High-speed Wi-Fi","Air conditioning","Coffee maker","Blackout curtains","Separate lounge area","Bay view","Meeting table"]'::jsonb, 295);

  insert into public.rooms (id, hotel_id, number, type, floor, bed_config, max_occupancy, amenities, status) values
    ('mb_501', v_hotel_id, '501', 'Standard King', 5, '1 King Bed', 2, '["Work desk","High-speed Wi-Fi","Air conditioning","Coffee maker","Blackout curtains"]'::jsonb, 'VACANT_CLEAN'),
    ('mb_502', v_hotel_id, '502', 'Standard King', 5, '1 King Bed', 2, '["Work desk","High-speed Wi-Fi","Air conditioning","Coffee maker","Blackout curtains"]'::jsonb, 'VACANT_CLEAN'),
    ('mb_601', v_hotel_id, '601', 'Executive Room', 6, '1 King Bed', 2, '["Work desk","High-speed Wi-Fi","Air conditioning","Coffee maker","Blackout curtains","Lounge chair","Bay view"]'::jsonb, 'OCCUPIED_CLEAN'),
    ('mb_701', v_hotel_id, '701', 'Bayfront Suite', 7, '1 King Bed + Sofa', 3, '["Work desk","High-speed Wi-Fi","Air conditioning","Coffee maker","Blackout curtains","Separate lounge area","Bay view","Meeting table"]'::jsonb, 'VACANT_CLEAN');

  insert into public.dining_venues (id, hotel_id, name, type, description, hours, dress_code, location, reservation_required, icon, image_url, menu) values
    ('mb_v1', v_hotel_id, 'The Exchange', 'All-Day Dining', 'Efficient, well-executed breakfast and lunch service built around a working schedule.', 'Breakfast 6–10 AM · Lunch 11:30 AM–2:30 PM', 'Business casual', 'Ground Floor', false, 'terrace',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
      '[{"title":"Breakfast","items":[{"name":"Express Continental","price":"$14","description":"Ready in under 10 minutes."},{"name":"Full Breakfast","price":"$19","description":"Eggs, toast, seasonal fruit."}]},{"title":"Lunch","items":[{"name":"Working Lunch Box","price":"$18","description":"Sandwich, salad, packed to go."},{"name":"Grilled Catch of the Day","price":"$26","description":"Market fish, seasonal vegetables."}]}]'::jsonb),
    ('mb_v2', v_hotel_id, 'Bayfront Lounge', 'Bar & Lounge', 'Quiet after-hours lounge with harbor views — built for a debrief, not a party.', '4:00 PM – Midnight', 'Business casual', 'Rooftop', false, 'bar',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200',
      '[{"title":"Drinks","items":[{"name":"House Rum Old Fashioned","price":"$14","description":"Local rum, bitters, orange."},{"name":"Sparkling Water Flight","price":"$8","description":"Three local mineral waters."}]}]'::jsonb);

  insert into public.concierge_faqs (id, hotel_id, question, answer, sort_order) values
    ('mb_faq_1', v_hotel_id, 'Is there a business center?', 'Yes — the Business Centre on the mezzanine level has printing, a meeting room, and high-speed wired connections, available 24 hours.', 0),
    ('mb_faq_2', v_hotel_id, 'What time is checkout?', 'Checkout is 12:00 PM. Late checkout until 3:00 PM is available on request, subject to availability.', 1),
    ('mb_faq_3', v_hotel_id, 'How do I get to the airport?', 'Airport transfers can be arranged through Contact Reception. Please give at least 2 hours'' notice.', 2);
end $$;

-- Fort Young currently has room types/rooms only (from an earlier phase) --
-- no activities/dining/destinations at all, which reads as a broken guest
-- app rather than a smaller one. A few real, verified additions so its
-- Explore/Dining tabs aren't empty.
do $$
declare v_hotel_id uuid;
begin
  select id into v_hotel_id from public.hotels where slug = 'fort-young-dm';

  insert into public.dining_venues (id, hotel_id, name, type, description, hours, dress_code, location, reservation_required, icon, image_url, menu) values
    ('fy_v1', v_hotel_id, 'The Balas Restaurant', 'Signature Restaurant', 'Waterfront dining inside the historic fort walls, serving Creole and international dishes.', 'Breakfast 7–10 AM · Dinner 6–10 PM', 'Smart casual', 'Ground Floor, Fort Walls', true, 'finedining',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
      '[{"title":"Dinner","items":[{"name":"Grilled Mahi Mahi","price":"$34","description":"Local catch, coconut rice, callaloo."},{"name":"Fort Young Creole Platter","price":"$38","description":"Chef''s selection of local specialties."}]}]'::jsonb),
    ('fy_v2', v_hotel_id, 'Warrior Beach Bar', 'Bar & Lounge', 'Beachfront bar built into the old fort ramparts, with sunset views over Roseau Bay.', '11:00 AM – 11:00 PM', 'Resort casual', 'Beachfront', false, 'bar',
      'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=1200',
      '[{"title":"Cocktails","items":[{"name":"Cannon Punch","price":"$13","description":"Dark rum, passionfruit, lime."},{"name":"Fort Sour","price":"$14","description":"Local rum, bitters, egg white."}]}]'::jsonb);

  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values
    ('fy_d1', v_hotel_id, 'Old Roseau Market & Waterfront', 'Culture', 'Browse spices, produce, and local crafts in the capital''s historic market, a short walk from the hotel.', '5 min walk', '5 min', 'Easy', '1.5 hrs', 'market', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Produce_Market%2C_Roseau%2C_Dominica.jpg/1280px-Produce_Market%2C_Roseau%2C_Dominica.jpg'),
    ('fy_d2', v_hotel_id, 'Champagne Reef', 'Ocean', 'Volcanic bubbles rise through warm, clear water over a reef teeming with sponges, small fish, and the occasional turtle.', '15 min drive', '15 min', 'Easy', '1.5–2 hrs', 'ocean', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Scotts_Head%2C_Dominica_014.jpg/1280px-Scotts_Head%2C_Dominica_014.jpg'),
    ('fy_d3', v_hotel_id, 'Trafalgar Falls', 'Nature', 'Twin waterfalls tumbling into a rainforest pool, reachable via a short, well-marked trail.', '20 min drive', '20 min', 'Moderate', '1.5 hrs', 'waterfall', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Trafalgar_Falls_at_Morne_Trois_Pitons_National_Park.jpg/1280px-Trafalgar_Falls_at_Morne_Trois_Pitons_National_Park.jpg');

  insert into public.activities (id, hotel_id, name, category, short_description, description, activity_date, activity_time, duration, price, price_value, availability, location, what_to_bring, meeting_point, cancellation_policy, image_url, status, capacity) values
    ('fy_a1', v_hotel_id, 'Fort Walls Dive Excursion', 'Ocean', 'Guided dive with Fort Young''s own dive center.', 'Two-tank guided dive along Dominica''s volcanic reef walls, run by the hotel''s own dive center.', current_date + 2, '8:00 AM', '4 hrs', '$135 per person', 135, 'Available', 'Fort Young Dive Centre', '["Swimsuit","Certification card (if certified)","Towel"]'::jsonb, 'Fort Young Dive Centre', 'Free cancellation up to 48 hours before the activity.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200', 'PUBLISHED', 10),
    ('fy_a2', v_hotel_id, 'Historic Fort Walking Tour', 'Culture', 'A guided walk through the 1770s fort the hotel is built into.', 'A guided walk through the ramparts and cannon emplacements of the 1770s fort the hotel itself is built into, with a local historian.', current_date + 1, '10:00 AM', '1 hr', 'Complimentary', 0, 'Available', 'Hotel Lobby', '["Comfortable shoes","Camera"]'::jsonb, 'Hotel Lobby', 'No cancellation fee.', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200', 'PUBLISHED', 20);
end $$;
