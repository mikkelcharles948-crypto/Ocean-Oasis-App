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
    status: 'PUBLISHED', targetAudience: 'All guests', impressions: 842, clicks: 216, bookings: 58, redemptions: 47, revenue: 1410,
  },
  {
    id: 'p_2',
    title: 'Private Dining Experience',
    description: 'Reserve a private table on the beach for an intimate, chef-curated dinner.',
    validity: 'Available year-round, subject to availability',
    terms: 'Advance booking required. Minimum 2 guests.',
    image: 'privatedining',
    status: 'PUBLISHED', targetAudience: 'Couples', impressions: 530, clicks: 140, bookings: 22, redemptions: 19, revenue: 3610,
  },
  {
    id: 'p_3',
    title: 'Adventure Package',
    description: 'Book any two adventure activities and receive 15% off the second.',
    validity: 'Valid through September 15, 2026',
    terms: 'Discount applies to lower-priced activity. Subject to availability.',
    image: 'adventure',
    status: 'PUBLISHED', targetAudience: 'Adventure interest', impressions: 410, clicks: 96, bookings: 31, redemptions: 26, revenue: 1860,
  },
  {
    id: 'p_4',
    title: 'Room Upgrade Offer',
    description: 'Ask reception about complimentary upgrade availability during your stay.',
    validity: 'Subject to availability at check-in',
    terms: 'Cannot be guaranteed in advance.',
    image: 'room',
    status: 'PUBLISHED', targetAudience: 'All guests', impressions: 298, clicks: 74, bookings: 12, redemptions: 9, revenue: 0,
  },
];

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
    question: 'What activities are available today?',
    answer: "Today we have Champagne Reef Snorkeling at 11:00 AM and Rainforest Canopy Trek at 9:00 AM. You can view and reserve both under Explore → Activities.",
  },
  {
    question: 'What should I do in Dominica?',
    answer: "Popular experiences include Champagne Reef, Trafalgar Falls, Boiling Lake, and whale watching from Roseau. Check the Explore tab for full details on each.",
  },
  {
    question: 'Where can I eat?',
    answer: "Ocean Oasis has four dining venues: Horizon (fine dining), Oasis Terrace (all-day dining), Horizon Bar, and 24-hour In-Room Dining. You can view menus and hours under Dining.",
  },
  {
    question: 'What time is breakfast?',
    answer: "Breakfast is served from 7:00–10:30 AM at Oasis Terrace.",
  },
  {
    question: 'What events are happening tonight?',
    answer: "Tonight we have Sunset Cocktails at 5:30 PM and Live Music at 7:30 PM, both on the Main Terrace.",
  },
  {
    question: 'I need something for my room.',
    answer: "I can help with that — head to Requests → New Request to submit a housekeeping, towel, or maintenance request, and our team will be notified right away.",
  },
  {
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
  Other: 'Front Desk',
};

export const STAFF_DIRECTORY = [
  { id: 'st_1', name: 'Marcus Bellamy', role: 'GENERAL_MANAGER', department: 'Front Desk' },
  { id: 'st_2', name: 'Elena Sinclair', role: 'MANAGEMENT', department: 'Front Desk' },
  { id: 'st_3', name: 'James Douglas', role: 'FRONT_DESK', department: 'Front Desk' },
  { id: 'st_4', name: 'Priya Chandra', role: 'CONCIERGE', department: 'Concierge' },
  { id: 'st_5', name: 'Grace Osei', role: 'HOUSEKEEPING', department: 'Housekeeping' },
  { id: 'st_6', name: 'Noah Fitzgerald', role: 'HOUSEKEEPING', department: 'Housekeeping' },
  { id: 'st_7', name: 'Adrian Torres', role: 'MAINTENANCE', department: 'Maintenance' },
  { id: 'st_8', name: 'Zara Anand', role: 'FOOD_AND_BEVERAGE', department: 'Food & Beverage' },
  { id: 'st_9', name: 'Kwame Moreau', role: 'ACTIVITIES_MANAGER', department: 'Activities' },
  { id: 'st_10', name: 'Ruby Hastings', role: 'MARKETING', department: 'Front Desk' },
];

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

export const MAINTENANCE_CATEGORIES = ['AC', 'Plumbing', 'Electrical', 'Internet', 'Appliances', 'Furniture', 'Structural', 'Other'];
export const MAINTENANCE_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const INITIAL_MAINTENANCE_ISSUES = [
  { id: 'm_1', roomNumber: '204', category: 'AC', severity: 'HIGH', description: 'AC unit not cooling, compressor noise.', status: 'OPEN', createdAt: new Date(Date.now() - 12 * 60000).toISOString(), resolvedAt: null },
  { id: 'm_2', roomNumber: '312', category: 'Plumbing', severity: 'MEDIUM', description: 'Slow drain in bathroom sink.', status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 180 * 60000).toISOString(), resolvedAt: null },
  { id: 'm_3', roomNumber: '108', category: 'Electrical', severity: 'LOW', description: 'Bedside lamp flickering.', status: 'RESOLVED', createdAt: new Date(Date.now() - 1400 * 60000).toISOString(), resolvedAt: new Date(Date.now() - 1350 * 60000).toISOString() },
];

export const CONTENT_STATUSES = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];
export const INITIAL_CONTENT_ITEMS = [
  { id: 'c_1', type: 'Destination', title: 'Champagne Reef', status: 'PUBLISHED', updatedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'c_2', type: 'FAQ', title: 'What time is breakfast?', status: 'PUBLISHED', updatedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 'c_3', type: 'Announcement', title: 'Pool maintenance Aug 19, 2–3 PM', status: 'PUBLISHED', updatedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'c_4', type: 'Destination', title: 'Ti Kwen Glo Cho Hot Springs', status: 'DRAFT', updatedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
];

export const INITIAL_AUDIT_LOG = [
  { id: 'log_1', actorName: 'Ruby Hastings', actorRole: 'MARKETING', action: 'Published promotion "Sunset Special"', timestamp: new Date(Date.now() - 60 * 24 * 60000).toISOString() },
  { id: 'log_2', actorName: 'Grace Osei', actorRole: 'HOUSEKEEPING', action: 'Updated room 108 status to Vacant · Clean', timestamp: new Date(Date.now() - 200 * 60000).toISOString() },
];

export const INITIAL_STAFF_NOTIFICATIONS = [
  { id: 'sn_1', title: 'Urgent maintenance request', body: 'Room 204 — AC not cooling.', category: 'Maintenance', createdAt: new Date(Date.now() - 12 * 60000).toISOString(), read: false },
];

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

// Seed a couple of "other guests" (beyond the app's own signed-in guest) so
// staff/management screens have more than one row to show in a demo.
export const OTHER_GUESTS = [
  { id: 'g_2001', firstName: 'Daniel', lastName: 'Okafor', roomNumber: '108', reservationNumber: 'OO-58101', checkIn: '2026-08-16', checkOut: '2026-08-20' },
  { id: 'g_2002', firstName: 'Sophia', lastName: 'Reyes', roomNumber: '312', reservationNumber: 'OO-58102', checkIn: '2026-08-14', checkOut: '2026-08-19' },
  { id: 'g_2003', firstName: 'Noah', lastName: 'Fitzgerald Jr.', roomNumber: '105', reservationNumber: 'OO-58103', checkIn: '2026-08-17', checkOut: '2026-08-22' },
];

export const OTHER_FEEDBACK = [
  { id: 'fb_seed_1', guestName: 'Daniel Okafor', roomNumber: '108', overall: 2, ratings: { Room: 3, Cleanliness: 2, Service: 2, Food: 3, Activities: 3 }, comments: 'Room was not ready at check-in and the AC was noisy all night.', createdAt: new Date(Date.now() - 90 * 60000).toISOString(), resolved: false, resolutionNote: '' },
  { id: 'fb_seed_2', guestName: 'Sophia Reyes', roomNumber: '312', overall: 5, ratings: { Room: 5, Cleanliness: 5, Service: 5, Food: 4, Activities: 5 }, comments: 'Wonderful stay, the snorkeling excursion was the highlight!', createdAt: new Date(Date.now() - 400 * 60000).toISOString(), resolved: true, resolutionNote: '' },
];
