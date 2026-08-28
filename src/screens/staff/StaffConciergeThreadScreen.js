import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text } from '../../components/AppText';
import { TextInput } from '../../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Badge } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const STATUS_TONE = { active: 'info', escalated: 'warning', resolved: 'success' };

export default function StaffConciergeThreadScreen({ route, navigation }) {
  const { conversationId, guestName } = route.params;
  const { t } = useTranslation();
  const { loadStaffConciergeThread, replyToConcierge, resolveConcierge, conciergeConversations } = useApp();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const conversation = conciergeConversations.find((c) => c.id === conversationId);

  const refresh = useCallback(() => {
    loadStaffConciergeThread(conversationId).then((thread) => {
      setMessages(thread);
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
    });
  }, [conversationId, loadStaffConciergeThread]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel(`staff-concierge-thread-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'concierge_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const row = payload.new;
        if (!row?.id) return;
        setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, { id: row.id, role: row.role, content: row.content, createdAt: row.created_at }]));
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [conversationId]);

  const send = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    const result = await replyToConcierge(conversationId, reply.trim());
    setSending(false);
    if (!result?.ok) {
      Alert.alert(t('common.somethingWrong'), result?.error);
      return;
    }
    setReply('');
  };

  const handleResolve = async () => {
    const result = await resolveConcierge(conversationId);
    if (!result?.ok) Alert.alert(t('common.somethingWrong'), result?.error);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader
        title={guestName || t('staff.concierge.unknownGuest')}
        onBack={() => navigation.goBack()}
        right={conversation ? <Badge label={t(`staff.concierge.status.${conversation.status}`)} tone={STATUS_TONE[conversation.status] || 'neutral'} /> : null}
      />

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator color={colors.deepOcean} /></View>
      ) : (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.chatArea} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {messages.map((m) => (
            <View key={m.id} style={[styles.bubbleRow, m.role !== 'guest' && styles.bubbleRowRight]}>
              <Text style={styles.roleLabel}>{t(`staff.concierge.role.${m.role}`)}</Text>
              <View style={[styles.bubble, m.role === 'guest' ? styles.bubbleGuest : m.role === 'assistant' ? styles.bubbleAssistant : styles.bubbleStaff]}>
                <Text style={[styles.bubbleText, m.role !== 'guest' && { color: colors.white }]}>{m.content}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {conversation?.status !== 'resolved' && (
        <View style={styles.footer}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={reply}
              onChangeText={setReply}
              placeholder={t('staff.concierge.replyPlaceholder')}
              placeholderTextColor={colors.slate}
              multiline
              editable={!sending}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={sending} accessibilityRole="button" accessibilityLabel={t('common.send')}>
              <Ionicons name="send" size={17} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Button label={t('staff.concierge.markResolved')} variant="outline" onPress={handleResolve} style={{ marginTop: spacing.sm }} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chatArea: { padding: spacing.lg, gap: spacing.sm },
  bubbleRow: { alignItems: 'flex-start' },
  bubbleRowRight: { alignItems: 'flex-end' },
  roleLabel: { fontSize: 10, fontWeight: '700', color: colors.slate, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  bubble: { maxWidth: '82%', borderRadius: radius.lg, padding: spacing.sm, paddingHorizontal: spacing.md },
  bubbleGuest: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderTopLeftRadius: 4 },
  bubbleAssistant: { backgroundColor: colors.slate, borderTopRightRadius: 4 },
  bubbleStaff: { backgroundColor: colors.deepOcean, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 13.5, color: colors.charcoal, lineHeight: 19 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1, backgroundColor: colors.sandLight, borderRadius: radius.lg, maxHeight: 100,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 13.5, color: colors.charcoal,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
});
