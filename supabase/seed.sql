insert into public.rooms (id, number, type, floor, bed_config, max_occupancy, status)
select 'room_' || room_number, room_number::text, case when room_number::integer % 3 = 0 then 'Ocean View Suite' else 'Garden View Room' end, ((room_number::integer - 1) / 10) + 1, '1 King Bed', 3, 'VACANT_CLEAN'
from generate_series(101, 137) as room_number
on conflict (id) do nothing;

insert into public.activities (id, name, category, short_description, description, activity_date, activity_time, duration, price_value, price, capacity, availability, location, meeting_point, status)
values
  ('a_seed_snorkel', 'Champagne Reef Snorkeling', 'Ocean', 'Guided snorkel over volcanic bubble vents and coral.', 'Guided snorkeling at Champagne Reef with equipment included.', '2026-08-15', '11:00 AM', '1.5 hrs', 65, '$65 per person', 20, 'Available', 'Champagne Beach', 'Ocean Oasis Beach Desk', 'PUBLISHED'),
  ('a_seed_yoga', 'Sunrise Yoga on the Beach', 'Wellness', 'Gentle flow yoga facing the water.', 'A guided sunrise flow on the beach for all levels.', '2026-08-16', '6:30 AM', '1 hr', 0, 'Complimentary', 15, 'Available', 'Main Beach', 'Beach Yoga Deck', 'PUBLISHED')
on conflict (id) do nothing;

insert into public.events (id, title, category, event_date, event_time, location, description, icon, capacity, status)
values
  ('e_seed_breakfast', 'Breakfast', 'Dining', '2026-08-15', '9:00 AM', 'Oasis Terrace', 'Caribbean and continental breakfast.', 'coffee', 80, 'PUBLISHED'),
  ('e_seed_music', 'Live Music', 'Entertainment', '2026-08-15', '7:30 PM', 'Main Terrace', 'Local musicians performing island rhythms.', 'music', 80, 'PUBLISHED')
on conflict (id) do nothing;

insert into public.promotions (id, title, description, validity, terms, status, target_audience)
values
  ('p_seed_sunset', 'Sunset Special', '20% off selected cocktails from 5-7 PM.', 'Valid through August 31, 2026', 'Selected cocktails only.', 'PUBLISHED', 'All guests')
on conflict (id) do nothing;
