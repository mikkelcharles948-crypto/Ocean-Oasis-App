-- Real water excursions offered by Ocean Oasis (whale watching, diving,
-- snorkeling, sunset cruises), sourced from the hotel's own website
-- (oceanoasisdominica.com/dive). Mirrors the ids/content added to
-- src/data/mockData.js's ACTIVITIES array and src/i18n/content/activities.js.
insert into public.activities (
  id, name, category, short_description, description, activity_date, activity_time,
  duration, price_value, price, capacity, availability, location, meeting_point,
  what_to_bring, cancellation_policy, image, image_url, status
) values
  (
    'a_9', 'Sperm Whale Watching Tour', 'Ocean',
    'A 3-hour boat trip in search of Dominica''s resident sperm whales.',
    'Dominica is known as the Whale Watching Capital of the Caribbean — sperm whales live in these waters year-round, with seasonal humpback whales and dolphins as well. Departs from Ocean Oasis''s private pier; private charters available on request.',
    '2026-08-18', '9:00 AM', '3 hrs', 100, '$100 per person', 12, 'Available',
    'Ocean Oasis Private Pier', 'Ocean Oasis Private Pier',
    '["Sunscreen","Hat","Motion sickness remedy if needed","Camera"]'::jsonb,
    'Free cancellation up to 48 hours before the activity.', 'whale',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Baleine_Ile_de_la_Dominique.jpg', 'PUBLISHED'
  ),
  (
    'a_10', 'Two-Tank Boat Dive', 'Ocean',
    'Guided boat dive through Dominica''s reefs, walls, and volcanic vents with the Ocean Oasis Dive Shop.',
    'Two guided tanks with the Ocean Oasis Dive Shop — from calm, shallow reefs where seahorses shelter among the coral to deeper walls with larger marine life. Full gear rental available. Introductory experiences offered for non-certified divers.',
    '2026-08-17', '8:00 AM', '4 hrs', 120, '$120 per person', 10, 'Available',
    'Ocean Oasis Dive Shop', 'Ocean Oasis Dive Shop',
    '["Swimsuit","Certification card (if certified)","Towel"]'::jsonb,
    'Free cancellation up to 48 hours before the activity.', 'ocean', null, 'PUBLISHED'
  ),
  (
    'a_11', 'Guided Snorkeling Tour', 'Ocean',
    'A 2-hour guided snorkel from Ocean Oasis''s private pier.',
    'A relaxed, guided snorkeling tour departing directly from the hotel''s private pier — an easy way to see Dominica''s reef life without a long boat ride. Suitable for beginners.',
    '2026-08-16', '10:00 AM', '2 hrs', 100, '$100 per person', 12, 'Available',
    'Ocean Oasis Private Pier', 'Ocean Oasis Private Pier',
    '["Swimsuit","Reef-safe sunscreen","Towel"]'::jsonb,
    'Free cancellation up to 48 hours before the activity.', 'ocean', null, 'PUBLISHED'
  ),
  (
    'a_12', 'Private Sunset Cruise', 'Ocean',
    'A private, romantic cruise along Dominica''s coastline at sunset.',
    'A private charter along the coast as the sun goes down — ideal for anniversaries, proposals, or simply watching the Caribbean sky change color from the water. Pricing depends on party size and duration; contact the concierge to arrange.',
    '2026-08-20', '5:30 PM', '2 hrs', 0, 'Contact concierge for pricing', 8, 'Available',
    'Ocean Oasis Private Pier', 'Ocean Oasis Private Pier',
    '["Light jacket for the evening breeze","Camera"]'::jsonb,
    'Free cancellation up to 48 hours before the activity.', 'ocean', null, 'PUBLISHED'
  )
on conflict (id) do nothing;
