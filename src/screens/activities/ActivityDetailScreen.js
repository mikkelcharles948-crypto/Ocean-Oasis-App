import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ImagePlaceholder from '../../components/ImagePlaceholder';
import { Badge, ErrorState } from '../../components/UI';
import Button from '../../components/Button';
import GlassSurface from '../../components/GlassSurface';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { getLocalizedContent } from '../../i18n/content';
import activitiesContent from '../../i18n/content/activities';

const AVAILABILITY_KEY = { Available: 'available', 'Limited spots': 'limitedSpots' };

export default function ActivityDetailScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { activityId } = route.params || {};
  const { activities, savedActivityIds, toggleSavedActivity } = useApp();
  const rawActivity = activities.find((a) => a.id === activityId);
  const activity = rawActivity
    ? getLocalizedContent(activitiesContent, rawActivity.id, i18n.language, rawActivity)
    : null;

  if (!activity) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('activities.notFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const isSaved = savedActivityIds.includes(activity.id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ImagePlaceholder kind={activity.image} uri={activity.imageUrl} style={{ height: 250, borderRadius: 0 }} iconSize={52} />
          <SafeAreaView style={styles.overlayRow} edges={['top']}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <GlassSurface style={styles.circleBtn} tint="dark" intensity={50} borderRadius={19}>
                <Ionicons name="chevron-back" size={22} color={colors.white} />
              </GlassSurface>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleSavedActivity(activity.id)} activeOpacity={0.8}>
              <GlassSurface style={styles.circleBtn} tint="dark" intensity={50} borderRadius={19}>
                <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? colors.gold : colors.white} />
              </GlassSurface>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <Badge label={t(`common.category.${activity.category}`)} tone="info" />
            <Badge label={t(`common.availability.${AVAILABILITY_KEY[activity.availability] || 'available'}`)} tone={activity.availability === 'Available' ? 'success' : 'warning'} />
          </View>
          <Text style={styles.title}>{activity.name}</Text>
          <Text style={styles.description}>{activity.description}</Text>

          <View style={styles.statsRow}>
            <Stat icon="calendar-outline" label={t('activities.date')} value={activity.date} />
            <Stat icon="time-outline" label={t('activities.time')} value={activity.time} />
            <Stat icon="hourglass-outline" label={t('activities.duration')} value={activity.duration} />
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

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>{activity.price}</Text>
          <Text style={styles.footerLocation}>{activity.location}</Text>
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
      <Ionicons name={icon} size={17} color={colors.deepOcean} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRow: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.sm,
  },
  circleBtn: {
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center', margin: spacing.sm,
  },
  content: {
    padding: spacing.lg, paddingBottom: 110, marginTop: -radius.xl, backgroundColor: colors.ivory,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, ...shadow.soft,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 25, fontWeight: '700', color: colors.charcoal, marginTop: 10, fontFamily: font.display },
  description: { fontSize: 14, color: colors.slate, marginTop: 8, lineHeight: 21 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  stat: { alignItems: 'center', flex: 1, gap: 4 },
  statValue: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal },
  statLabel: { fontSize: 10.5, color: colors.slate },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  bulletText: { fontSize: 13.5, color: colors.charcoal },
  plainText: { fontSize: 13.5, color: colors.slate, lineHeight: 20 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
  },
  footerPrice: { fontSize: 16, fontWeight: '700', color: colors.charcoal },
  footerLocation: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
});
