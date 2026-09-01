// Backs the guest-facing AI concierge (src/screens/concierge/ConciergeScreen.js).
// Calling an LLM API key directly from the app is never safe — anyone can
// extract it from the built APK/IPA — so this Edge Function holds the key
// and is the only thing that ever talks to Anthropic.
//
// Deploy with: npx supabase functions deploy concierge-chat --project-ref <ref>
// Requires one secret that isn't set automatically:
//   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref <ref>
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by
// Supabase for every Edge Function, same as send-push-broadcast.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';
const ESCALATE_MARKER = '[[ESCALATE]]';
const HANDOFF_PHRASES = ['talk to a person', 'speak to a person', 'human please', 'real person', 'speak to staff', 'talk to staff', 'talk to someone'];

Deno.serve(async (req) => {
  try {
    const { conversationId, message, faqContext } = await req.json();
    if (!message || typeof message !== 'string' || !message.trim()) {
      return json({ error: 'message is required' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get('Authorization') || '';
    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !userData?.user) return json({ error: 'Unauthorized' }, 401);

    const { data: guest } = await supabase
      .from('guests')
      .select('id, first_name, last_name, interests, hotel_id')
      .eq('auth_user_id', userData.user.id)
      .maybeSingle();
    if (!guest) return json({ error: 'No guest profile for this account' }, 403);
    if (!guest.hotel_id) return json({ error: 'No active hotel stay on this account yet' }, 403);

    const { data: hotel } = await supabase
      .from('hotels')
      .select('name, address')
      .eq('id', guest.hotel_id)
      .maybeSingle();

    // Resolve or create the conversation, and make sure it actually
    // belongs to this guest rather than trusting the client-supplied id.
    let conversation;
    if (conversationId) {
      const { data } = await supabase.from('concierge_conversations').select('*').eq('id', conversationId).eq('guest_id', guest.id).maybeSingle();
      conversation = data;
    }
    if (!conversation) {
      const { data, error } = await supabase.from('concierge_conversations').insert({ guest_id: guest.id, hotel_id: guest.hotel_id }).select().single();
      if (error) throw error;
      conversation = data;
    }

    const { error: insertGuestMsgError } = await supabase
      .from('concierge_messages')
      .insert({ conversation_id: conversation.id, role: 'guest', content: message.trim() });
    if (insertGuestMsgError) throw insertGuestMsgError;

    // Once staff have taken this over, the AI stays out of it entirely —
    // both to avoid a guest getting two different answers to the same
    // question, and so a staff member isn't quietly overridden mid-handoff.
    if (conversation.status !== 'active') {
      return json({ conversationId: conversation.id, reply: null, handedOff: true });
    }

    const lowerMessage = message.toLowerCase();
    const explicitHandoffRequested = HANDOFF_PHRASES.some((p) => lowerMessage.includes(p));

    const { data: history } = await supabase
      .from('concierge_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(40);

    const [reservationRes, activitiesRes, eventsRes, promotionsRes] = await Promise.all([
      supabase
        .from('reservations')
        .select('check_in, check_out, status, rooms(number, type)')
        .eq('guest_id', guest.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from('activities').select('name, category, short_description, price, duration').eq('status', 'PUBLISHED').eq('hotel_id', guest.hotel_id).limit(25),
      supabase.from('events').select('title, category, date, time, location, description').eq('status', 'PUBLISHED').eq('hotel_id', guest.hotel_id).limit(25),
      supabase.from('promotions').select('title, description, validity').eq('status', 'PUBLISHED').eq('hotel_id', guest.hotel_id).limit(15),
    ]);

    const systemPrompt = buildSystemPrompt({
      guest,
      hotel,
      reservation: reservationRes.data,
      activities: activitiesRes.data || [],
      events: eventsRes.data || [],
      promotions: promotionsRes.data || [],
      faqContext: Array.isArray(faqContext) ? faqContext : [],
    });

    let replyText;
    let modelEscalated = false;

    if (explicitHandoffRequested || !anthropicKey) {
      // No model call needed for an explicit ask, and this is also the
      // safe fallback if ANTHROPIC_API_KEY hasn't been configured yet —
      // escalate to a human rather than silently failing the guest.
      replyText = explicitHandoffRequested
        ? "Of course — I'm connecting you with our team now."
        : "I'll get our concierge team to help you with that directly.";
      modelEscalated = true;
    } else {
      const anthropicMessages = (history || [])
        .filter((m) => m.role !== 'staff')
        .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

      const resp = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 500,
          system: systemPrompt,
          messages: anthropicMessages,
        }),
      });

      if (!resp.ok) {
        replyText = "I'm having trouble reaching our concierge system right now — I'll get a team member to help instead.";
        modelEscalated = true;
      } else {
        const body = await resp.json();
        const raw = (body?.content || []).map((block) => block.text || '').join('').trim();
        modelEscalated = raw.includes(ESCALATE_MARKER);
        replyText = raw.replace(ESCALATE_MARKER, '').trim() || "Let me get someone from our team to help with that.";
      }
    }

    await supabase.from('concierge_messages').insert({ conversation_id: conversation.id, role: 'assistant', content: replyText });

    const shouldEscalate = explicitHandoffRequested || modelEscalated;
    if (shouldEscalate) {
      const roomNumber = reservationRes.data?.rooms?.number || null;
      const { data: request } = await supabase
        .from('service_requests')
        .insert({
          guest_id: guest.id,
          room_number: roomNumber,
          category: 'Concierge',
          department: 'Concierge',
          description: `Escalated from AI concierge chat. Guest's message: "${message.trim()}"`,
          hotel_id: guest.hotel_id,
        })
        .select()
        .single();

      await supabase.from('concierge_conversations').update({ status: 'escalated', escalated_request_id: request?.id || null }).eq('id', conversation.id);

      await supabase.from('notifications').insert({
        id: `notif_${crypto.randomUUID()}`,
        recipient_role: 'CONCIERGE',
        category: 'Concierge',
        title: 'Guest needs help — AI concierge handoff',
        body: `${guest.first_name} ${guest.last_name}: "${message.trim()}"`,
        hotel_id: guest.hotel_id,
      });
    }

    return json({ conversationId: conversation.id, reply: replyText, escalated: shouldEscalate });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function buildSystemPrompt({ guest, hotel, reservation, activities, events, promotions, faqContext }) {
  const stay = reservation
    ? `They are staying in a ${reservation.rooms?.type || 'room'} (room ${reservation.rooms?.number || 'unassigned'}), check-in ${reservation.check_in}, check-out ${reservation.check_out}, status: ${reservation.status}.`
    : 'They do not have an active reservation on file.';

  const faqBlock = faqContext.length
    ? faqContext.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : '(none provided)';

  const hotelDescriptor = hotel?.name
    ? `${hotel.name}${hotel.address ? `, a real hotel at ${hotel.address}` : ''}`
    : 'this hotel';

  return `You are the AI concierge for ${hotelDescriptor}. You are chatting with ${guest.first_name}, a current guest. ${stay}

Only answer using the hotel information below and the guest's own stay details above. Never invent prices, hours, availability, or policies that aren't given to you here — if you don't have the real answer, say so plainly and end your reply with the exact text ${ESCALATE_MARKER} on its own, which will connect them with a real staff member. Keep replies short and warm, like a real concierge — a few sentences, not a list, unless the guest asked for a list.

CURRENT PUBLISHED ACTIVITIES:
${JSON.stringify(activities)}

CURRENT PUBLISHED EVENTS:
${JSON.stringify(events)}

CURRENT PROMOTIONS:
${JSON.stringify(promotions)}

HOTEL FAQ:
${faqBlock}`;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
