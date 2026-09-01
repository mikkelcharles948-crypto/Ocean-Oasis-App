// Fans out a real OS-level push notification (via Expo's push service) to
// every registered device in push_tokens. Called by
// src/services/supabaseStaffData.js's sendEmergencyBroadcast() right after
// the in-app notification fan-out, so guests/staff who have the app
// backgrounded or closed still get alerted for safety-critical broadcasts
// (building evacuations, severe weather, security updates).
//
// Deploy with: npx supabase functions deploy send-push-broadcast --project-ref <ref>
// Requires SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL, which Supabase sets
// automatically for every Edge Function — no manual secret configuration
// needed for those two.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  try {
    const { title, body } = await req.json();
    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body are required' }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // verify_jwt only proves the caller is signed in, not that they're
    // staff — check role explicitly so a guest account can't trigger a
    // broadcast to everyone by calling this function directly.
    const authHeader = req.headers.get('Authorization') || '';
    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const { data: profile } = await supabase.from('profiles').select('role, hotel_id').eq('id', userData.user.id).maybeSingle();
    if (!profile?.role) {
      return new Response(JSON.stringify({ error: 'Staff access required' }), { status: 403 });
    }
    // Every hotel on the platform shares this one function — without this,
    // any staff member at any hotel could push-notify every device
    // registered across every other hotel too.
    if (!profile.hotel_id) {
      return new Response(JSON.stringify({ error: 'No hotel assigned to this account' }), { status: 403 });
    }

    const { data: tokens, error } = await supabase.from('push_tokens').select('token').eq('hotel_id', profile.hotel_id);
    if (error) throw error;

    const messages = (tokens || [])
      .filter((t) => t.token?.startsWith('ExponentPushToken'))
      .map((t) => ({
        to: t.token,
        title,
        body,
        sound: 'default',
        priority: 'high',
        channelId: 'emergency',
      }));

    if (messages.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // Expo accepts up to 100 messages per request — chunk defensively.
    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));

    let sent = 0;
    for (const chunk of chunks) {
      const resp = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk),
      });
      if (resp.ok) sent += chunk.length;
    }

    return new Response(JSON.stringify({ sent }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
