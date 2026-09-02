import { supabase } from '../lib/supabase';

// Mirrors supabaseStaffData.js's shape: row mappers + plain async functions,
// consumed only by the hidden Platform Admin surface (MCX Technologies'
// layer above every hotel). RLS (hotels_platform_admin_all) is the real
// gate here — these functions assume the caller is already a signed-in
// PLATFORM_ADMIN and simply let Postgres reject anyone else.

export function mapHotel(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    code: row.code,
    name: row.name,
    legalName: row.legal_name || '',
    address: row.address || '',
    phone: row.phone || '',
    email: row.email || '',
    timezone: row.timezone,
    currency: row.currency,
    theme: row.theme || {},
    status: row.status,
    plan: row.plan,
    mrr: Number(row.mrr || 0),
    createdAt: row.created_at,
  };
}

export async function loadHotels() {
  const { data, error } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapHotel);
}

export async function createHotel({ slug, code, name, legalName, address, phone, email, timezone, currency, theme }) {
  const { data, error } = await supabase.from('hotels').insert({
    slug: slug.trim(),
    code: code.trim().toUpperCase(),
    name: name.trim(),
    legal_name: legalName || null,
    address: address || null,
    phone: phone || null,
    email: email || null,
    timezone: timezone || 'UTC',
    currency: currency || 'USD',
    theme: theme || {},
  }).select().single();
  if (error) throw error;
  return mapHotel(data);
}

export function mapPlatformProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || '(unnamed)',
    role: row.role,
    hotelId: row.hotel_id,
    department: row.department,
  };
}

// Every profile with a role set (i.e. every staff/management/platform-admin
// account) — profiles_self_or_authorized_staff's `or is_platform_admin()`
// clause (from Phase 1) is what actually allows this cross-hotel read.
export async function loadStaffProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').not('role', 'is', null).order('first_name');
  if (error) throw error;
  return (data || []).map(mapPlatformProfile);
}

export async function assignStaff(profileId, role, hotelId, department) {
  const { data, error } = await supabase.rpc('platform_assign_staff', {
    p_profile_id: profileId,
    p_role: role,
    p_hotel_id: hotelId,
    p_department: department || null,
  });
  if (error) throw error;
  return mapPlatformProfile(data);
}

export async function updateHotel(hotelId, changes) {
  const payload = {};
  if (changes.name !== undefined) payload.name = changes.name;
  if (changes.legalName !== undefined) payload.legal_name = changes.legalName;
  if (changes.address !== undefined) payload.address = changes.address;
  if (changes.phone !== undefined) payload.phone = changes.phone;
  if (changes.email !== undefined) payload.email = changes.email;
  if (changes.timezone !== undefined) payload.timezone = changes.timezone;
  if (changes.currency !== undefined) payload.currency = changes.currency;
  if (changes.status !== undefined) payload.status = changes.status;
  if (changes.theme !== undefined) payload.theme = changes.theme;
  if (changes.plan !== undefined) payload.plan = changes.plan;
  if (changes.mrr !== undefined) payload.mrr = changes.mrr;
  const { data, error } = await supabase.from('hotels').update(payload).eq('id', hotelId).select().single();
  if (error) throw error;
  return mapHotel(data);
}

// Cross-hotel rollups for the platform admin's Analytics screen — plain
// reads + client-side aggregation rather than new RPCs, since
// is_platform_admin() already grants full read access to every one of
// these tables (confirmed during the Phase 6 audit) and the platform's
// current scale (a handful of hotels) doesn't need server-side aggregation.
export async function loadPlatformAnalytics() {
  const [guestsRes, roomsRes, reservationsRes, profilesRes] = await Promise.all([
    supabase.from('guests').select('id, hotel_id'),
    supabase.from('rooms').select('id, hotel_id, status'),
    supabase.from('reservations').select('id, hotel_id, status'),
    supabase.from('profiles').select('id, hotel_id, role').not('role', 'is', null),
  ]);
  const failed = [guestsRes, roomsRes, reservationsRes, profilesRes].find((r) => r.error);
  if (failed) throw failed.error;

  const byHotel = {};
  const bump = (hotelId, key, by = 1) => {
    if (!hotelId) return;
    byHotel[hotelId] = byHotel[hotelId] || { guests: 0, rooms: 0, occupiedRooms: 0, reservations: 0, activeReservations: 0, staff: 0 };
    byHotel[hotelId][key] += by;
  };
  (guestsRes.data || []).forEach((g) => bump(g.hotel_id, 'guests'));
  (roomsRes.data || []).forEach((r) => {
    bump(r.hotel_id, 'rooms');
    if (r.status?.startsWith('OCCUPIED')) bump(r.hotel_id, 'occupiedRooms');
  });
  (reservationsRes.data || []).forEach((r) => {
    bump(r.hotel_id, 'reservations');
    if (r.status === 'confirmed' || r.status === 'checked_in') bump(r.hotel_id, 'activeReservations');
  });
  (profilesRes.data || []).forEach((p) => bump(p.hotel_id, 'staff'));

  return byHotel;
}
