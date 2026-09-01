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
    name: row.name,
    legalName: row.legal_name || '',
    address: row.address || '',
    phone: row.phone || '',
    email: row.email || '',
    timezone: row.timezone,
    currency: row.currency,
    theme: row.theme || {},
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function loadHotels() {
  const { data, error } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapHotel);
}

export async function createHotel({ slug, name, legalName, address, phone, email, timezone, currency }) {
  const { data, error } = await supabase.from('hotels').insert({
    slug: slug.trim(),
    name: name.trim(),
    legal_name: legalName || null,
    address: address || null,
    phone: phone || null,
    email: email || null,
    timezone: timezone || 'UTC',
    currency: currency || 'USD',
  }).select().single();
  if (error) throw error;
  return mapHotel(data);
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
  const { data, error } = await supabase.from('hotels').update(payload).eq('id', hotelId).select().single();
  if (error) throw error;
  return mapHotel(data);
}
