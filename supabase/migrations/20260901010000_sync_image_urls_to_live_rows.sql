-- The image-reliability fixes from 20260830-ish only ever touched the local
-- mockData.js seed constants, which are just the app's pre-fetch placeholder
-- state -- they get fully overwritten the moment refreshGuestData/
-- refreshStaffData load the real rows from these tables. So every event,
-- most activities, and one promotion were still serving the old broken
-- image_url values (null, or the pre-migration Special:FilePath form) in
-- production. This syncs the live rows to the same values already verified
-- and shipped in mockData.js.

update public.events set image_url = 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanoasishotel-01-homepage-04-experienceoceanoasis-02-dining-686c334f5627b.jpg' where id = 'e_1';
update public.events set image_url = 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanoasishotel-01-homepage-04-experienceoceanoasis-04-nature-686c33b7a3f8d.jpg' where id = 'e_2';
update public.events set image_url = 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-03-69028ae892712.jpg' where id = 'e_3';
update public.events set image_url = 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanoasishotel-01-homepage-04-experienceoceanoasis-03-privateevents-686c3389cc3d8.jpg' where id = 'e_4';
update public.events set image_url = 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanoasishotel-01-homepage-04-experienceoceanoasis-04-nature-686c33b7a3f8d.jpg' where id = 'e_5';
update public.events set image_url = 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanoasishotel-01-homepage-04-experienceoceanoasis-04-nature-686c33b7a3f8d.jpg' where id = 'e_6';
update public.events set image_url = 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanoasishotel-01-homepage-04-experienceoceanoasis-03-privateevents-686c3389cc3d8.jpg' where id = 'e_7';
update public.events set image_url = 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanoasishotel-01-homepage-04-experienceoceanoasis-02-dining-686c334f5627b.jpg' where id = 'e_8';
update public.events set image_url = 'https://discoverdominica.com/wp-content/uploads/2026/06/Comess.jpg' where id = 'e_9';
update public.events set image_url = 'https://discoverdominica.com/wp-content/uploads/2026/06/Health-And-Wellness-2026-Main-Flyer-alt-Massage-Version-1.jpg' where id = 'e_10';
update public.events set image_url = 'https://discoverdominica.com/wp-content/uploads/2026/07/Goute-Domniik4_5-Medium.jpeg' where id = 'e_11';
update public.events set image_url = 'https://discoverdominica.com/wp-content/uploads/2026/06/Dominica-Bike-Fest-2026.jpg' where id = 'e_12';
update public.events set image_url = 'https://discoverdominica.com/wp-content/uploads/2026/06/Dive-Fest.jpeg' where id = 'e_13';
update public.events set image_url = 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Le_World_Creole_Music_Festival.jpg' where id = 'e_15';
update public.events set image_url = 'https://discoverdominica.com/wp-content/uploads/2026/06/WATO-2026.jpeg' where id = 'e_16';
update public.events set image_url = 'https://discoverdominica.com/wp-content/uploads/2026/06/Dominica-Carnival-2027.jpg' where id = 'e_17';

update public.activities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Scotts_Head%2C_Dominica_014.jpg/1280px-Scotts_Head%2C_Dominica_014.jpg' where id = 'a_1';
update public.activities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Rainforest_%28Dominica%29.jpg/1280px-Rainforest_%28Dominica%29.jpg' where id = 'a_2';
update public.activities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sailing_Catamaran_at_sunset.jpg/1280px-Sailing_Catamaran_at_sunset.jpg' where id = 'a_3';
update public.activities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Yoga_At_Dawn_on_Bondi_Beach.jpg/1280px-Yoga_At_Dawn_on_Bondi_Beach.jpg' where id = 'a_4';
update public.activities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Chef_prepares_fresh_ingredients_by_chopping_red_vegetables.jpg/1280px-Chef_prepares_fresh_ingredients_by_chopping_red_vegetables.jpg' where id = 'a_5';
update public.activities set image_url = 'https://justgodominica.com/wp-content/uploads/2020/01/Titou-Gorge_dominica-005-400x284.jpg' where id = 'a_6';
update public.activities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Indian_River_in_Portsmouth%2C_Dominica.jpg/1280px-Indian_River_in_Portsmouth%2C_Dominica.jpg' where id = 'a_7';
update public.activities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Carib_Territory_%28Dominica%29.jpg/1280px-Carib_Territory_%28Dominica%29.jpg' where id = 'a_8';
update public.activities set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Baleine_Ile_de_la_Dominique.jpg/1280px-Baleine_Ile_de_la_Dominique.jpg' where id = 'a_9';

update public.promotions set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Rainforest_%28Dominica%29.jpg/1280px-Rainforest_%28Dominica%29.jpg' where id = 'p_3';
