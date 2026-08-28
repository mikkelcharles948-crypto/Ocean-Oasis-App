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
    airportTransfer: row.airport_transfer,
    specialRequests: row.special_requests,
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

export async function loadGuestData(userId) {
  const guestResult = await supabase.from('guests').select('*').eq('auth_user_id', userId).maybeSingle();
  if (guestResult.error) throw guestResult.error;
  const guest = guestResult.data;
  if (!guest) return { guest: null, reservation: null, rooms: [], serviceRequests: [], activityBookings: [], feedback: [], notifications: [], activities: [], events: [], promotions: [] };

  const [reservationResult, roomResult, requestResult, bookingResult, feedbackResult, notificationResult, activityResult, eventResult, promotionResult] = await Promise.all([
    supabase.from('reservations').select('*').eq('guest_id', guest.id).order('check_in', { ascending: false }),
    supabase.from('rooms').select('*'),
    supabase.from('service_requests').select('*').eq('guest_id', guest.id).order('created_at', { ascending: false }),
    supabase.from('activity_bookings').select('*').eq('guest_id', guest.id).order('created_at', { ascending: false }),
    supabase.from('feedback').select('*').eq('guest_id', guest.id).order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').eq('recipient_user_id', userId).order('created_at', { ascending: false }),
    supabase.from('activities').select('*').eq('status', 'PUBLISHED').order('activity_date'),
    supabase.from('events').select('*').eq('status', 'PUBLISHED').order('event_date'),
    supabase.from('promotions').select('*').eq('status', 'PUBLISHED').order('created_at', { ascending: false }),
  ]);
  const result = [reservationResult, roomResult, requestResult, bookingResult, feedbackResult, notificationResult, activityResult, eventResult, promotionResult].find((item) => item.error);
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

export async function completeGuestCheckIn(reservationId) {
  const { data, error } = await supabase.rpc('complete_guest_checkin', { p_reservation_id: reservationId });
  if (error) throw error;
  return mapReservation(data);
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
