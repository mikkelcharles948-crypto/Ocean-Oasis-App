import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ErrorState } from '../../components/UI';
import FloatingHeader from '../../components/FloatingHeader';
import Button from '../../components/Button';
import { colors, spacing, radius, typography, shadow, gradients } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { getLocalizedContent } from '../../i18n/content';
import eventsContent from '../../i18n/content/events';
import { optimizeImageUrl } from '../../utils/optimizeImageUrl';

// No hero photography exists for hotel events yet (see docs/UI_UX_AUDIT.md
// on asset organization) — a graceful icon-on-gradient treatment stands in
// rather than substituting stock photography, per the redesign brief.
const ICON_MAP = {
  coffee: 'cafe-outline',
  nature: 'leaf-outline',
  wine: 'wine-outline',
  music: 'musical-notes-outline',
  yoga: 'body-outline',
  culture: 'color-palette-outline',
  cooking: 'restaurant-outline',
  adventure: 'trail-sign-outline',
};

export default function EventDetailScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { eventId } = route.params || {};
  const { events, itinerary, addToItinerary } = useApp();
  const rawEvent = events.find((e) => e.id === eventId);
  const event = rawEvent ? getLocalizedContent(eventsContent, rawEvent.id, i18n.language, rawEvent) : null;
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {event.imageUrl ? (
            <Image source={{ uri: optimizeImageUrl(event.imageUrl, 900) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          ) : (
            <LinearGradient colors={gradients.ocean} style={StyleSheet.absoluteFill}>
              <View style={styles.heroIconWrap}>
                <Ionicons name={ICON_MAP[event.icon] || 'calendar-outline'} size={56} color="rgba(255,255,255,0.85)" />
              </View>
            </LinearGradient>
          )}
          <FloatingHeader tone="light" onBack={() => navigation.goBack()} />
        </View>

        <View style={styles.content}>
          <Text style={[typography.label, styles.eyebrow]}>{t(`common.category.${event.category}`, { defaultValue: event.category })}</Text>
          <Text style={[typography.display, styles.title]}>{event.title}</Text>
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
            style={{ marginTop: spacing.xl }}
          />
          <Button
            label={reminderSet ? t('events.reminderSet') : t('events.setReminder')}
            variant="outline"
            onPress={() => setReminderSet(true)}
            disabled={reminderSet}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 260, overflow: 'hidden' },
  heroIconWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg },
  eyebrow: { color: colors.goldDark, marginBottom: 6 },
  title: { color: colors.charcoal },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  metaText: { fontSize: 13, color: colors.slate, marginLeft: 4 },
  description: { ...typography.body, color: colors.slate, marginTop: spacing.md },
});
