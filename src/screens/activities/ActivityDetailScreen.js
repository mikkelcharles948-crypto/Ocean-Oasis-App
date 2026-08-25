import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import AnimatedPressable from '../../components/AnimatedPressable';
import FloatingHeader from '../../components/FloatingHeader';
import { Badge, ErrorState } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, typography, shadow, gradients } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { getLocalizedContent } from '../../i18n/content';
import activitiesContent from '../../i18n/content/activities';
import { formatActivityPrice } from '../../utils/formatActivityPrice';

const AVAILABILITY_KEY = { Available: 'available', 'Limited spots': 'limitedSpots' };
// Hero is tall enough to feel cinematic (per the brief: "entering the
// image"); the FloatingHeader flips from light-over-photo to dark-over-ivory
// once the scroll position clears most of it.
const HERO_HEIGHT = 440;
const TOP_SCRIM = [gradients.scrim[1], gradients.scrim[0]];

export default function ActivityDetailScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { activityId } = route.params || {};
  const { activities, savedActivityIds, toggleSavedActivity } = useApp();
  const rawActivity = activities.find((a) => a.id === activityId);
  const activity = rawActivity
    ? getLocalizedContent(activitiesContent, rawActivity.id, i18n.language, rawActivity)
    : null;

  const [scrollY, setScrollY] = useState(0);

  if (!activity) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('activities.notFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const isSaved = savedActivityIds.includes(activity.id);
  const isDark = scrollY > HERO_HEIGHT - 90;
  const headerTone = isDark ? 'dark' : 'light';
  const heartColor = isSaved ? colors.gold : (isDark ? colors.deepOcean : colors.white);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        <View style={styles.hero}>
          <Image
            source={{ uri: activity.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient colors={TOP_SCRIM} style={styles.heroTopScrim} pointerEvents="none" />
        </View>

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <Text style={styles.eyebrow}>{t(`common.category.${activity.category}`)}</Text>
            <Badge
              label={t(`common.availability.${AVAILABILITY_KEY[activity.availability] || 'available'}`)}
              tone={activity.availability === 'Available' ? 'success' : 'warning'}
            />
          </View>
          <Text style={styles.title}>{activity.name}</Text>
          <Text style={styles.description}>{activity.description}</Text>

          <View style={styles.statsRow}>
            <Stat icon="calendar-outline" label={t('activities.date')} value={activity.date} />
            <View style={styles.statDivider} />
            <Stat icon="time-outline" label={t('activities.time')} value={activity.time} />
            <View style={styles.statDivider} />
            <Stat icon="hourglass-outline" label={t('activities.duration')} value={activity.duration} />
            <View style={styles.statDivider} />
            <Stat icon="location-outline" label={t('activities.location')} value={activity.location} />
          </View>

          <Section title={t('activities.whatToBring')}>
            {activity.whatToBring.map((w) => (
              <View key={w} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.turquoiseDark} />
                <Text style={styles.bulletText}>{w}</Text>
              </View>
            ))}
          </Section>

          <Section title={t('activities.meetingPoint')}>
            <Text style={styles.plainText}>{activity.meetingPoint}</Text>
          </Section>

          <Section title={t('activities.cancellationPolicy')}>
            <Text style={styles.plainText}>{activity.cancellationPolicy}</Text>
          </Section>
        </View>
      </ScrollView>

      <FloatingHeader
        tone={headerTone}
        elevated={scrollY > 40}
        onBack={() => navigation.goBack()}
        title={isDark ? activity.name : undefined}
        right={
          <AnimatedPressable
            onPress={() => toggleSavedActivity(activity.id)}
            accessibilityRole="button"
            accessibilityLabel={t(isSaved ? 'activities.removeFromFavorites' : 'activities.addToFavorites')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={heartColor} />
          </AnimatedPressable>
        }
      />

      <View style={styles.footer}>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.footerPrice}>{formatActivityPrice(activity, t)}</Text>
          <Text style={styles.footerLocation} numberOfLines={1}>{activity.location}</Text>
        </View>
        <Button
          label={t('activities.reserveActivity')}
          onPress={() => navigation.navigate('BookActivity', { activityId: activity.id })}
          fullWidth={false}
          style={{ paddingHorizontal: 28 }}
        />
      </View>
    </View>
  );
}

function Stat({ icon, label, value }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={colors.deepOcean} />
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: HERO_HEIGHT, backgroundColor: colors.deepOcean2, overflow: 'hidden' },
  heroTopScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 140 },
  content: {
    padding: spacing.lg, paddingBottom: 120, marginTop: -radius.xl, backgroundColor: colors.ivory,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, ...shadow.soft,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { ...typography.label, color: colors.turquoiseDark },
  title: { ...typography.display, color: colors.charcoal, marginTop: spacing.sm },
  description: { ...typography.body, color: colors.slate, marginTop: spacing.sm },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: spacing.xl, paddingVertical: spacing.sm,
  },
  stat: { alignItems: 'center', flex: 1, gap: 5 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  statValue: { ...typography.bodySmall, fontWeight: '700', color: colors.charcoal },
  statLabel: { ...typography.caption, color: colors.slate },
  section: { marginTop: spacing.xl },
  sectionTitle: { ...typography.label, color: colors.slate, marginBottom: spacing.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  bulletText: { ...typography.bodySmall, color: colors.charcoal },
  plainText: { ...typography.bodySmall, color: colors.slate, lineHeight: 21 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
  },
  footerPrice: { ...typography.subheading, color: colors.charcoal },
  footerLocation: { ...typography.caption, color: colors.slate, marginTop: 2 },
});
