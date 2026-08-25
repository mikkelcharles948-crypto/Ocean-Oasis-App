import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, Pill, EmptyState } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const TODAY = '2026-08-15';
const TOMORROW = '2026-08-16';
const FILTER_KEY = { Today: 'today', Tomorrow: 'tomorrow', 'This Week': 'thisWeek' };

export default function EventsScreen({ navigation }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('Today');
  const { itinerary, events } = useApp();
  const publishedEvents = useMemo(() => events.filter((e) => e.status !== 'DRAFT'), [events]);

  const filtered = useMemo(() => {
    if (filter === 'Today') return publishedEvents.filter((e) => e.date === TODAY);
    if (filter === 'Tomorrow') return publishedEvents.filter((e) => e.date === TOMORROW);
    return publishedEvents;
  }, [filter, publishedEvents]);

  const savedIds = itinerary.filter((i) => i.type === 'event').map((i) => i.refId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('events.title')} onBack={() => navigation.goBack()} />
      <View style={styles.pillRow}>
        {['Today', 'Tomorrow', 'This Week'].map((f) => (
          <Pill key={f} label={t(`events.filter.${FILTER_KEY[f]}`)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm }}
        ListEmptyComponent={<EmptyState icon="calendar-outline" title={t('events.noEvents')} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}>
            <Card style={styles.card}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventLocation}>{item.location} · {t(`common.category.${item.category}`, { defaultValue: item.category })}</Text>
              </View>
              {savedIds.includes(item.id) ? (
                <Ionicons name="bookmark" size={18} color={colors.gold} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.slate} />
              )}
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  timeBlock: { backgroundColor: colors.sandLight, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 10, minWidth: 78, alignItems: 'center' },
  timeText: { fontSize: 12, fontWeight: '700', color: colors.deepOcean },
  eventTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  eventLocation: { fontSize: 12, color: colors.slate, marginTop: 2 },
});
