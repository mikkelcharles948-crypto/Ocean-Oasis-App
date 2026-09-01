import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '../../components/AppText';
import { TextInput } from '../../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../components/UI';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, font } from '../../theme/theme';
import { getLocalizedContent } from '../../i18n/content';
import conciergeFaqContent from '../../i18n/content/conciergeFaq';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

// Real AI concierge (supabase/functions/concierge-chat), grounded in the
// hotel's actual live activities/events/promotions and this FAQ content —
// not the old keyword-matching lookup. See sendConciergeMessage in
// AppContext.js for why the FAQ is sent per-request rather than duplicated
// server-side.
export default function ConciergeScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { conciergeConversationId, sendConciergeMessage, loadConciergeThread, conciergeFaqs: CONCIERGE_FAQ } = useApp();
  const [messages, setMessages] = useState([{ id: 'm0', role: 'assistant', text: t('concierge.greeting') }]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(!!conciergeConversationId);
  const [handedOff, setHandedOff] = useState(false);
  const scrollRef = useRef(null);

  const localizedFaq = useMemo(
    () => CONCIERGE_FAQ.map((f) => ({ id: f.id, ...getLocalizedContent(conciergeFaqContent, f.id, i18n.language, f) })),
    [i18n.language]
  );

  useEffect(() => {
    if (!conciergeConversationId) return;
    let mounted = true;
    loadConciergeThread().then((thread) => {
      if (!mounted || !thread?.length) return;
      setMessages(thread.map((m) => ({ id: m.id, role: m.role, text: m.content })));
    }).finally(() => mounted && setLoadingThread(false));
    return () => { mounted = false; };
  }, [conciergeConversationId, loadConciergeThread]);

  // Live-updates the thread if a staff member replies while this screen is
  // open — sendConciergeMessage already returns the AI's own reply directly,
  // so this only ever adds messages this screen didn't already know about.
  useEffect(() => {
    if (!conciergeConversationId) return undefined;
    const channel = supabase
      .channel(`concierge-thread-${conciergeConversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'concierge_messages', filter: `conversation_id=eq.${conciergeConversationId}` }, (payload) => {
        const row = payload.new;
        if (!row?.id) return;
        if (row.role === 'staff') setHandedOff(true);
        setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, { id: row.id, role: row.role, text: row.content }]));
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [conciergeConversationId]);

  const send = useCallback(async (text) => {
    if (!text.trim() || sending) return;
    const userMsg = { id: `u_${Date.now()}`, role: 'guest', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const result = await sendConciergeMessage(text, localizedFaq.map((f) => ({ question: f.question, answer: f.answer })));
    setSending(false);

    if (!result?.ok) {
      setMessages((prev) => [...prev, { id: `e_${Date.now()}`, role: 'assistant', text: t('concierge.fallbackAnswer') }]);
      return;
    }
    if (result.data?.handedOff) {
      setHandedOff(true);
    } else if (result.data?.reply) {
      setMessages((prev) => [...prev, { id: `b_${Date.now()}`, role: 'assistant', text: result.data.reply }]);
      if (result.data.escalated) setHandedOff(true);
    }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [sending, sendConciergeMessage, localizedFaq, t]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('concierge.title')} onBack={() => navigation.goBack()} />

      {handedOff && (
        <View style={styles.handoffBanner}>
          <Ionicons name="people-outline" size={14} color={colors.deepOcean} />
          <Text style={styles.handoffText}>{t('concierge.handoffBanner')}</Text>
        </View>
      )}

      {loadingThread ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.deepOcean} />
        </View>
      ) : (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.chatArea} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.map((m) => (
            <View key={m.id} style={[styles.bubbleRow, m.role === 'guest' && styles.bubbleRowUser]}>
              {m.role === 'staff' && <Text style={styles.staffLabel}>{t('concierge.staffLabel')}</Text>}
              <View style={[styles.bubble, m.role === 'guest' ? styles.bubbleUser : m.role === 'staff' ? styles.bubbleStaff : styles.bubbleBot]}>
                <Text style={[styles.bubbleText, m.role === 'guest' && { color: colors.white }]}>{m.text}</Text>
              </View>
            </View>
          ))}
          {sending && (
            <View style={styles.bubbleRow}>
              <View style={[styles.bubble, styles.bubbleBot]}>
                <ActivityIndicator size="small" color={colors.slate} />
              </View>
            </View>
          )}

          {messages.length === 1 && (
            <View style={styles.suggestedWrap}>
              <Text style={styles.suggestedLabel}>{t('concierge.suggestedQuestions')}</Text>
              {localizedFaq.map((f) => (
                <AnimatedPressable
                  key={f.id}
                  style={styles.suggestedChip}
                  onPress={() => send(f.question)}
                  accessibilityRole="button"
                  accessibilityLabel={f.question}
                >
                  <Text style={styles.suggestedText}>{f.question}</Text>
                  <Ionicons name="arrow-forward" size={13} color={colors.turquoiseDark} />
                </AnimatedPressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t('concierge.inputPlaceholder')}
          placeholderTextColor={colors.slate}
          onSubmitEditing={() => send(input)}
          editable={!sending}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => send(input)}
          accessibilityRole="button"
          accessibilityLabel={t('common.send')}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          disabled={sending}
        >
          <Ionicons name="send" size={17} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  handoffBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E1F2F1',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  handoffText: { fontSize: 12, color: colors.deepOcean, flex: 1 },
  chatArea: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  staffLabel: { fontSize: 10.5, fontWeight: '700', color: colors.turquoiseDark, marginBottom: 2, letterSpacing: 0.5, textTransform: 'uppercase' },
  bubble: { maxWidth: '82%', borderRadius: radius.lg, padding: spacing.sm, paddingHorizontal: spacing.md },
  bubbleBot: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderTopLeftRadius: 4 },
  bubbleStaff: { backgroundColor: '#E1F2F1', borderWidth: 1, borderColor: colors.turquoise, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.deepOcean, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 13.5, color: colors.charcoal, lineHeight: 19 },
  suggestedWrap: { marginTop: spacing.sm, gap: 8 },
  suggestedLabel: { fontSize: 12, fontWeight: '700', color: colors.slate, marginBottom: 4 },
  suggestedChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white,
    borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: colors.border,
  },
  suggestedText: { fontSize: 13, color: colors.charcoal, flex: 1, marginRight: 8 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white,
  },
  input: {
    flex: 1, backgroundColor: colors.sandLight, borderRadius: radius.pill,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 13.5, color: colors.charcoal,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
});
