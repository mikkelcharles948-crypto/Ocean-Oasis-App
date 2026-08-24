import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, ErrorState } from '../../components/UI';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import Button from '../../components/Button';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function EventDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { eventId } = route.params || {};
  const { events, itinerary, addToItinerary } = useApp();
  const event = events.find((e) => e.id === eventId);
  const [reminderSet, setReminderSet] = useState(false);

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('events.eventNotFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const isSaved = itinerary.some((i) => i.type === 'event' && i.refId === event.id);

  const handleSave = () => {
    addToItinerary({ type: 'event', refId: event.id, title: event.title, date: event.date, time: event.time, location: event.location });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('events.eventTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <ImagePlaceholder kind={event.icon} uri={event.imageUrl} style={{ height: 160 }} iconSize={40} />
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={15} color={colors.slate} />
          <Text style={styles.metaText}>{event.time}</Text>
          <Ionicons name="location-outline" size={15} color={colors.slate} style={{ marginLeft: 12 }} />
          <Text style={styles.metaText}>{event.location}</Text>
        </View>
        <Text style={styles.description}>{event.description}</Text>

        <Button
          label={isSaved ? t('events.addedToItinerary') : t('events.addToItinerary')}
          onPress={handleSave}
          disabled={isSaved}
          style={{ marginTop: spacing.lg }}
        />
        <Button
          label={reminderSet ? t('events.reminderSet') : t('events.setReminder')}
          variant="outline"
          onPress={() => setReminderSet(true)}
          disabled={reminderSet}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', color: colors.charcoal, marginTop: spacing.md, fontFamily: font.display },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { fontSize: 13, color: colors.slate, marginLeft: 4 },
  description: { fontSize: 14, color: colors.slate, marginTop: spacing.md, lineHeight: 21 },
});
