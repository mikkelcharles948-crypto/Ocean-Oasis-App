import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Pill, EmptyState } from '../../components/UI';
import EventCard from '../../components/EventCard';
import { colors, spacing, radius, shadow } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { getLocalizedContent } from '../../i18n/content';
import eventsContent from '../../i18n/content/events';

const TODAY = '2026-08-15';
const TOMORROW = '2026-08-16';
const FILTER_KEY = { Today: 'today', Tomorrow: 'tomorrow', 'This Week': 'thisWeek' };

export default function EventsScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('Today');
  const { itinerary, events } = useApp();
  const publishedEvents = useMemo(() => events.filter((e) => e.status !== 'DRAFT'), [events]);

  const filtered = useMemo(() => {
    if (filter === 'Today') return publishedEvents.filter((e) => e.date === TODAY);
    if (filter === 'Tomorrow') return publishedEvents.filter((e) => e.date === TOMORROW);
    return publishedEvents;
  }, [filter, publishedEvents]);

  const savedEventIds = useMemo(
    () => new Set(itinerary.filter((i) => i.type === 'event').map((i) => i.refId)),
    [itinerary]
  );

  const renderEvent = useCallback(
    ({ item }) => {
      const localizedEvent = getLocalizedContent(eventsContent, item.id, i18n.language, item);
      return (
        <View>
          <EventCard
            event={localizedEvent}
            size="medium"
            onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
          />
          {savedEventIds.has(item.id) && (
            <View style={styles.savedBadge}>
              <Ionicons name="bookmark" size={13} color={colors.deepOcean} />
            </View>
          )}
        </View>
      );
    },
    [i18n.language, navigation, savedEventIds]
  );

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
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md }}
        ListEmptyComponent={<EmptyState icon="calendar-outline" title={t('events.noEvents')} />}
        renderItem={renderEvent}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.sm },
  savedBadge: {
    position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: radius.pill,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.card,
  },
});
