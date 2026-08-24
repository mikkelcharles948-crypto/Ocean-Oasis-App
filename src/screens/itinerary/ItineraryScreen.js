import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, EmptyState } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const TYPE_ICON = { activity: 'sunny', event: 'calendar', dining: 'restaurant' };

function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function ItineraryScreen({ navigation }) {
  const { t } = useTranslation();
  const { itinerary, removeFromItinerary } = useApp();

  const sections = useMemo(() => {
    const byDate = {};
    itinerary.forEach((item) => {
      byDate[item.date] = byDate[item.date] || [];
      byDate[item.date].push(item);
    });
    return Object.keys(byDate)
      .sort()
      .map((date) => ({ title: fmtDate(date), data: byDate[date].sort((a, b) => a.time.localeCompare(b.time)) }));
  }, [itinerary]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('itinerary.title')} onBack={() => navigation.goBack()} />
      {itinerary.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={t('itinerary.emptyTitle')}
          subtitle={t('itinerary.emptySub')}
          actionLabel={t('itinerary.exploreActivities')}
          onAction={() => navigation.navigate('Activities')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
          renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
          renderItem={({ item }) => (
            <Card style={styles.itemCard}>
              <View style={styles.timeCol}>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={styles.iconCol}>
                <Ionicons name={TYPE_ICON[item.type] || 'bookmark'} size={16} color={colors.deepOcean} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.location ? <Text style={styles.itemLocation}>{item.location}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => removeFromItinerary(item.id)}>
                <Ionicons name="close-circle" size={20} color={colors.slate} />
              </TouchableOpacity>
            </Card>
          )}
          SectionSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm, fontFamily: font.display },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeCol: { width: 68 },
  timeText: { fontSize: 11.5, fontWeight: '700', color: colors.turquoiseDark },
  iconCol: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.sandLight, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  itemLocation: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
});
