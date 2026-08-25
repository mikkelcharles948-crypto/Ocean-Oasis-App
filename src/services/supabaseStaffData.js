import { supabase } from '../lib/supabase';
import { mapServiceRequest, mapActivity, mapEvent, mapPromotion, mapBooking, mapNotification } from './supabaseData';

// notifications.id has no DB-generated default (unlike the other tables), so
// staff/guest-originated inserts need a client-side id.
const generateId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

const guestName = (row) => {
  const g = row.guest_profile || row.guests;
  return `${g?.first_name || ''} ${g?.last_name || ''}`.trim();
};
const guestRoomNumber = (row) => (row.guests?.reservations || [])[0]?.rooms?.number || null;

export function mapProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    role: row.role,
    department: row.department,
    phone: row.phone || '',
    avatarUrl: row.avatar_url || null,
  };
}

export function mapMaintenanceIssue(row) {
  return row ? { ...row, roomNumber: row.room_number, assignedStaffId: row.assigned_staff_id, createdAt: row.created_at, resolvedAt: row.resolved_at } : row;
}

export function mapContentItem(row) {
  return row ? { ...row, updatedAt: row.updated_at, createdAt: row.created_at } : row;
}

export function mapAuditLog(row) {
  return row ? { id: row.id, actorName: row.actor_name, actorRole: row.actor_role, action: row.action, metadata: row.metadata, timestamp: row.created_at } : row;
}

function mapStaffGuest(row) {
  const reservation = (row.reservations || [])[0] || null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    roomNumber: reservation?.rooms?.number || null,
    reservationNumber: reservation?.reservation_number || null,
    checkIn: reservation?.check_in || null,
    checkOut: reservation?.check_out || null,
    housekeepingPreference: reservation?.housekeeping_preference || 'DAILY_CLEANING',
  };
}

export async function loadStaffDirectory() {
  const { data, error } = await supabase.from('profiles').select('*').not('role', 'is', null).order('first_name');
  if (error) throw error;
  return (data || []).map(mapProfile);
}

export async function loadStaffData() {
  const [
    requestsResult, roomsResult, activitiesResult, eventsResult, promotionsResult,
    bookingsResult, maintenanceResult, feedbackResult, contentResult, auditResult,
    notificationsResult, guestsResult,
  ] = await Promise.all([
    supabase.from('service_requests').select('*, guests(first_name, last_name)').order('created_at', { ascending: false }),
    supabase.from('rooms').select('*').order('number'),
    supabase.from('activities').select('*').order('activity_date', { ascending: false }),
    supabase.from('events').select('*').order('event_date', { ascending: false }),
    supabase.from('promotions').select('*').order('created_at', { ascending: false }),
    // Aliased to `guest_profile` — `activity_bookings` already has its own
    // `guests` integer column (headcount), which collides with and gets
    // silently overwritten by an embed named `guests` for the guest_id FK.
    supabase.from('activity_bookings').select('*, guest_profile:guests(first_name, last_name)').order('created_at', { ascending: false }),
    supabase.from('maintenance_issues').select('*').order('created_at', { ascending: false }),
    supabase.from('feedback').select('*, guests(first_name, last_name, reservations(check_in, rooms(number)))').order('created_at', { ascending: false }),
    supabase.from('content_items').select('*').order('updated_at', { ascending: false }),
    supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('notifications').select('*').not('recipient_role', 'is', null).order('created_at', { ascending: false }),
    supabase.from('guests').select('id, first_name, last_name, reservations(id, reservation_number, check_in, check_out, housekeeping_preference, rooms(number))').order('created_at', { ascending: false }),
  ]);
  const failed = [
    requestsResult, roomsResult, activitiesResult, eventsResult, promotionsResult, bookingsResult,
    maintenanceResult, feedbackResult, contentResult, auditResult, notificationsResult, guestsResult,
  ].find((r) => r.error);
  if (failed) throw failed.error;

  return {
    serviceRequests: (requestsResult.data || []).map((row) => ({ ...mapServiceRequest(row), guestName: guestName(row) })),
    rooms: roomsResult.data || [],
    activities: (activitiesResult.data || []).map(mapActivity),
    events: (eventsResult.data || []).map(mapEvent),
    promotions: (promotionsResult.data || []).map(mapPromotion),
    activityBookings: (bookingsResult.data || []).map((row) => ({ ...mapBooking(row), guestName: guestName(row) })),
    maintenanceIssues: (maintenanceResult.data || []).map(mapMaintenanceIssue),
    feedback: (feedbackResult.data || []).map((row) => ({ ...row, guestName: guestName(row), roomNumber: guestRoomNumber(row) })),
    contentItems: (contentResult.data || []).map(mapContentItem),
    auditLog: (auditResult.data || []).map(mapAuditLog),
    staffNotifications: (notificationsResult.data || []).map(mapNotification),
    allGuestsForStaff: (guestsResult.data || []).map(mapStaffGuest),
  };
}

export async function writeAuditEntry(actorId, actorName, actorRole, action, metadata = {}) {
  const { error } = await supabase.from('audit_log').insert({ actor_id: actorId, actor_name: actorName, actor_role: actorRole, action, metadata });
  if (error) throw error;
}

export async function assignServiceRequest(requestId, staffId, currentStatus) {
  const changes = { assigned_staff_id: staffId };
  if (currentStatus === 'Received') changes.status = 'Assigned';
  const { data, error } = await supabase.from('service_requests').update(changes).eq('id', requestId).select('*, guests(first_name, last_name)').single();
  if (error) throw error;
  return { ...mapServiceRequest(data), guestName: guestName(data) };
}

export async function addServiceRequestNote(requestId, text, staffName) {
  const { data: current, error: fetchError } = await supabase.from('service_requests').select('notes').eq('id', requestId).single();
  if (fetchError) throw fetchError;
  const notes = [...(current.notes || []), { text, by: staffName, at: new Date().toISOString() }];
  const { data, error } = await supabase.from('service_requests').update({ notes }).eq('id', requestId).select('*, guests(first_name, last_name)').single();
  if (error) throw error;
  return { ...mapServiceRequest(data), guestName: guestName(data) };
}

export async function createActivity(payload, actorId) {
  const { data, error } = await supabase.from('activities').insert({
    name: payload.name,
    category: payload.category,
    short_description: payload.shortDescription || null,
    description: payload.description || null,
    activity_date: payload.date || null,
    activity_time: payload.time || null,
    duration: payload.duration || null,
    price_value: payload.priceValue || 0,
    price: payload.price || null,
    capacity: payload.capacity || 1,
    availability: payload.availability || 'Available',
    location: payload.location || null,
    meeting_point: payload.meetingPoint || null,
    what_to_bring: payload.whatToBring || [],
    cancellation_policy: payload.cancellationPolicy || 'Free cancellation up to 24 hours before the activity.',
    image: payload.image || null,
    created_by: actorId,
  }).select().single();
  if (error) throw error;
  return mapActivity(data);
}

export async function createEvent(payload, actorId) {
  const { data, error } = await supabase.from('events').insert({
    title: payload.title,
    category: payload.category || null,
    event_date: payload.date || null,
    event_time: payload.time || null,
    location: payload.location || null,
    description: payload.description || null,
    icon: payload.icon || 'culture',
    capacity: payload.capacity || null,
    created_by: actorId,
  }).select().single();
  if (error) throw error;
  return mapEvent(data);
}

export async function publishEvent(eventId) {
  const { data, error } = await supabase.from('events').update({ status: 'PUBLISHED' }).eq('id', eventId).select().single();
  if (error) throw error;
  return mapEvent(data);
}

export async function createPromotion(payload, actorId) {
  const { data, error } = await supabase.from('promotions').insert({
    title: payload.title,
    description: payload.description || null,
    validity: payload.validity || null,
    terms: payload.terms || null,
    image: payload.image || null,
    target_audience: payload.targetAudience || null,
    created_by: actorId,
  }).select().single();
  if (error) throw error;
  return mapPromotion(data);
}

export async function publishPromotion(promoId) {
  const { data, error } = await supabase.from('promotions').update({ status: 'PUBLISHED' }).eq('id', promoId).select().single();
  if (error) throw error;
  return mapPromotion(data);
}

export async function archivePromotion(promoId) {
  const { data, error } = await supabase.from('promotions').update({ status: 'ARCHIVED' }).eq('id', promoId).select().single();
  if (error) throw error;
  return mapPromotion(data);
}

export async function updateRoomStatus(roomId, status) {
  const { data, error } = await supabase.from('rooms').update({ status }).eq('id', roomId).select().single();
  if (error) throw error;
  return data;
}

export async function createMaintenanceIssue(payload) {
  const { data, error } = await supabase.from('maintenance_issues').insert({
    room_number: payload.roomNumber,
    category: payload.category,
    severity: payload.severity || 'MEDIUM',
    description: payload.description || null,
  }).select().single();
  if (error) throw error;
  return mapMaintenanceIssue(data);
}

export async function updateMaintenanceStatus(issueId, status) {
  const changes = { status };
  if (status === 'RESOLVED') changes.resolved_at = new Date().toISOString();
  const { data, error } = await supabase.from('maintenance_issues').update(changes).eq('id', issueId).select().single();
  if (error) throw error;
  return mapMaintenanceIssue(data);
}

export async function resolveFeedback(feedbackId, note) {
  const { data, error } = await supabase.from('feedback').update({ resolved: true, resolution_note: note }).eq('id', feedbackId).select().single();
  if (error) throw error;
  return data;
}

export async function setContentStatus(contentId, status) {
  const { data, error } = await supabase.from('content_items').update({ status }).eq('id', contentId).select().single();
  if (error) throw error;
  return mapContentItem(data);
}

export async function notifyStaffRole(role, { category, title, body }) {
  const { error } = await supabase.from('notifications').insert({
    id: generateId('n'),
    recipient_role: role,
    category,
    title,
    body: body || null,
  });
  if (error) throw error;
}

export async function markNotificationRead(id) {
  const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', id).select().single();
  if (error) throw error;
  return mapNotification(data);
}

export async function markAllStaffNotificationsRead(ids) {
  if (!ids?.length) return;
  const { error } = await supabase.from('notifications').update({ read: true }).in('id', ids);
  if (error) throw error;
}

// Fans out an in-app notification to every currently-staying guest and all
// staff/management (see the broadcast_emergency_alert migration). Also
// invokes the send-push-broadcast Edge Function so anyone with the app
// backgrounded gets a real OS push, not just an in-app banner; push delivery
// failing (e.g. the function isn't deployed yet) never blocks the in-app
// broadcast, which is the safety-critical part.
export async function sendEmergencyBroadcast(title, body) {
  const { data, error } = await supabase.rpc('broadcast_emergency_alert', { p_title: title, p_body: body });
  if (error) throw error;
  try {
    await supabase.functions.invoke('send-push-broadcast', { body: { title, body } });
  } catch (pushError) {
    // Non-fatal — in-app notifications already went out above.
  }
  return data;
}
