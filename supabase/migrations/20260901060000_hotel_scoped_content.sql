-- Phase 3 of the multi-hotel platform pivot: moves destinations, dining
-- venues (+ menus), room types, and the concierge FAQ out of the single
-- client-bundled mockData.js (the same "no DB row at all" gap the Photo
-- Library feature had to work around for destinations/dining) into real
-- hotel-scoped tables, following the exact pattern already used for
-- activities/events/promotions.

create table public.destinations (
  id text primary key,
  hotel_id uuid not null references public.hotels(id),
  title text not null,
  category text,
  description text,
  distance text,
  travel_time text,
  difficulty text,
  duration text,
  icon text,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.dining_venues (
  id text primary key,
  hotel_id uuid not null references public.hotels(id),
  name text not null,
  type text,
  description text,
  hours text,
  dress_code text,
  location text,
  reservation_required boolean not null default false,
  icon text,
  image_url text,
  menu jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.room_types (
  id text primary key,
  hotel_id uuid not null references public.hotels(id),
  name text not null,
  tier integer not null default 1,
  description text,
  bed_config text,
  max_occupancy integer not null default 2,
  amenities jsonb not null default '[]'::jsonb,
  from_price_per_night numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.concierge_faqs (
  id text primary key,
  hotel_id uuid not null references public.hotels(id),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.destinations enable row level security;
alter table public.dining_venues enable row level security;
alter table public.room_types enable row level security;
alter table public.concierge_faqs enable row level security;

-- Same read/write shape as activities/events/promotions: guests read their
-- own hotel's rows (no PUBLISHED/DRAFT concept here — these are always-on
-- reference content, not schedulable), staff read+write their own hotel's,
-- platform admins see everything.
create policy destinations_read on public.destinations for select using (
  hotel_id = public.current_guest_hotel_id() or (public.is_staff() and hotel_id = public.current_hotel_id()) or public.is_platform_admin()
);
create policy destinations_staff_write on public.destinations for all
using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

create policy dining_venues_read on public.dining_venues for select using (
  hotel_id = public.current_guest_hotel_id() or (public.is_staff() and hotel_id = public.current_hotel_id()) or public.is_platform_admin()
);
create policy dining_venues_staff_write on public.dining_venues for all
using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

create policy room_types_read on public.room_types for select using (
  hotel_id = public.current_guest_hotel_id() or (public.is_staff() and hotel_id = public.current_hotel_id()) or public.is_platform_admin()
);
create policy room_types_staff_write on public.room_types for all
using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

create policy concierge_faqs_read on public.concierge_faqs for select using (
  hotel_id = public.current_guest_hotel_id() or (public.is_staff() and hotel_id = public.current_hotel_id()) or public.is_platform_admin()
);
create policy concierge_faqs_staff_write on public.concierge_faqs for all
using (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()))
with check (public.is_staff() and (hotel_id = public.current_hotel_id() or public.is_platform_admin()));

-- Seed: today's Ocean Oasis content, generated from the live mockData.js
-- arrays (DESTINATIONS, DINING_VENUES + DINING_MENUS, ROOM_TYPES,
-- CONCIERGE_FAQ) so nothing is retyped by hand or drifts from what's live.
do $$
declare v_hotel_id uuid;
begin
  select id into v_hotel_id from public.hotels where slug = 'ocean-oasis-dm';

  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_1', v_hotel_id, 'Champagne Reef', 'Ocean', 'Volcanic bubbles rise through warm, clear water over a reef teeming with sponges, small fish, and the occasional turtle — one of the most distinctive snorkel sites in the Caribbean.', '15 min drive', '15 min', 'Easy', '1.5–2 hrs', 'ocean', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Scotts_Head%2C_Dominica_014.jpg/1280px-Scotts_Head%2C_Dominica_014.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_2', v_hotel_id, 'Boiling Lake', 'Adventure', 'A demanding but unforgettable hike through the Valley of Desolation to the second-largest fumarolic lake in the world, cloaked in rising steam.', '40 min drive + hike', '40 min', 'Challenging', 'Full day', 'volcano', 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Dominica_boiling_lake.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_3', v_hotel_id, 'Trafalgar Falls', 'Nature', 'Twin waterfalls tumbling into a rainforest pool, reachable via a short, well-marked trail through Morne Trois Pitons National Park.', '20 min drive', '20 min', 'Moderate', '1.5 hrs', 'waterfall', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Trafalgar_Falls_at_Morne_Trois_Pitons_National_Park.jpg/1280px-Trafalgar_Falls_at_Morne_Trois_Pitons_National_Park.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_4', v_hotel_id, 'Morne Trois Pitons National Park', 'Nature', 'A UNESCO World Heritage site of volcanic peaks, crater lakes, and dense rainforest, home to much of Dominica''s protected wildlife.', '30 min drive', '30 min', 'Moderate', 'Half day', 'rainforest', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Morne_Trois_Pitons_National_Park%2C_Dominica_-_jungle.jpg/1280px-Morne_Trois_Pitons_National_Park%2C_Dominica_-_jungle.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_5', v_hotel_id, 'Emerald Pool', 'Nature', 'A short rainforest walk leads to a glimmering pool fed by a gentle waterfall — a favourite for a quick, scenic swim.', '25 min drive', '25 min', 'Easy', '1 hr', 'pool', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Emerald_Pool%2C_Dominica.jpg/1280px-Emerald_Pool%2C_Dominica.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_6', v_hotel_id, 'Whale Watching, Roseau', 'Ocean', 'Dominica''s deep coastal waters are home to resident sperm whales year-round, along with dolphins and seasonal migratory species.', '25 min drive', '25 min', 'Easy', '3 hrs', 'whale', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Baleine_Ile_de_la_Dominique.jpg/1280px-Baleine_Ile_de_la_Dominique.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_7', v_hotel_id, 'Old Roseau Market & Waterfront', 'Culture', 'Browse spices, produce, and local crafts in the capital''s historic market, then stroll the Bayfront promenade.', '20 min drive', '20 min', 'Easy', '2 hrs', 'market', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Produce_Market%2C_Roseau%2C_Dominica.jpg/1280px-Produce_Market%2C_Roseau%2C_Dominica.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_8', v_hotel_id, 'Ti Kwen Glo Cho Hot Springs', 'Wellness', 'Warm, mineral-rich pools set in a quiet garden — a gentle way to unwind after a day of hiking.', '35 min drive', '35 min', 'Easy', '1.5 hrs', 'springs', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Dominica%2C_Karibik_-_Laudat_-_Wotten_Waven_%E2%80%93_Fond_Cani_-_panoramio.jpg/1280px-Dominica%2C_Karibik_-_Laudat_-_Wotten_Waven_%E2%80%93_Fond_Cani_-_panoramio.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_9', v_hotel_id, 'Canyoning at Titou Gorge', 'Adventure', 'Swim, scramble, and float through a narrow volcanic gorge with cool water and dramatic rock walls.', '35 min drive', '35 min', 'Challenging', '3 hrs', 'gorge', 'https://justgodominica.com/wp-content/uploads/2020/01/Titou-Gorge_dominica-005-400x284.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_10', v_hotel_id, 'Cabrits National Park & Fort Shirley', 'Culture', 'An 18th-century British garrison restored on a forested peninsula overlooking Prince Rupert Bay, with sweeping coastal views and Dominica''s richest colonial history.', '45 min drive', '45 min', 'Easy', '2 hrs', 'market', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Fort_Shirley%2C_Dominica%2C_2026.jpg/1280px-Fort_Shirley%2C_Dominica%2C_2026.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_11', v_hotel_id, 'Indian River, Portsmouth', 'Nature', 'A quiet, guide-paddled river through a mangrove swamp draped in buttress roots — one of Dominica''s most photographed spots, and a filming location for Pirates of the Caribbean.', '45 min drive', '45 min', 'Easy', '1.5 hrs', 'rainforest', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Indian_River_in_Portsmouth%2C_Dominica.jpg/1280px-Indian_River_in_Portsmouth%2C_Dominica.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_12', v_hotel_id, 'Middleham Falls', 'Nature', 'A demanding rainforest hike rewarded by Dominica''s tallest waterfall, plunging over 200 feet into a cool jungle pool.', '35 min drive + hike', '35 min', 'Challenging', '3 hrs', 'waterfall', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Middleham_Falls_at_Morne_Trois_Pitons_National_Park.jpg/1280px-Middleham_Falls_at_Morne_Trois_Pitons_National_Park.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_13', v_hotel_id, 'Freshwater Lake', 'Nature', 'The highest lake in the Lesser Antilles, ringed by cloud forest inside Morne Trois Pitons National Park — a peaceful spot for a rim walk with mountain views.', '35 min drive', '35 min', 'Moderate', '1.5 hrs', 'pool', 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Freshwater_Lake%2C_Dominica.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_14', v_hotel_id, 'Kalinago Territory', 'Culture', 'Home to the descendants of the Kalinago (Carib) people, the last pre-Columbian community in the Caribbean — visit the cultural village to see traditional canoe-building, basket weaving, and craft.', '1 hr drive', '1 hr', 'Easy', 'Half day', 'culture', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Carib_Territory_%28Dominica%29.jpg/1280px-Carib_Territory_%28Dominica%29.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_15', v_hotel_id, 'Syndicate Nature Trail & Parrot Reserve', 'Nature', 'A gentle loop through the Northern Forest Reserve below Morne Diablotin, Dominica''s tallest peak — the best place on the island to spot both the Jaco and the rare, endemic Sisserou Parrot in the wild.', '50 min drive', '50 min', 'Easy', '1.5 hrs', 'nature', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Amazona_imperialis_-Roseau_-Dominica_-aviary-6a.jpg/1280px-Amazona_imperialis_-Roseau_-Dominica_-aviary-6a.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_16', v_hotel_id, 'Mero Beach', 'Beaches', 'One of Dominica''s few sandy beaches, a stretch of fine black volcanic sand on the calm Caribbean coast lined with beach bars — the island''s favourite spot for a swim, a rum punch, and an easy afternoon in the sun.', '30 min drive', '30 min', 'Easy', '2 hrs', 'ocean', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/MERO_BEACH%2C_DOMINICA.jpg/1280px-MERO_BEACH%2C_DOMINICA.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_17', v_hotel_id, 'Soufriere Village & Sulphur Springs', 'Culture', 'A quiet fishing village on the edge of the Soufriere-Scotts Head Marine Reserve, where volcanic vents warm the bay itself and a scatter of sulphur spring bathing spots sit just above the water — a slower, more local counterpart to Wotten Waven.', '20 min drive', '20 min', 'Easy', '2 hrs', 'culture', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Soufri%C3%A8re_Bay%2C_Dominica_008.JPG/1280px-Soufri%C3%A8re_Bay%2C_Dominica_008.JPG') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_18', v_hotel_id, 'Bush Rum Tasting', 'Food', 'Dominica''s homegrown tradition of rum infused with local herbs, spices, and fruit — from fiery ''strongback'' blends to fruitier sips — poured at rustic bush bars and rum shacks across the island.', '20 min drive', '20 min', 'Easy', '1.5 hrs', 'wine', 'https://cdn.discoverdominica.com/production/20200218085528-dsc-23064.jpeg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_19', v_hotel_id, 'Scotts Head (Cachacrou)', 'Ocean', 'A dramatic sand spit at Dominica''s southernmost point, where the calm Caribbean Sea meets the churning Atlantic Ocean — climb to the old French fort ruins for one of the island''s best viewpoints.', '25 min drive', '25 min', 'Easy', '1.5 hrs', 'ocean', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Scotts_Head_Dominica_1.jpg/1280px-Scotts_Head_Dominica_1.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_20', v_hotel_id, 'Boeri Lake', 'Nature', 'The highest lake in Dominica, an almost perfectly round volcanic crater lake ringed by cloud forest, reached by a well-marked trail from Freshwater Lake — quieter and less-visited than its famous neighbour.', '35 min drive + hike', '35 min', 'Moderate', '2.5 hrs', 'pool', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Boeri_Lake.jpg/1280px-Boeri_Lake.jpg') on conflict (id) do nothing;
  insert into public.destinations (id, hotel_id, title, category, description, distance, travel_time, difficulty, duration, icon, image_url) values ('d_21', v_hotel_id, 'Wavine Cyrique', 'Adventure', 'A remote waterfall that drops straight onto a black-sand beach where the rainforest meets the Atlantic — reached via a thrilling, rope-and-root scramble down an old fishermen''s trail, strictly for experienced, guided hikers.', '50 min drive + hike', '50 min', 'Challenging', '2 hrs', 'waterfall', 'https://i0.wp.com/www.rosalieforest.com/wp-content/uploads/2015/05/wavine-cyrique-21.jpg?w=1872') on conflict (id) do nothing;

  insert into public.dining_venues (id, hotel_id, name, type, description, hours, dress_code, location, reservation_required, icon, image_url, menu) values ('v_1', v_hotel_id, 'Tide & Table', 'Signature Restaurant', 'Seasonal Caribbean dishes crafted from local market and dock-fresh ingredients, with sunset-facing water views.', 'Dinner · 6:00 PM – 10:00 PM', 'Smart casual', 'Main Building, Level 3', true, 'finedining', 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-01-69028ae57d28a.jpg', '[{"title":"Starters","items":[{"name":"Callaloo Soup","price":"$9","description":"Dasheen leaves, coconut milk, local herbs."},{"name":"Christophene Fritters","price":"$11","description":"Chayote squash, saltfish, scotch bonnet aioli."},{"name":"Dock-Caught Ceviche","price":"$14","description":"Chef''s daily catch, lime, red onion, plantain crisps."}]},{"title":"Mains","items":[{"name":"Grilled Mahi Mahi","price":"$32","description":"Coconut rice, callaloo, tamarind glaze."},{"name":"Braised Oxtail","price":"$29","description":"Slow-cooked, butter beans, provision mash."},{"name":"Roasted Vegetable Curry","price":"$24","description":"Seasonal market vegetables, coconut curry, roti."}]},{"title":"Desserts","items":[{"name":"Coconut Tart","price":"$8","description":"Toasted coconut, passionfruit coulis."},{"name":"Rum Cake","price":"$8","description":"Dominican rum, spiced butter sauce."}]}]'::jsonb) on conflict (id) do nothing;
  insert into public.dining_venues (id, hotel_id, name, type, description, hours, dress_code, location, reservation_required, icon, image_url, menu) values ('v_2', v_hotel_id, 'Oasis Terrace', 'All-Day Dining', 'Open-air terrace serving breakfast, lunch, and casual dinner favourites.', 'Breakfast 7–10:30 AM · Lunch 12–3 PM · Dinner 6–9:30 PM', 'Resort casual', 'Ground Floor, Garden Wing', false, 'terrace', 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-02-69028ae71481e.jpg', '[{"title":"Breakfast","items":[{"name":"Continental Spread","price":"Included","description":"Pastries, tropical fruit, yogurt, cereals."},{"name":"Bakes & Saltfish","price":"$12","description":"Traditional fried bakes with saltfish souse."}]},{"title":"Lunch & Dinner","items":[{"name":"Grilled Chicken Sandwich","price":"$14","description":"House pepper sauce, provision chips."},{"name":"Terrace Salad","price":"$13","description":"Local greens, avocado, citrus vinaigrette."},{"name":"Wood-Fired Flatbread","price":"$16","description":"Chef''s daily topping selection."}]}]'::jsonb) on conflict (id) do nothing;
  insert into public.dining_venues (id, hotel_id, name, type, description, hours, dress_code, location, reservation_required, icon, image_url, menu) values ('v_3', v_hotel_id, 'Horizon Bar', 'Bar & Lounge', 'Handcrafted cocktails and light bites overlooking the infinity pool.', '11:00 AM – Midnight', 'Resort casual', 'Pool Deck', false, 'bar', 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-03-69028ae892712.jpg', '[{"title":"Signature Cocktails","items":[{"name":"Sunset Special","price":"$12","description":"Rum, passionfruit, lime, ginger beer."},{"name":"Dominica Sour","price":"$13","description":"Local rum, bitters, egg white."}]},{"title":"Light Bites","items":[{"name":"Plantain Chips & Dip","price":"$8","description":"House pepper aioli."},{"name":"Coconut Shrimp","price":"$15","description":"Sweet chili glaze."}]}]'::jsonb) on conflict (id) do nothing;
  insert into public.dining_venues (id, hotel_id, name, type, description, hours, dress_code, location, reservation_required, icon, image_url, menu) values ('v_4', v_hotel_id, 'In-Room Dining', 'Room Service', 'Full menu delivered to your room, available around the clock.', '24 hours', 'N/A', 'Delivered to your room', false, 'roomservice', 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-04-69028ae9e7bce.jpg', '[{"title":"Available 24 Hours","items":[{"name":"Club Sandwich","price":"$16","description":"Triple-decker, hand-cut fries."},{"name":"Caribbean Fruit Plate","price":"$10","description":"Chef''s seasonal selection."},{"name":"Late-Night Pasta","price":"$18","description":"Garlic, chili, herb oil."}]}]'::jsonb) on conflict (id) do nothing;

  insert into public.room_types (id, hotel_id, name, tier, description, bed_config, max_occupancy, amenities, from_price_per_night) values ('garden_view_room', v_hotel_id, 'Garden View Room', 1, 'A calm, design-forward retreat overlooking Ocean Oasis''s tropical gardens — the same thoughtful in-room amenities as every category, in our most intimate footprint.', '1 King or 2 Queen Beds', 2, '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi"]'::jsonb, 245) on conflict (id) do nothing;
  insert into public.room_types (id, hotel_id, name, tier, description, bed_config, max_occupancy, amenities, from_price_per_night) values ('ocean_view_room', v_hotel_id, 'Ocean View Room', 2, 'Wake up to sunset-facing Caribbean water views. Same chic, design-forward styling as our Garden View rooms, with the sea as your backdrop.', '1 King or 2 Queen Beds', 2, '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi","Ocean view","Rain shower"]'::jsonb, 305) on conflict (id) do nothing;
  insert into public.room_types (id, hotel_id, name, tier, description, bed_config, max_occupancy, amenities, from_price_per_night) values ('ocean_view_suite', v_hotel_id, 'Ocean View Suite', 3, 'A separate living area and an expanded balcony built for lingering over sunset, with panoramic water views throughout.', '1 King Bed + Sofa Bed', 3, '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi","Ocean view","Rain shower","Mini bar","Separate living area"]'::jsonb, 385) on conflict (id) do nothing;
  insert into public.room_types (id, hotel_id, name, tier, description, bed_config, max_occupancy, amenities, from_price_per_night) values ('family_suite', v_hotel_id, 'Family Suite', 4, 'Two connected sleeping areas and extra room to spread out — built for families or groups travelling together without giving up the water views.', '1 King Bed + 2 Twin Beds', 4, '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi","Ocean view","Rain shower","Mini bar","Two sleeping areas","Extra bedding on request"]'::jsonb, 425) on conflict (id) do nothing;
  insert into public.room_types (id, hotel_id, name, tier, description, bed_config, max_occupancy, amenities, from_price_per_night) values ('presidential_suite', v_hotel_id, 'Presidential Suite', 5, 'Ocean Oasis''s top-floor signature suite — the most expansive layout on the property, with sweeping sunset views and elevated in-room service.', '1 King Bed + Sofa Bed', 4, '["Furnished balcony","Bathrobe & slippers","Pod coffee maker","In-room dining","Air conditioning","Free Wi-Fi","Ocean view","Rain shower","Premium mini bar","Separate living area","Private plunge pool access","Priority concierge service"]'::jsonb, 620) on conflict (id) do nothing;

  insert into public.concierge_faqs (id, hotel_id, question, answer, sort_order) values ('faq_1', v_hotel_id, 'What activities are available today?', 'Today we have Champagne Reef Snorkeling at 11:00 AM and Rainforest Canopy Trek at 9:00 AM. You can view and reserve both under Explore → Activities.', 0) on conflict (id) do nothing;
  insert into public.concierge_faqs (id, hotel_id, question, answer, sort_order) values ('faq_2', v_hotel_id, 'What should I do in Dominica?', 'Popular experiences include Champagne Reef, Trafalgar Falls, Boiling Lake, and whale watching from Roseau. Check the Explore tab for full details on each.', 1) on conflict (id) do nothing;
  insert into public.concierge_faqs (id, hotel_id, question, answer, sort_order) values ('faq_3', v_hotel_id, 'Where can I eat?', 'Ocean Oasis has four dining venues: Horizon (fine dining), Oasis Terrace (all-day dining), Horizon Bar, and 24-hour In-Room Dining. You can view menus and hours under Dining.', 2) on conflict (id) do nothing;
  insert into public.concierge_faqs (id, hotel_id, question, answer, sort_order) values ('faq_4', v_hotel_id, 'What time is breakfast?', 'Breakfast is served from 7:00–10:30 AM at Oasis Terrace.', 3) on conflict (id) do nothing;
  insert into public.concierge_faqs (id, hotel_id, question, answer, sort_order) values ('faq_5', v_hotel_id, 'What events are happening tonight?', 'Tonight we have Sunset Cocktails at 5:30 PM and Live Music at 7:30 PM, both on the Main Terrace.', 4) on conflict (id) do nothing;
  insert into public.concierge_faqs (id, hotel_id, question, answer, sort_order) values ('faq_6', v_hotel_id, 'I need something for my room.', 'I can help with that — head to Requests → New Request to submit a housekeeping, towel, or maintenance request, and our team will be notified right away.', 5) on conflict (id) do nothing;
  insert into public.concierge_faqs (id, hotel_id, question, answer, sort_order) values ('faq_7', v_hotel_id, 'How do I get to the airport?', 'Airport transfers can be arranged through Contact Reception or by submitting a Transportation request. Please give us at least 3 hours'' notice.', 6) on conflict (id) do nothing;
end $$;
