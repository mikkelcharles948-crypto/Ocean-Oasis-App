import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, EmptyState, timeAgo } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function StaffFeedbackScreen({ navigation }) {
  const { t } = useTranslation();
  const { feedback, propertySettings, resolveFeedback } = useApp();
  const [filter, setFilter] = useState('ALERTS');
  const [notes, setNotes] = useState({});
  const threshold = propertySettings.lowRatingThreshold || 3;

  const sorted = [...feedback].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filtered = filter === 'ALERTS' ? sorted.filter((f) => f.overall <= threshold && !f.resolved) : filter === 'ALL' ? sorted : sorted.filter((f) => f.overall >= 4);
  const filterLabel = (f) => (f === 'ALERTS' ? t('staff.feedback.filters.alerts') : f === 'ALL' ? t('staff.feedback.filters.all') : t('staff.feedback.filters.positive'));

  const handleResolve = async (feedbackId, note) => {
    const result = await resolveFeedback(feedbackId, note);
    if (!result.ok) Alert.alert(t('common.somethingWrong'), result.error);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('staff.feedback.title')} onBack={() => navigation.goBack()} />
      <View style={styles.filterRow}>
        {['ALERTS', 'ALL', 'POSITIVE'].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterPill, filter === f && styles.filterPillActive]}>
            <Text style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}>{filterLabel(f)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="star-outline" title={t('staff.feedback.empty.title')} subtitle={t('staff.feedback.empty.subtitle')} />}
        renderItem={({ item }) => {
          const isAlert = item.overall <= threshold;
          return (
            <Card style={isAlert && !item.resolved ? { backgroundColor: '#FBF0EC', borderWidth: 1, borderColor: '#EAC3B8' } : {}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.guestName}>{t('staff.feedback.guestRoom', { name: item.guestName, room: item.roomNumber })}</Text>
                  <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={[styles.rating, { color: isAlert ? colors.error : colors.success }]}>{item.overall}/5</Text>
              </View>
              <Text style={styles.comment}>"{item.comments}"</Text>
              {isAlert && !item.resolved && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
                  <TextInput
                    value={notes[item.id] || ''}
                    onChangeText={(v) => setNotes({ ...notes, [item.id]: v })}
                    placeholder={t('staff.feedback.notePlaceholder')}
                    placeholderTextColor={colors.slate}
                    style={styles.noteInput}
                  />
                  <TouchableOpacity onPress={() => handleResolve(item.id, notes[item.id] || t('staff.feedback.defaultResolutionNote'))} style={styles.resolveBtn}>
                    <Text style={styles.resolveBtnText}>{t('staff.feedback.resolve')}</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.resolved && item.resolutionNote ? <Text style={styles.resolvedNote}>{t('staff.feedback.resolvedNote', { note: item.resolutionNote })}</Text> : null}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
  filterPillText: { fontSize: 12.5, fontWeight: '600', color: colors.charcoal },
  filterPillTextActive: { color: colors.white },
  guestName: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  time: { fontSize: 11, color: colors.slate, marginTop: 2 },
  rating: { fontSize: 20, fontWeight: '700', fontFamily: font.display },
  comment: { fontSize: 13, color: colors.charcoal, fontStyle: 'italic', marginTop: 8 },
  noteInput: { flex: 1, padding: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, fontSize: 12.5, backgroundColor: colors.white },
  resolveBtn: { paddingHorizontal: 14, justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.deepOcean },
  resolveBtnText: { color: colors.white, fontWeight: '700', fontSize: 12.5 },
  resolvedNote: { fontSize: 12, color: colors.success, marginTop: 8 },
});
