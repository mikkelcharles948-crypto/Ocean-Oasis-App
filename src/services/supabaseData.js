import { supabase } from '../lib/supabase';

const first = (rows) => rows?.[0] || null;

// feedback.id has no server-side default (unlike service_requests/activities/
// events/etc., which all got one in the generated_ids_and_secure_roles
// migration — feedback was missed), so the client has to supply one on
// insert, same pattern already used for notifications in supabaseStaffData.js.
const generateId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export function mapGuest(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email || '',
    phone: row.phone || '',
    loyaltyTier: row.loyalty_tier || '',
    language: row.language || 'English',
    interests: row.interests || [],
    hotelId: row.hotel_id || null,
  };
}

export function mapReservation(row) {
  if (!row) return null;
  return {
    id: row.id,
    reservationNumber: row.reservation_number,
    guestId: row.guest_id,
    roomId: row.room_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: row.nights,
    adults: row.adults,
    children: row.children,
    status: row.status,
    arrivalTime: row.arrival_time,
    arrivalTransport: row.arrival_transport,
    airportTransfer: row.airport_transfer,
    specialRequests: row.special_requests,
    preferences: row.preferences || [],
    housekeepingPreference: row.housekeeping_preference || 'DAILY_CLEANING',
  };
}

export function mapActivity(row) {
  return row ? { ...row, shortDescription: row.short_description, priceValue: Number(row.price_value || 0), date: row.activity_date, time: row.activity_time, whatToBring: row.what_to_bring || [], meetingPoint: row.meeting_point, cancellationPolicy: row.cancellation_policy, imageUrl: row.image_url } : row;
}

export function mapEvent(row) {
  return row ? { ...row, date: row.event_date, time: row.event_time, imageUrl: row.image_url } : row;
}

export function mapPromotion(row) {
  return row ? { ...row, targetAudience: row.target_audience, imageUrl: row.image_url } : row;
}

export function mapServiceRequest(row) {
  return row ? { ...row, preferredTime: row.preferred_time, assignedStaffId: row.assigned_staff_id, createdAt: row.created_at, completedAt: row.completed_at, guestName: row.guest_name || '' } : row;
}

export function mapBooking(row) {
  return row ? { ...row, activityId: row.activity_id, guestId: row.guest_id, createdAt: row.created_at } : row;
}

export function mapNotification(row) {
  return row ? { ...row, createdAt: row.created_at } : row;
}

// Destination/dining-venue photos staff have replaced via the Photo
// Library (see supabaseStaffData.js's updatePhotoOverride) — keyed by the
// same slot_key screens look it up with, e.g. "destination:d_1". Loaded
// independently of guest/staff data since it's identical for everyone and
// isn't scoped to one guest.
export async function loadPhotoOverrides() {
  const { data, error } = await supabase.from('photo_overrides').select('*');
  if (error) throw error;
  const map = {};
  (data || []).forEach((row) => {
    map[row.slot_key] = { imageUrl: row.image_url, label: row.label, category: row.category };
  });
  return map;
}

// The signed-in guest/staff member's own hotel row — hotels_own_read RLS
// only ever lets this return the caller's own hotel, never another one.
// Used to drive whatever dynamic branding (logo, name) is wired up to read
// it; most of the app's color palette is still the shared static theme
// (see src/theme/theme.js) since it's baked in at bundle-load time via
// StyleSheet.create, not re-readable per hotel yet.
export async function loadHotelBranding(hotelId) {
  if (!hotelId) return null;
  const { data, error } = await supabase.from('hotels').select('id, name, theme').eq('id', hotelId).maybeSingle();
  if (error) throw error;
  return data ? { id: data.id, name: data.name, theme: data.theme || {} } : null;
}

export async function loadGuestData(userId) {
  const guestResult = await supabase.from('guests').select('*').eq('auth_user_id', userId).maybeSingle();
  if (guestResult.error) throw guestResult.error;
  const guest = guestResult.data;
  if (!guest) return { guest: null, reservation: null, rooms: [], serviceRequests: [], activityBookings: [], feedback: [], notifications: [], activities: [], events: [], promotions: [], savedEventIds: [] };

  const [reservationResult, roomResult, requestResult, bookingResult, feedbackResult, notificationResult, activityResult, eventResult, promotionResult, savedEventResult] = await Promise.all([
    supabase.from('reservations').select('*').eq('guest_id', guest.id).order('check_in', { ascending: false }),
    supabase.from('rooms').select('*'),
    supabase.from('service_requests').select('*').eq('guest_id', guest.id).order('created_at', { ascending: false }),
    supabase.from('activity_bookings').select('*').eq('guest_id', guest.id).order('created_at', { ascending: false }),
    supabase.from('feedback').select('*').eq('guest_id', guest.id).order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').eq('recipient_user_id', userId).order('created_at', { ascending: false }),
    supabase.from('activities').select('*').eq('status', 'PUBLISHED').order('activity_date'),
    supabase.from('events').select('*').eq('status', 'PUBLISHED').order('event_date'),
    supabase.from('promotions').select('*').eq('status', 'PUBLISHED').order('created_at', { ascending: false }),
    supabase.from('itinerary_saved_events').select('event_id').eq('guest_id', guest.id),
  ]);
  const result = [reservationResult, roomResult, requestResult, bookingResult, feedbackResult, notificationResult, activityResult, eventResult, promotionResult, savedEventResult].find((item) => item.error);
  if (result) throw result.error;

  return {
    guest: mapGuest(guest),
    reservation: mapReservation(first(reservationResult.data)),
    rooms: roomResult.data || [],
    serviceRequests: (requestResult.data || []).map((row) => ({
      ...mapServiceRequest(row),
      guestName: `${guest.first_name} ${guest.last_name}`.trim(),
    })),
    activityBookings: (bookingResult.data || []).map(mapBooking),
    feedback: feedbackResult.data || [],
    notifications: (notificationResult.data || []).map(mapNotification),
    activities: (activityResult.data || []).map(mapActivity),
    events: (eventResult.data || []).map(mapEvent),
    promotions: (promotionResult.data || []).map(mapPromotion),
    savedEventIds: (savedEventResult.data || []).map((row) => row.event_id),
  };
}

export async function createServiceRequest(guestId, roomNumber, request) {
  const { data, error } = await supabase.from('service_requests').insert({
    guest_id: guestId,
    room_number: roomNumber,
    category: request.category,
    description: request.description || null,
    preferred_time: request.preferredTime || null,
    department: request.department || null,
    priority: request.priority || 'NORMAL',
  }).select().single();
  if (error) throw error;
  return mapServiceRequest(data);
}

export async function bookActivity(activityId, guests) {
  const { data, error } = await supabase.rpc('book_activity', {
    requested_activity_id: activityId,
    requested_guests: guests,
  });
  if (error) throw error;
  return mapBooking(data);
}

export async function searchAvailableRooms(checkIn, checkOut, roomType, guests) {
  const { data, error } = await supabase.rpc('search_available_rooms', {
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_room_type: roomType || null,
    p_guests: guests || 1,
  });
  if (error) throw error;
  return data || [];
}

export async function createReservation({ roomId, checkIn, checkOut, adults, children, specialRequests, arrivalTime }) {
  const { data, error } = await supabase.rpc('create_reservation', {
    p_room_id: roomId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_adults: adults,
    p_children: children || 0,
    p_special_requests: specialRequests || null,
    p_arrival_time: arrivalTime || null,
  });
  if (error) throw error;
  return mapReservation(data);
}

export async function updateServiceRequest(requestId, changes) {
  const { data, error } = await supabase.from('service_requests').update(changes).eq('id', requestId).select().single();
  if (error) throw error;
  return mapServiceRequest(data);
}

export async function loadPastStays(guestId) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, rooms(number, type)')
    .eq('guest_id', guestId)
    .order('check_in', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...mapReservation(row),
    roomNumber: row.rooms?.number || null,
    roomType: row.rooms?.type || null,
  }));
}

export async function createFeedback(guestId, { overall, ratings, comments, resolved }) {
  const { data, error } = await supabase.from('feedback').insert({
    id: generateId('fb'),
    guest_id: guestId,
    overall,
    ratings: ratings || {},
    comments: comments || null,
    resolved,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function completeGuestCheckIn(reservationId, details) {
  const { data, error } = await supabase.rpc('complete_guest_checkin', {
    p_reservation_id: reservationId,
    p_arrival_time: details?.arrivalTime ?? null,
    p_arrival_transport: details?.arrivalTransport ?? null,
    p_special_requests: details?.specialRequests ?? null,
    p_preferences: details?.arrivalPreferences ?? null,
  });
  if (error) throw error;
  return mapReservation(data);
}

export async function completeRoomUpgrade(requestId, newRoomId) {
  const { data, error } = await supabase.rpc('complete_room_upgrade', {
    p_request_id: requestId,
    p_new_room_id: newRoomId,
  });
  if (error) throw error;
  return mapServiceRequest(data);
}

export async function loadSavedEvents(guestId) {
  const { data, error } = await supabase.from('itinerary_saved_events').select('event_id').eq('guest_id', guestId);
  if (error) throw error;
  return (data || []).map((row) => row.event_id);
}

export async function saveEventToItinerary(guestId, eventId) {
  const { error } = await supabase.from('itinerary_saved_events').insert({ guest_id: guestId, event_id: eventId });
  if (error && error.code !== '23505') throw error; // 23505 = already saved, treat as success
}

export async function removeSavedEvent(guestId, eventId) {
  const { error } = await supabase.from('itinerary_saved_events').delete().eq('guest_id', guestId).eq('event_id', eventId);
  if (error) throw error;
}

export async function setHousekeepingPreference(reservationId, preference) {
  const { data, error } = await supabase.rpc('set_housekeeping_preference', {
    p_reservation_id: reservationId,
    p_preference: preference,
  });
  if (error) throw error;
  return mapReservation(data);
}

export async function registerPushToken(userId, token, platform) {
  const { error } = await supabase.from('push_tokens').upsert(
    { user_id: userId, token, platform },
    { onConflict: 'token' }
  );
  if (error) throw error;
}

export async function updateGuestProfile(guestId, changes) {
  const { data, error } = await supabase.from('guests').update(changes).eq('id', guestId).select().single();
  if (error) throw error;
  return mapGuest(data);
}

export function mapConciergeMessage(row) {
  if (!row) return null;
  return { id: row.id, conversationId: row.conversation_id, role: row.role, content: row.content, createdAt: row.created_at };
}

// The Edge Function (supabase/functions/concierge-chat) holds the actual
// Anthropic API key server-side and is the only thing that ever calls it —
// this just invokes it and inserts nothing itself. faqContext is the
// already-localized static hotel FAQ (src/data/mockData.js's CONCIERGE_FAQ,
// via getLocalizedContent) — sent per-call rather than duplicated inside
// the Edge Function, so hotel facts still have exactly one source of truth.
export async function sendConciergeMessage(conversationId, message, faqContext) {
  const { data, error } = await supabase.functions.invoke('concierge-chat', {
    body: { conversationId, message, faqContext },
  });
  if (error) throw error;
  return data;
}

export async function loadConciergeMessages(conversationId) {
  const { data, error } = await supabase
    .from('concierge_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapConciergeMessage);
}
