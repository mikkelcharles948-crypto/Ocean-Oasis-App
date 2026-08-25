// -----------------------------------------------------------------------
// Ocean Oasis — Mock / Local Data Layer
// Structured so every collection here can later be swapped for real API
// calls (e.g. GET /guests/:id, GET /activities) without changing screens.
// -----------------------------------------------------------------------

export const GUEST = {
  id: 'g_1001',
  firstName: 'Amara',
  lastName: 'Whitfield',
  email: 'amara.whitfield@example.com',
  phone: '+1 767 555 0142',
  loyaltyTier: 'Oasis Circle — Silver',
  avatarInitials: 'AW',
  language: 'English',
  interests: [], // populated during onboarding
};

export const RESERVATION = {
  id: 'r_58213',
  reservationNumber: 'OO-58213',
  guestId: 'g_1001',
  roomId: 'room_204',
  checkIn: '2026-08-15',
  checkOut: '2026-08-19',
  nights: 4,
  adults: 2,
  children: 0,
  status: 'confirmed', // confirmed | checked_in | checked_out
  arrivalTime: '3:30 PM',
  airportTransfer: true,
  specialRequests: 'Ocean-facing room if possible, celebrating anniversary.',
};

export const ROOM = {
  id: 'room_204',
  number: '204',
  type: 'Ocean View Suite',
  floor: 2,
  bedConfig: '1 King Bed',
  maxOccupancy: 3,
  amenities: ['Private balcony', 'Rain shower', 'Mini bar', 'Air conditioning', 'Nespresso machine'],
};

export const DESTINATION_CATEGORIES = ['Nature', 'Ocean', 'Beaches', 'Adventure', 'Culture', 'Food', 'Wellness'];

export const DESTINATIONS = [
  {
    id: 'd_1',
    title: 'Champagne Reef',
    category: 'Ocean',
    description:
      'Volcanic bubbles rise through warm, clear water over a reef teeming with sponges, small fish, and the occasional turtle — one of the most distinctive snorkel sites in the Caribbean.',
    distance: '15 min drive',
    travelTime: '15 min',
    difficulty: 'Easy',
    duration: '1.5–2 hrs',
    image: 'ocean',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Scotts_Head%2C_Dominica_014.jpg',
  },
  {
    id: 'd_2',
    title: 'Boiling Lake',
    category: 'Adventure',
    description:
      'A demanding but unforgettable hike through the Valley of Desolation to the second-largest fumarolic lake in the world, cloaked in rising steam.',
    distance: '40 min drive + hike',
    travelTime: '40 min',
    difficulty: 'Challenging',
    duration: 'Full day',
    image: 'volcano',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dominica_boiling_lake.jpg',
  },
  {
    id: 'd_3',
    title: 'Trafalgar Falls',
    category: 'Nature',
    description:
      "Twin waterfalls tumbling into a rainforest pool, reachable via a short, well-marked trail through Morne Trois Pitons National Park.",
    distance: '20 min drive',
    travelTime: '20 min',
    difficulty: 'Moderate',
    duration: '1.5 hrs',
    image: 'waterfall',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Trafalgar_Falls_at_Morne_Trois_Pitons_National_Park.jpg',
  },
  {
    id: 'd_4',
    title: 'Morne Trois Pitons National Park',
    category: 'Nature',
    description:
      'A UNESCO World Heritage site of volcanic peaks, crater lakes, and dense rainforest, home to much of Dominica\'s protected wildlife.',
    distance: '30 min drive',
    travelTime: '30 min',
    difficulty: 'Moderate',
    duration: 'Half day',
    image: 'rainforest',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Morne_Trois_Pitons_National_Park%2C_Dominica_-_jungle.jpg',
  },
  {
    id: 'd_5',
    title: 'Emerald Pool',
    category: 'Nature',
    description:
      'A short rainforest walk leads to a glimmering pool fed by a gentle waterfall — a favourite for a quick, scenic swim.',
    distance: '25 min drive',
    travelTime: '25 min',
    difficulty: 'Easy',
    duration: '1 hr',
    image: 'pool',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Emerald_Pool%2C_Dominica.jpg',
  },
  {
    id: 'd_6',
    title: 'Whale Watching, Roseau',
    category: 'Ocean',
    description:
      'Dominica\'s deep coastal waters are home to resident sperm whales year-round, along with dolphins and seasonal migratory species.',
    distance: '25 min drive',
    travelTime: '25 min',
    difficulty: 'Easy',
    duration: '3 hrs',
    image: 'whale',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Baleine_Ile_de_la_Dominique.jpg',
  },
  {
    id: 'd_7',
    title: 'Old Roseau Market & Waterfront',
    category: 'Culture',
    description:
      'Browse spices, produce, and local crafts in the capital\'s historic market, then stroll the Bayfront promenade.',
    distance: '20 min drive',
    travelTime: '20 min',
    difficulty: 'Easy',
    duration: '2 hrs',
    image: 'market',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Produce_Market%2C_Roseau%2C_Dominica.jpg',
  },
  {
    id: 'd_8',
    title: 'Ti Kwen Glo Cho Hot Springs',
    category: 'Wellness',
    description:
      'Warm, mineral-rich pools set in a quiet garden — a gentle way to unwind after a day of hiking.',
    distance: '35 min drive',
    travelTime: '35 min',
    difficulty: 'Easy',
    duration: '1.5 hrs',
    image: 'springs',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dominica%2C_Karibik_-_Laudat_-_Wotten_Waven_%E2%80%93_Fond_Cani_-_panoramio.jpg',
  },
  {
    id: 'd_9',
    title: 'Canyoning at Titou Gorge',
    category: 'Adventure',
    description:
      'Swim, scramble, and float through a narrow volcanic gorge with cool water and dramatic rock walls.',
    distance: '35 min drive',
    travelTime: '35 min',
    difficulty: 'Challenging',
    duration: '3 hrs',
    image: 'gorge',
    // No verified real photo found for this specific site yet — falls back to the icon placeholder.
  },
  {
    id: 'd_10',
    title: 'Cabrits National Park & Fort Shirley',
    category: 'Culture',
    description:
      'An 18th-century British garrison restored on a forested peninsula overlooking Prince Rupert Bay, with sweeping coastal views and Dominica\'s richest colonial history.',
    distance: '45 min drive',
    travelTime: '45 min',
    difficulty: 'Easy',
    duration: '2 hrs',
    image: 'market',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fort_Shirley%2C_Dominica%2C_2026.jpg',
  },
  {
    id: 'd_11',
    title: 'Indian River, Portsmouth',
    category: 'Nature',
    description:
      'A quiet, guide-paddled river through a mangrove swamp draped in buttress roots — one of Dominica\'s most photographed spots, and a filming location for Pirates of the Caribbean.',
    distance: '45 min drive',
    travelTime: '45 min',
    difficulty: 'Easy',
    duration: '1.5 hrs',
    image: 'rainforest',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Indian_River_in_Portsmouth%2C_Dominica.jpg',
  },
  {
    id: 'd_12',
    title: 'Middleham Falls',
    category: 'Nature',
    description:
      'A demanding rainforest hike rewarded by Dominica\'s tallest waterfall, plunging over 200 feet into a cool jungle pool.',
    distance: '35 min drive + hike',
    travelTime: '35 min',
    difficulty: 'Challenging',
    duration: '3 hrs',
    image: 'waterfall',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Middleham_Falls_at_Morne_Trois_Pitons_National_Park.jpg',
  },
  {
    id: 'd_13',
    title: 'Freshwater Lake',
    category: 'Nature',
    description:
      'The highest lake in the Lesser Antilles, ringed by cloud forest inside Morne Trois Pitons National Park — a peaceful spot for a rim walk with mountain views.',
    distance: '35 min drive',
    travelTime: '35 min',
    difficulty: 'Moderate',
    duration: '1.5 hrs',
    image: 'pool',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Freshwater_Lake%2C_Dominica.jpg',
  },
  {
    id: 'd_14',
    title: 'Kalinago Territory',
    category: 'Culture',
    description:
      'Home to the descendants of the Kalinago (Carib) people, the last pre-Columbian community in the Caribbean — visit the cultural village to see traditional canoe-building, basket weaving, and craft.',
    distance: '1 hr drive',
    travelTime: '1 hr',
    difficulty: 'Easy',
    duration: 'Half day',
    image: 'culture',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Carib_Territory_(Dominica).jpg',
  },
];

export const ACTIVITY_CATEGORIES = ['Ocean', 'Adventure', 'Nature', 'Wellness', 'Food', 'Culture', 'Entertainment', 'Family'];

export const ACTIVITIES = [
  {
    id: 'a_1',
    capacity: 20,
    priceValue: 65,
    name: 'Champagne Reef Snorkeling',
    category: 'Ocean',
    shortDescription: 'Guided snorkel over volcanic bubble vents and coral.',
    description:
      'Join our marine guide for a guided snorkel session at Champagne Reef, famous for the warm bubbles rising from the seafloor. Suitable for beginners and experienced snorkelers alike. All equipment provided.',
    date: '2026-08-15',
    time: '11:00 AM',
    duration: '1.5 hrs',
    price: '$65 per person',
    availability: 'Available',
    location: 'Champagne Beach',
    whatToBring: ['Swimwear', 'Towel', 'Reef-safe sunscreen', 'Waterproof phone pouch (optional)'],
    meetingPoint: 'Ocean Oasis Beach Desk',
    cancellationPolicy: 'Free cancellation up to 24 hours before the activity.',
    image: 'snorkel',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Scotts_Head%2C_Dominica_014.jpg',
  },
  {
    id: 'a_2',
    capacity: 16,
    priceValue: 75,
    name: 'Rainforest Canopy Trek',
    category: 'Nature',
    shortDescription: 'Guided walk through old-growth rainforest trails.',
    description:
      'A naturalist-led trek through lush rainforest canopy, spotting native birds, orchids, and centuries-old trees, finishing at a hidden freshwater pool.',
    date: '2026-08-15',
    time: '9:00 AM',
    duration: '3 hrs',
    price: '$75 per person',
    availability: 'Available',
    location: 'Morne Trois Pitons trailhead',
    whatToBring: ['Hiking shoes', 'Insect repellent', 'Water bottle', 'Light rain jacket'],
    meetingPoint: 'Hotel Lobby',
    cancellationPolicy: 'Free cancellation up to 24 hours before the activity.',
    image: 'rainforest',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rainforest_(Dominica).jpg',
  },
  {
    id: 'a_3',
    capacity: 24,
    priceValue: 95,
    name: 'Sunset Catamaran Sail',
    category: 'Ocean',
    shortDescription: 'Evening sail along the coast with drinks and canapés.',
    description:
      'Sail along Dominica\'s dramatic coastline as the sun sets, with island cocktails and light bites served on board.',
    date: '2026-08-16',
    time: '5:00 PM',
    duration: '2 hrs',
    price: '$95 per person',
    availability: 'Limited spots',
    location: 'Ocean Oasis Marina',
    whatToBring: ['Light jacket', 'Camera'],
    meetingPoint: 'Marina Dock',
    cancellationPolicy: 'Free cancellation up to 48 hours before departure.',
    image: 'catamaran',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sailing_Catamaran_at_sunset.jpg',
  },
  {
    id: 'a_4',
    capacity: 15,
    priceValue: 0,
    name: 'Sunrise Yoga on the Beach',
    category: 'Wellness',
    shortDescription: 'Gentle flow yoga facing the water.',
    description:
      'Start your day with a guided vinyasa flow on the sand as the sun rises over the ocean. All levels welcome.',
    date: '2026-08-16',
    time: '6:30 AM',
    duration: '1 hr',
    price: 'Complimentary',
    availability: 'Available',
    location: 'Main Beach',
    whatToBring: ['Comfortable clothing'],
    meetingPoint: 'Beach Yoga Deck',
    cancellationPolicy: 'No cancellation fee.',
    image: 'yoga',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Yoga_At_Dawn_on_Bondi_Beach.jpg',
  },
  {
    id: 'a_5',
    capacity: 12,
    priceValue: 85,
    name: 'Local Cuisine Cooking Class',
    category: 'Food',
    shortDescription: 'Hands-on class with our executive chef.',
    description:
      'Learn to prepare traditional Dominican dishes using local produce and spices, guided by our executive chef, followed by a shared tasting.',
    date: '2026-08-17',
    time: '4:00 PM',
    duration: '2.5 hrs',
    price: '$85 per person',
    availability: 'Available',
    location: 'Ocean Oasis Culinary Studio',
    whatToBring: ['Nothing — aprons provided'],
    meetingPoint: 'Culinary Studio',
    cancellationPolicy: 'Free cancellation up to 24 hours before class.',
    image: 'cooking',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chef_prepares_fresh_ingredients_by_chopping_red_vegetables.jpg',
  },
  {
    id: 'a_6',
    capacity: 10,
    priceValue: 110,
    name: 'Canyoning Adventure',
    category: 'Adventure',
    shortDescription: 'Swim and scramble through Titou Gorge.',
    description:
      'A thrilling half-day adventure swimming and climbing through a dramatic volcanic gorge, led by certified guides.',
    date: '2026-08-17',
    time: '9:30 AM',
    duration: '3 hrs',
    price: '$110 per person',
    availability: 'Available',
    location: 'Titou Gorge',
    whatToBring: ['Swimwear', 'Water shoes', 'Change of clothes'],
    meetingPoint: 'Hotel Lobby',
    cancellationPolicy: 'Free cancellation up to 48 hours before the activity.',
    image: 'gorge',
  },
  {
    id: 'a_7',
    capacity: 18,
    priceValue: 55,
    name: 'Indian River Guided Boat Tour',
    category: 'Nature',
    shortDescription: 'Quiet paddle through mangrove swamp on Dominica\'s most iconic river.',
    description:
      'A licensed local guide rows you upstream along the Indian River, past buttress-root mangroves and swamp bloodwood trees, finishing with a stop at a riverside bush bar.',
    date: '2026-08-18',
    time: '10:00 AM',
    duration: '1.5 hrs',
    price: '$55 per person',
    availability: 'Available',
    location: 'Portsmouth',
    whatToBring: ['Camera', 'Insect repellent', 'Light rain jacket'],
    meetingPoint: 'Hotel Lobby',
    cancellationPolicy: 'Free cancellation up to 24 hours before the activity.',
    image: 'rainforest',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Indian_River_in_Portsmouth%2C_Dominica.jpg',
  },
  {
    id: 'a_8',
    capacity: 20,
    priceValue: 70,
    name: 'Kalinago Cultural Village Tour',
    category: 'Culture',
    shortDescription: 'Guided visit to the Kalinago Territory with craft demonstrations.',
    description:
      'Meet descendants of the Kalinago people in their territory on Dominica\'s east coast, with demonstrations of traditional canoe-building, basket weaving, and cassava bread making.',
    date: '2026-08-19',
    time: '9:00 AM',
    duration: '4 hrs',
    price: '$70 per person',
    availability: 'Available',
    location: 'Kalinago Territory',
    whatToBring: ['Comfortable shoes', 'Camera', 'Cash for crafts'],
    meetingPoint: 'Hotel Lobby',
    cancellationPolicy: 'Free cancellation up to 48 hours before the activity.',
    image: 'culture',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Carib_Territory_(Dominica).jpg',
  },
  {
    id: 'a_9',
    capacity: 12,
    priceValue: 100,
    name: 'Sperm Whale Watching Tour',
    category: 'Ocean',
    shortDescription: 'A 3-hour boat trip in search of Dominica\'s resident sperm whales.',
    description:
      'Dominica is known as the Whale Watching Capital of the Caribbean — sperm whales live in these waters year-round, with seasonal humpback whales and dolphins as well. Departs from Ocean Oasis\'s private pier; private charters available on request.',
    date: '2026-08-18',
    time: '9:00 AM',
    duration: '3 hrs',
    price: '$100 per person',
    availability: 'Available',
    location: 'Ocean Oasis Private Pier',
    whatToBring: ['Sunscreen', 'Hat', 'Motion sickness remedy if needed', 'Camera'],
    meetingPoint: 'Ocean Oasis Private Pier',
    cancellationPolicy: 'Free cancellation up to 48 hours before the activity.',
    image: 'whale',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Baleine_Ile_de_la_Dominique.jpg',
  },
  {
    id: 'a_10',
    capacity: 10,
    priceValue: 120,
    name: 'Two-Tank Boat Dive',
    category: 'Ocean',
    shortDescription: 'Guided boat dive through Dominica\'s reefs, walls, and volcanic vents with the Ocean Oasis Dive Shop.',
    description:
      'Two guided tanks with the Ocean Oasis Dive Shop — from calm, shallow reefs where seahorses shelter among the coral to deeper walls with larger marine life. Full gear rental available. Introductory experiences offered for non-certified divers.',
    date: '2026-08-17',
    time: '8:00 AM',
    duration: '4 hrs',
    price: '$120 per person',
    availability: 'Available',
    location: 'Ocean Oasis Dive Shop',
    whatToBring: ['Swimsuit', 'Certification card (if certified)', 'Towel'],
    meetingPoint: 'Ocean Oasis Dive Shop',
    cancellationPolicy: 'Free cancellation up to 48 hours before the activity.',
    image: 'ocean',
  },
  {
    id: 'a_11',
    capacity: 12,
    priceValue: 100,
    name: 'Guided Snorkeling Tour',
    category: 'Ocean',
    shortDescription: 'A 2-hour guided snorkel from Ocean Oasis\'s private pier.',
    description:
      'A relaxed, guided snorkeling tour departing directly from the hotel\'s private pier — an easy way to see Dominica\'s reef life without a long boat ride. Suitable for beginners.',
    date: '2026-08-16',
    time: '10:00 AM',
    duration: '2 hrs',
    price: '$100 per person',
    availability: 'Available',
    location: 'Ocean Oasis Private Pier',
    whatToBring: ['Swimsuit', 'Reef-safe sunscreen', 'Towel'],
    meetingPoint: 'Ocean Oasis Private Pier',
    cancellationPolicy: 'Free cancellation up to 48 hours before the activity.',
    image: 'ocean',
  },
  {
    id: 'a_12',
    capacity: 8,
    priceValue: 0,
    name: 'Private Sunset Cruise',
    category: 'Ocean',
    shortDescription: 'A private, romantic cruise along Dominica\'s coastline at sunset.',
    description:
      'A private charter along the coast as the sun goes down — ideal for anniversaries, proposals, or simply watching the Caribbean sky change color from the water. Pricing depends on party size and duration; contact the concierge to arrange.',
    date: '2026-08-20',
    time: '5:30 PM',
    duration: '2 hrs',
    price: 'Contact concierge for pricing',
    availability: 'Available',
    location: 'Ocean Oasis Private Pier',
    whatToBring: ['Light jacket for the evening breeze', 'Camera'],
    meetingPoint: 'Ocean Oasis Private Pier',
    cancellationPolicy: 'Free cancellation up to 48 hours before the activity.',
    image: 'ocean',
  },
];

export const EVENTS = [
  { id: 'e_1', title: 'Breakfast', category: 'Dining', date: '2026-08-15', time: '9:00 AM', location: 'Oasis Terrace', description: 'A full Caribbean and continental breakfast spread.', icon: 'coffee', capacity: 80, status: 'PUBLISHED' },
  { id: 'e_2', title: 'Rainforest Experience', category: 'Adventure', date: '2026-08-15', time: '11:00 AM', location: 'Meet at Lobby', description: 'Guided rainforest walk with our resident naturalist.', icon: 'nature', capacity: 20, status: 'PUBLISHED' },
  { id: 'e_3', title: 'Sunset Cocktails', category: 'Entertainment', date: '2026-08-15', time: '5:30 PM', location: 'Horizon Bar', description: 'Handcrafted cocktails as the sun sets over the water.', icon: 'wine', capacity: 60, status: 'PUBLISHED' },
  { id: 'e_4', title: 'Live Music', category: 'Entertainment', date: '2026-08-15', time: '7:30 PM', location: 'Main Terrace', description: 'Local musicians performing island rhythms.', icon: 'music', capacity: 80, status: 'PUBLISHED' },
  { id: 'e_5', title: 'Sunrise Yoga', category: 'Wellness', date: '2026-08-16', time: '6:30 AM', location: 'Main Beach', description: 'Gentle guided flow to start the day.', icon: 'yoga', capacity: 15, status: 'PUBLISHED' },
  { id: 'e_6', title: 'Guided Nature Walk', category: 'Adventure', date: '2026-08-16', time: '10:00 AM', location: 'Garden Trailhead', description: 'A relaxed walk through the property\'s botanical gardens.', icon: 'nature', capacity: 20, status: 'PUBLISHED' },
  { id: 'e_7', title: 'Cultural Performance', category: 'Culture', date: '2026-08-16', time: '8:00 PM', location: 'Main Terrace', description: 'Traditional Creole dance and drumming performance.', icon: 'culture', capacity: 100, status: 'PUBLISHED' },
  { id: 'e_8', title: 'Cooking Experience', category: 'Food', date: '2026-08-17', time: '4:00 PM', location: 'Culinary Studio', description: 'Hands-on class exploring Dominican flavours.', icon: 'cooking', capacity: 12, status: 'PUBLISHED' },

  // Island-wide festivals (not hotel-run) — sourced from discoverdominica.com's
  // 2026 festivals & events calendar, so guests can plan trips around them.
  { id: 'e_9', title: 'Comess', category: 'Festival', date: '2026-06-27', time: '10:00 PM – 4:00 AM', location: 'La Plas Dame Park, Colihaut', description: 'A colourful bouyon night featuring paint, water, and powder.', icon: 'music', capacity: null, status: 'PUBLISHED' },
  { id: 'e_10', title: 'Wellness Fair 2026: Be Well in Nature', category: 'Festival', date: '2026-07-04', time: '9:00 AM – 4:00 PM', location: 'UWI Global Campus Dominica', description: 'Free island-wide celebration of natural health and holistic living.', icon: 'yoga', capacity: null, status: 'PUBLISHED' },
  { id: 'e_11', title: 'Gouté Domnik', category: 'Festival', date: '2026-07-19', time: 'All week', location: 'Island-wide', description: 'A week-long taste of Dominica — restaurant week, a One Pot Competition, and Farmers\' Marketplace, through July 26.', icon: 'cooking', capacity: null, status: 'PUBLISHED' },
  { id: 'e_12', title: 'Bike Fest 2026', category: 'Festival', date: '2026-07-31', time: 'All weekend', location: 'Island-wide', description: 'Four days of drag racing, exhibitions, and an island-wide ride-out, through August 3.', icon: 'adventure', capacity: null, status: 'PUBLISHED' },
  { id: 'e_13', title: 'Dive Fest', category: 'Festival', date: '2026-08-29', time: 'All weekend', location: 'Island-wide dive sites', description: 'Dominica\'s longest-running celebration of the deep — volcanic reef diving and marine reserve exploration.', icon: 'wave', capacity: null, status: 'PUBLISHED' },
  { id: 'e_14', title: 'Flavours of the World Festival', category: 'Festival', date: '2026-10-04', time: 'All day', location: 'Roseau', description: 'A celebration of island cultures through international cuisine, language, and global rhythms.', icon: 'culture', capacity: null, status: 'PUBLISHED' },
  { id: 'e_15', title: 'World Creole Music Festival', category: 'Festival', date: '2026-10-23', time: 'All weekend', location: 'Windsor Park, Roseau', description: 'The 26th annual WCMF — bouyon, zouk, soca, and Creole music, through October 25.', icon: 'music', capacity: null, status: 'PUBLISHED', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Le_World_Creole_Music_Festival.jpg' },
  { id: 'e_16', title: 'WATO Riverfront Food and Culture Festival', category: 'Festival', date: '2026-10-31', time: 'All day', location: 'Roseau riverfront', description: 'Themed "Ancestors" this year — open-fire cooking by Caribbean chefs.', icon: 'cooking', capacity: null, status: 'PUBLISHED' },
  { id: 'e_17', title: 'Dominica Carnival — Mas Domnik', category: 'Festival', date: '2027-01-09', time: 'All month', location: 'Island-wide', description: '"The Real Mas" — bouyon, calypso, and costumes, running through February 10, 2027.', icon: 'culture', capacity: null, status: 'PUBLISHED' },
];

export const DINING_VENUES = [
  {
    id: 'v_1',
    name: 'Tide & Table',
    type: 'Signature Restaurant',
    description: 'Seasonal Caribbean dishes crafted from local market and dock-fresh ingredients, with sunset-facing water views.',
    hours: 'Dinner · 6:00 PM – 10:00 PM',
    dressCode: 'Smart casual',
    location: 'Main Building, Level 3',
    reservationRequired: true,
    image: 'finedining',
    imageUrl: 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-01-69028ae57d28a.jpg',
  },
  {
    id: 'v_2',
    name: 'Oasis Terrace',
    type: 'All-Day Dining',
    description: 'Open-air terrace serving breakfast, lunch, and casual dinner favourites.',
    hours: 'Breakfast 7–10:30 AM · Lunch 12–3 PM · Dinner 6–9:30 PM',
    dressCode: 'Resort casual',
    location: 'Ground Floor, Garden Wing',
    reservationRequired: false,
    image: 'terrace',
    imageUrl: 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-02-69028ae71481e.jpg',
  },
  {
    id: 'v_3',
    name: 'Horizon Bar',
    type: 'Bar & Lounge',
    description: 'Handcrafted cocktails and light bites overlooking the infinity pool.',
    hours: '11:00 AM – Midnight',
    dressCode: 'Resort casual',
    location: 'Pool Deck',
    reservationRequired: false,
    image: 'bar',
    imageUrl: 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-03-69028ae892712.jpg',
  },
  {
    id: 'v_4',
    name: 'In-Room Dining',
    type: 'Room Service',
    description: 'Full menu delivered to your room, available around the clock.',
    hours: '24 hours',
    dressCode: 'N/A',
    location: 'Delivered to your room',
    reservationRequired: false,
    image: 'roomservice',
    imageUrl: 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-04-69028ae9e7bce.jpg',
  },
];

export const PROMOTIONS = [
  {
    id: 'p_1',
    title: 'Sunset Special',
    description: 'Enjoy 20% off selected cocktails from 5–7 PM daily at Horizon Bar.',
    validity: 'Valid through August 31, 2026',
    terms: 'Applies to selected cocktails only. Cannot be combined with other offers.',
    image: 'cocktail',
    imageUrl: 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-03-69028ae892712.jpg',
    status: 'PUBLISHED', targetAudience: 'All guests', impressions: 842, clicks: 216, bookings: 58, redemptions: 47, revenue: 1410,
  },
  {
    id: 'p_2',
    title: 'Private Dining Experience',
    description: 'Reserve a private table on the beach for an intimate, chef-curated dinner.',
    validity: 'Available year-round, subject to availability',
    terms: 'Advance booking required. Minimum 2 guests.',
    image: 'privatedining',
    imageUrl: 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-05-69028aeb59ab8.jpg',
    status: 'PUBLISHED', targetAudience: 'Couples', impressions: 530, clicks: 140, bookings: 22, redemptions: 19, revenue: 3610,
  },
  {
    id: 'p_3',
    title: 'Adventure Package',
    description: 'Book any two adventure activities and receive 15% off the second.',
    validity: 'Valid through September 15, 2026',
    terms: 'Discount applies to lower-priced activity. Subject to availability.',
    image: 'adventure',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rainforest_(Dominica).jpg',
    status: 'PUBLISHED', targetAudience: 'Adventure interest', impressions: 410, clicks: 96, bookings: 31, redemptions: 26, revenue: 1860,
  },
  {
    id: 'p_4',
    title: 'Room Upgrade Offer',
    description: 'Ask reception about complimentary upgrade availability during your stay.',
    validity: 'Subject to availability at check-in',
    terms: 'Cannot be guaranteed in advance.',
    image: 'room',
    imageUrl: 'https://symphony.cdn.tambourine.com/_fusion/ocean-oasis/media/oceanedgedevelopment-homepage-gallery-06-69028aecd33e8.jpg',
    status: 'PUBLISHED', targetAudience: 'All guests', impressions: 298, clicks: 74, bookings: 12, redemptions: 9, revenue: 0,
  },
];

export const DINING_MENUS = {
  v_1: {
    sections: [
      {
        title: 'Starters',
        items: [
          { name: 'Callaloo Soup', price: '$9', description: 'Dasheen leaves, coconut milk, local herbs.' },
          { name: 'Christophene Fritters', price: '$11', description: 'Chayote squash, saltfish, scotch bonnet aioli.' },
          { name: 'Dock-Caught Ceviche', price: '$14', description: "Chef's daily catch, lime, red onion, plantain crisps." },
        ],
      },
      {
        title: 'Mains',
        items: [
          { name: 'Grilled Mahi Mahi', price: '$32', description: 'Coconut rice, callaloo, tamarind glaze.' },
          { name: 'Braised Oxtail', price: '$29', description: 'Slow-cooked, butter beans, provision mash.' },
          { name: 'Roasted Vegetable Curry', price: '$24', description: 'Seasonal market vegetables, coconut curry, roti.' },
        ],
      },
      {
        title: 'Desserts',
        items: [
          { name: 'Coconut Tart', price: '$8', description: 'Toasted coconut, passionfruit coulis.' },
          { name: 'Rum Cake', price: '$8', description: "Dominican rum, spiced butter sauce." },
        ],
      },
    ],
  },
  v_2: {
    sections: [
      { title: 'Breakfast', items: [
        { name: 'Continental Spread', price: 'Included', description: 'Pastries, tropical fruit, yogurt, cereals.' },
        { name: 'Bakes & Saltfish', price: '$12', description: 'Traditional fried bakes with saltfish souse.' },
      ] },
      { title: 'Lunch & Dinner', items: [
        { name: 'Grilled Chicken Sandwich', price: '$14', description: 'House pepper sauce, provision chips.' },
        { name: 'Terrace Salad', price: '$13', description: 'Local greens, avocado, citrus vinaigrette.' },
        { name: 'Wood-Fired Flatbread', price: '$16', description: "Chef's daily topping selection." },
      ] },
    ],
  },
  v_3: {
    sections: [
      { title: 'Signature Cocktails', items: [
        { name: 'Sunset Special', price: '$12', description: 'Rum, passionfruit, lime, ginger beer.' },
        { name: "Dominica Sour", price: '$13', description: 'Local rum, bitters, egg white.' },
      ] },
      { title: 'Light Bites', items: [
        { name: 'Plantain Chips & Dip', price: '$8', description: 'House pepper aioli.' },
        { name: 'Coconut Shrimp', price: '$15', description: 'Sweet chili glaze.' },
      ] },
    ],
  },
  v_4: {
    sections: [
      { title: 'Available 24 Hours', items: [
        { name: 'Club Sandwich', price: '$16', description: 'Triple-decker, hand-cut fries.' },
        { name: 'Caribbean Fruit Plate', price: '$10', description: "Chef's seasonal selection." },
        { name: 'Late-Night Pasta', price: '$18', description: 'Garlic, chili, herb oil.' },
      ] },
    ],
  },
};

export const SERVICE_REQUEST_CATEGORIES = [
  { id: 'housekeeping', label: 'Housekeeping', icon: 'broom' },
  { id: 'towels', label: 'Extra Towels', icon: 'towel' },
  { id: 'toiletries', label: 'Toiletries', icon: 'soap' },
  { id: 'laundry', label: 'Laundry', icon: 'laundry' },
  { id: 'roomservice', label: 'Room Service', icon: 'roomservice' },
  { id: 'maintenance', label: 'Maintenance', icon: 'tools' },
  { id: 'transportation', label: 'Transportation', icon: 'car' },
  { id: 'luggage', label: 'Luggage Assistance', icon: 'luggage' },
  { id: 'wakeup', label: 'Wake-up Call', icon: 'alarm' },
  { id: 'concierge', label: 'Concierge', icon: 'concierge' },
  { id: 'roomupgrade', label: 'Room Upgrade', icon: 'roomupgrade' },
  { id: 'other', label: 'Other', icon: 'other' },
];

export const INITIAL_SERVICE_REQUESTS = [
  {
    id: 'sr_1',
    category: 'Housekeeping',
    description: 'Please refresh the room while we are at breakfast.',
    preferredTime: '10:00 AM',
    status: 'Completed',
    createdAt: '2026-08-15T08:00:00',
  },
  {
    id: 'sr_2',
    category: 'Extra Towels',
    description: '2 extra pool towels for room 204.',
    preferredTime: 'As soon as possible',
    status: 'In Progress',
    createdAt: '2026-08-15T13:30:00',
  },
];

export const REQUEST_STATUS_STEPS = ['Received', 'Assigned', 'In Progress', 'Completed'];

export const NOTIFICATION_CATEGORIES = [
  'Reservation', 'Activity Reminder', 'Hotel Announcement', 'Promotion', 'Service Request', 'Event', 'Transportation', 'Important Alert',
];

export const INITIAL_NOTIFICATIONS = [
  { id: 'n_1', category: 'Reservation', title: 'Reservation Confirmed', body: 'Your stay at Ocean Oasis, Aug 15–19, is confirmed.', time: '2 days ago', read: true },
  { id: 'n_2', category: 'Activity Reminder', title: 'Snorkeling starts soon', body: 'Champagne Reef Snorkeling begins at 11:00 AM today.', time: '1 hr ago', read: false },
  { id: 'n_3', category: 'Promotion', title: 'Sunset Special', body: '20% off cocktails from 5–7 PM at Horizon Bar.', time: '3 hrs ago', read: false },
  { id: 'n_4', category: 'Hotel Announcement', title: 'Pool maintenance', body: 'The infinity pool will close briefly at 2 PM for routine maintenance.', time: 'Today', read: true },
];

export const INTERESTS = [
  { id: 'adventure', label: 'Adventure', icon: 'hiking' },
  { id: 'nature', label: 'Nature', icon: 'tree' },
  { id: 'relaxation', label: 'Relaxation', icon: 'spa' },
  { id: 'food', label: 'Food', icon: 'food' },
  { id: 'culture', label: 'Culture', icon: 'culture' },
  { id: 'wellness', label: 'Wellness', icon: 'wellness' },
  { id: 'family', label: 'Family', icon: 'family' },
  { id: 'ocean', label: 'Ocean', icon: 'wave' },
];

export const CONCIERGE_FAQ = [
  {
    id: 'faq_1',
    question: 'What activities are available today?',
    answer: "Today we have Champagne Reef Snorkeling at 11:00 AM and Rainforest Canopy Trek at 9:00 AM. You can view and reserve both under Explore → Activities.",
  },
  {
    id: 'faq_2',
    question: 'What should I do in Dominica?',
    answer: "Popular experiences include Champagne Reef, Trafalgar Falls, Boiling Lake, and whale watching from Roseau. Check the Explore tab for full details on each.",
  },
  {
    id: 'faq_3',
    question: 'Where can I eat?',
    answer: "Ocean Oasis has four dining venues: Horizon (fine dining), Oasis Terrace (all-day dining), Horizon Bar, and 24-hour In-Room Dining. You can view menus and hours under Dining.",
  },
  {
    id: 'faq_4',
    question: 'What time is breakfast?',
    answer: "Breakfast is served from 7:00–10:30 AM at Oasis Terrace.",
  },
  {
    id: 'faq_5',
    question: 'What events are happening tonight?',
    answer: "Tonight we have Sunset Cocktails at 5:30 PM and Live Music at 7:30 PM, both on the Main Terrace.",
  },
  {
    id: 'faq_6',
    question: 'I need something for my room.',
    answer: "I can help with that — head to Requests → New Request to submit a housekeeping, towel, or maintenance request, and our team will be notified right away.",
  },
  {
    id: 'faq_7',
    question: 'How do I get to the airport?',
    answer: "Airport transfers can be arranged through Contact Reception or by submitting a Transportation request. Please give us at least 3 hours' notice.",
  },
];

export const PAST_STAYS = [
  { id: 'ps_1', dates: 'March 3–7, 2025', room: 'Garden View Room', rating: 5 },
  { id: 'ps_2', dates: 'November 12–16, 2024', room: 'Ocean View Suite', rating: 5 },
];

// -----------------------------------------------------------------------
// STAFF & MANAGEMENT PLATFORM DATA
// Everything below powers the Staff Operations Dashboard and Management &
// Analytics Dashboard, which run inside this same app and share this same
// data — a service request submitted above by a guest is the very object
// staff act on below; nothing is duplicated or re-mocked per surface.
// -----------------------------------------------------------------------

export const ROLES = [
  'SUPER_ADMIN', 'GENERAL_MANAGER', 'MANAGEMENT', 'FRONT_DESK', 'CONCIERGE',
  'HOUSEKEEPING', 'MAINTENANCE', 'FOOD_AND_BEVERAGE', 'ACTIVITIES_MANAGER', 'MARKETING',
];

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  GENERAL_MANAGER: 'General Manager',
  MANAGEMENT: 'Management',
  FRONT_DESK: 'Front Desk',
  CONCIERGE: 'Concierge',
  HOUSEKEEPING: 'Housekeeping',
  MAINTENANCE: 'Maintenance',
  FOOD_AND_BEVERAGE: 'Food & Beverage',
  ACTIVITIES_MANAGER: 'Activities Manager',
  MARKETING: 'Marketing',
};

// Which surfaces each role may sign into during this demo.
export const ROLE_SURFACES = {
  SUPER_ADMIN: ['staff', 'management'],
  GENERAL_MANAGER: ['staff', 'management'],
  MANAGEMENT: ['management'],
  FRONT_DESK: ['staff'],
  CONCIERGE: ['staff'],
  HOUSEKEEPING: ['staff'],
  MAINTENANCE: ['staff'],
  FOOD_AND_BEVERAGE: ['staff'],
  ACTIVITIES_MANAGER: ['staff'],
  MARKETING: ['staff', 'management'],
};

export const DEPARTMENTS = ['Front Desk', 'Concierge', 'Housekeeping', 'Maintenance', 'Food & Beverage', 'Activities', 'Transportation'];

export const REQUEST_CATEGORY_TO_DEPARTMENT = {
  Housekeeping: 'Housekeeping',
  'Extra Towels': 'Housekeeping',
  Toiletries: 'Housekeeping',
  Laundry: 'Housekeeping',
  'Room Service': 'Food & Beverage',
  Maintenance: 'Maintenance',
  Transportation: 'Transportation',
  'Luggage Assistance': 'Front Desk',
  'Wake-up Call': 'Front Desk',
  Concierge: 'Concierge',
  'Room Upgrade': 'Front Desk',
  Other: 'Front Desk',
};

// Which staff role should be notified (via the notifications table's
// role-broadcast rows) when a guest submits a request in this category.
export const REQUEST_CATEGORY_TO_ROLE = {
  Housekeeping: 'HOUSEKEEPING',
  'Extra Towels': 'HOUSEKEEPING',
  Toiletries: 'HOUSEKEEPING',
  Laundry: 'HOUSEKEEPING',
  'Room Service': 'FOOD_AND_BEVERAGE',
  Maintenance: 'MAINTENANCE',
  Transportation: 'FRONT_DESK',
  'Luggage Assistance': 'FRONT_DESK',
  'Wake-up Call': 'FRONT_DESK',
  Concierge: 'CONCIERGE',
  'Room Upgrade': 'FRONT_DESK',
  Other: 'FRONT_DESK',
};

export const ROOM_STATUSES = ['VACANT_CLEAN', 'VACANT_DIRTY', 'OCCUPIED_CLEAN', 'OCCUPIED_SERVICE_REQUIRED', 'INSPECTION_REQUIRED', 'OUT_OF_ORDER'];
export const ROOM_STATUS_LABELS = {
  VACANT_CLEAN: 'Vacant · Clean', VACANT_DIRTY: 'Vacant · Dirty', OCCUPIED_CLEAN: 'Occupied · Clean',
  OCCUPIED_SERVICE_REQUIRED: 'Service Required', INSPECTION_REQUIRED: 'Inspection Required', OUT_OF_ORDER: 'Out of Order',
};

// 24 rooms across 4 floors — small, deterministic, believable for a demo.
const ROOM_TYPE_CYCLE = ['Garden View Room', 'Ocean View Room', 'Ocean View Suite', 'Family Suite'];
const ROOM_STATUS_CYCLE = ['OCCUPIED_CLEAN', 'VACANT_CLEAN', 'OCCUPIED_CLEAN', 'VACANT_DIRTY', 'OCCUPIED_SERVICE_REQUIRED', 'OCCUPIED_CLEAN', 'INSPECTION_REQUIRED'];
// 37 rooms across 4 floors — matches the real Ocean Oasis Hotel Dominica room count.
export const ROOMS = [];
for (let floor = 1; floor <= 4; floor++) {
  const count = floor === 4 ? 7 : 10;
  for (let i = 1; i <= count; i++) {
    const num = `${floor}0${i}`;
    ROOMS.push({
      id: `room_${num}`,
      number: num,
      floor,
      type: floor === 4 ? 'Presidential Suite' : ROOM_TYPE_CYCLE[i % ROOM_TYPE_CYCLE.length],
      status: ROOM_STATUS_CYCLE[(floor * 3 + i) % ROOM_STATUS_CYCLE.length],
    });
  }
}
// Guarantee room 204 exists and matches the guest's reservation used throughout the app.
const idx204 = ROOMS.findIndex((r) => r.number === '204');
if (idx204 >= 0) ROOMS[idx204] = { ...ROOMS[idx204], type: 'Ocean View Suite', status: 'OCCUPIED_CLEAN' };

// Every Ocean Oasis room includes these — confirmed from the hotel's own
// accommodations page (oceanoasisdominica.com/accommodation-dominica).
const STANDARD_ROOM_AMENITIES = ['Furnished balcony', 'Bathrobe & slippers', 'Pod coffee maker', 'In-room dining', 'Air conditioning', 'Free Wi-Fi'];

// Room tiers, low to high — matches the `type` values already assigned to
// the 37-room ROOMS list above. Nightly rates are indicative starting
// rates (this app has no live PMS/rate feed yet), shown to guests as "from".
export const ROOM_TYPES = [
  {
    id: 'garden_view_room',
    name: 'Garden View Room',
    tier: 1,
    description: 'A calm, design-forward retreat overlooking Ocean Oasis’s tropical gardens — the same thoughtful in-room amenities as every category, in our most intimate footprint.',
    bedConfig: '1 King or 2 Queen Beds',
    maxOccupancy: 2,
    amenities: [...STANDARD_ROOM_AMENITIES],
    fromPricePerNight: 245,
  },
  {
    id: 'ocean_view_room',
    name: 'Ocean View Room',
    tier: 2,
    description: 'Wake up to sunset-facing Caribbean water views. Same chic, design-forward styling as our Garden View rooms, with the sea as your backdrop.',
    bedConfig: '1 King or 2 Queen Beds',
    maxOccupancy: 2,
    amenities: [...STANDARD_ROOM_AMENITIES, 'Ocean view', 'Rain shower'],
    fromPricePerNight: 305,
  },
  {
    id: 'ocean_view_suite',
    name: 'Ocean View Suite',
    tier: 3,
    description: 'A separate living area and an expanded balcony built for lingering over sunset, with panoramic water views throughout.',
    bedConfig: '1 King Bed + Sofa Bed',
    maxOccupancy: 3,
    amenities: [...STANDARD_ROOM_AMENITIES, 'Ocean view', 'Rain shower', 'Mini bar', 'Separate living area'],
    fromPricePerNight: 385,
  },
  {
    id: 'family_suite',
    name: 'Family Suite',
    tier: 4,
    description: 'Two connected sleeping areas and extra room to spread out — built for families or groups travelling together without giving up the water views.',
    bedConfig: '1 King Bed + 2 Twin Beds',
    maxOccupancy: 4,
    amenities: [...STANDARD_ROOM_AMENITIES, 'Ocean view', 'Rain shower', 'Mini bar', 'Two sleeping areas', 'Extra bedding on request'],
    fromPricePerNight: 425,
  },
  {
    id: 'presidential_suite',
    name: 'Presidential Suite',
    tier: 5,
    description: 'Ocean Oasis’s top-floor signature suite — the most expansive layout on the property, with sweeping sunset views and elevated in-room service.',
    bedConfig: '1 King Bed + Sofa Bed',
    maxOccupancy: 4,
    amenities: [...STANDARD_ROOM_AMENITIES, 'Ocean view', 'Rain shower', 'Premium mini bar', 'Separate living area', 'Private plunge pool access', 'Priority concierge service'],
    fromPricePerNight: 620,
  },
];

export const MAINTENANCE_CATEGORIES = ['AC', 'Plumbing', 'Electrical', 'Internet', 'Appliances', 'Furniture', 'Structural', 'Other'];
export const MAINTENANCE_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const CONTENT_STATUSES = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];

// Real Ocean Oasis Hotel Dominica contact/location details, sourced from
// oceanoasisdominica.com — used throughout Contact Reception and Explore.
export const PROPERTY_INFO = {
  name: 'Ocean Oasis',
  fullName: 'Ocean Oasis Hotel Dominica',
  address: 'Castle Comfort, Roseau St. George, Dominica',
  phone: '+1 (767) 255-8500',
  email: 'stay@oceanoasisdominica.com',
  roomCount: 37,
};

export const TARGET_AUDIENCES = ['All guests', 'New arrivals', 'Families', 'Couples', 'Adventure interest', 'Wellness interest'];
