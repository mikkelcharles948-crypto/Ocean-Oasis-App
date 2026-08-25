import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming } from 'react-native-reanimated';

import { Badge } from '../../components/UI';
import Logo from '../../components/Logo';
import HeroMedia from '../../components/HeroMedia';
import SectionHeading from '../../components/SectionHeading';
import ExperienceCard from '../../components/ExperienceCard';
import EventCard from '../../components/EventCard';
import PromotionCard from '../../components/PromotionCard';
import EditorialImageCard from '../../components/EditorialImageCard';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, typography } from '../../theme/theme';
import { duration, easing, entrance, useReducedMotion } from '../../theme/motion';
import { useApp } from '../../context/AppContext';
import { getLocalizedContent } from '../../i18n/content';
import activitiesContent from '../../i18n/content/activities';
import eventsContent from '../../i18n/content/events';
import promotionsContent from '../../i18n/content/promotions';
import { formatActivityPrice } from '../../utils/formatActivityPrice';

function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.max(0, Math.round((d2 - d1) / 86400000));
}

function formatDateLong(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// The Home entrance sequence the brief calls for: the hero photo is already
// on screen at first paint (no fade needed there), then each beat below it
// fades/lifts in slightly later than the last — logo/bell row, then the
// greeting headline, then the first content below the hero. Skips straight
// to the resting state under Reduce Motion.
function EntranceItem({ delayMs = 0, style, children }) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const translateY = useSharedValue(reducedMotion ? 0 : 14);

  useEffect(() => {
    if (reducedMotion) return;
    const cfg = { duration: duration.slow, easing: easing.decelerate };
    opacity.value = withDelay(delayMs, withTiming(1, cfg));
    translateY.value = withDelay(delayMs, withTiming(0, cfg));
  }, [reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

// Real Dominica coastline (Soufrière Bay), used as the hero backdrop — the
// ambience of the destination, not a depiction of the hotel property
// itself. Verified on Wikimedia Commons. No hero video exists for this app
// yet (see docs/UI_UX_AUDIT.md) — HeroMedia gracefully renders the photo
// alone until a real video asset is sourced.
const HOME_HERO_URL = 'https://commons.wikimedia.org/wiki/Special:FilePath/Soufri%C3%A8re_Bay%2C_Dominica_008.JPG';

const QUICK_LINKS = [
  { key: 'requestSomething', icon: 'chatbubble-ellipses-outline', route: 'NewRequest' },
  { key: 'dining', icon: 'restaurant-outline', route: 'Dining' },
  { key: 'concierge', icon: 'sparkles-outline', route: 'Concierge' },
  { key: 'contactReception', icon: 'call-outline', route: 'ContactReception' },
  { key: 'feedback', icon: 'star-outline', route: 'Feedback' },
];

export default function HomeScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { guest, reservation, room, unreadNotificationCount, events, activities, promotions } = useApp();

  const today = '2026-08-15';
  const nightsRemaining = daysBetween(today, reservation.checkOut);
  const todaysEvents = useMemo(() => events.filter((e) => e.date === today && e.status !== 'DRAFT'), [events]);
  const rawRecommendation = activities[0];
  const recommendation = useMemo(
    () => (rawRecommendation ? getLocalizedContent(activitiesContent, rawRecommendation.id, i18n.language, rawRecommendation) : null),
    [rawRecommendation, i18n.language]
  );
  const rawPromo = useMemo(() => promotions.find((p) => p.status === 'PUBLISHED'), [promotions]);
  const promo = useMemo(
    () => (rawPromo ? getLocalizedContent(promotionsContent, rawPromo.id, i18n.language, rawPromo) : null),
    [rawPromo, i18n.language]
  );
  const primaryInterest = guest.interests?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']} pointerEvents="box-none">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <HeroMedia
          fallbackImage={{ uri: HOME_HERO_URL }}
          style={styles.hero}
          scrim
          scrimColors={['rgba(9,46,55,0.15)', 'rgba(9,46,55,0.72)']}
          scrimLocations={[0, 1]}
        >
          <EntranceItem delayMs={entrance.title} style={styles.heroTopRow}>
            <Logo size={40} variant="mark" />
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={styles.bellWrap}
              accessibilityLabel={t('notifications.title')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.white} />
              {unreadNotificationCount > 0 && (
                <View style={styles.bellDot}>
                  <Text style={styles.bellDotText}>{unreadNotificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </EntranceItem>

          <EntranceItem delayMs={entrance.headline} style={styles.heroGreeting}>
            <Text style={[typography.hero, styles.heroTitle]}>{t('home.goodMorning', { name: guest.firstName })}</Text>
            <Text style={styles.heroSubtitle}>{t('home.welcome')}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{formatDateLong(today)}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Ionicons name="partly-sunny-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.metaText}>29°C</Text>
            </View>
          </EntranceItem>
        </HeroMedia>

        <EntranceItem delayMs={entrance.cta}>
          {/* Experiences */}
          {recommendation && (
            <View style={styles.section}>
              <SectionHeading
                eyebrow={t('home.eyebrowExperiences')}
                title={t('home.recommendedForYou')}
              />
              <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
                <Badge
                  label={primaryInterest ? t('home.becauseYouLove', { interest: primaryInterest }) : t('home.popularWithGuests')}
                  tone="info"
                />
                <ExperienceCard
                  activity={recommendation}
                  priceLabel={formatActivityPrice(recommendation, t)}
                  size="large"
                  onPress={() => navigation.navigate('ActivityDetail', { activityId: recommendation.id })}
                />
              </View>
            </View>
          )}

          {/* What's happening */}
          {todaysEvents.length > 0 && (
            <View style={styles.section}>
              <SectionHeading
                eyebrow={t('home.eyebrowToday')}
                title={t('home.todayAtOceanOasis')}
                actionLabel={t('home.seeAll')}
                onAction={() => navigation.navigate('Events')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
              >
                {todaysEvents.map((event) => {
                  const localizedEvent = getLocalizedContent(eventsContent, event.id, i18n.language, event);
                  return (
                    <EventCard
                      key={event.id}
                      event={localizedEvent}
                      size="small"
                      style={styles.eventCard}
                      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Curated promotions */}
          {promo && (
            <View style={styles.section}>
              <SectionHeading
                eyebrow={t('home.eyebrowOffer')}
                title={t('home.currentPromotion')}
                actionLabel={t('home.seeAll')}
                onAction={() => navigation.navigate('Promotions')}
              />
              <View style={{ paddingHorizontal: spacing.lg }}>
                <PromotionCard
                  promotion={promo}
                  eyebrowLabel={t('home.eyebrowOffer')}
                  size="medium"
                  onPress={() => navigation.navigate('Promotions')}
                />
              </View>
            </View>
          )}

          {/* Your Stay */}
          <View style={styles.section}>
            <SectionHeading eyebrow={t('home.eyebrowStay')} title={t('home.roomLabel', { number: room.number })} />
            <View style={{ paddingHorizontal: spacing.lg }}>
              <AnimatedPressable onPress={() => navigation.getParent()?.navigate('My Stay')} style={styles.stayCardPress}>
                <View style={styles.stayCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stayDates}>
                      {new Date(reservation.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                      {new Date(reservation.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                    <Text style={styles.stayNights}>{t('home.nightsRemaining', { count: nightsRemaining })}</Text>
                    <View style={styles.stayBtn}>
                      <Text style={styles.stayBtnText}>{t('home.viewStay')}</Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.deepOcean} />
                    </View>
                  </View>
                  <Ionicons name="bed" size={40} color="rgba(255,255,255,0.35)" />
                </View>
              </AnimatedPressable>

              <View style={styles.quickLinksRow}>
                {QUICK_LINKS.map((link) => (
                  <AnimatedPressable
                    key={link.key}
                    onPress={() => navigation.navigate(link.route)}
                    style={styles.quickLink}
                    accessibilityLabel={t(`home.${link.key}`)}
                  >
                    <Ionicons name={link.icon} size={18} color={colors.deepOcean} />
                    <Text style={styles.quickLinkLabel} numberOfLines={1}>{t(`home.${link.key}`)}</Text>
                  </AnimatedPressable>
                ))}
              </View>
            </View>
          </View>

          {/* Final immersive section — Explore Dominica */}
          <View style={[styles.section, { marginBottom: 0 }]}>
            <View style={{ paddingHorizontal: spacing.lg }}>
              <EditorialImageCard
                image={{ uri: 'https://commons.wikimedia.org/wiki/Special:FilePath/Trafalgar%20Falls%2C%20Dominica.jpg' }}
                fallbackIcon="compass-outline"
                eyebrow={t('nav.explore')}
                title={t('explore.title')}
                meta={t('explore.subtitle')}
                size="large"
                onPress={() => navigation.getParent()?.navigate('Explore')}
              />
            </View>
          </View>
        </EntranceItem>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 460 },
  heroTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  bellWrap: { padding: 4 },
  bellDot: {
    position: 'absolute', top: -2, right: -2, backgroundColor: colors.error,
    borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  bellDotText: { color: colors.white, fontSize: 9, fontWeight: '700' },
  heroGreeting: { paddingHorizontal: spacing.lg },
  heroTitle: { color: colors.white },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.88)', marginTop: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  metaText: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  metaDot: { color: 'rgba(255,255,255,0.6)' },
  section: { marginTop: spacing.xl },
  stayCardPress: { borderRadius: radius.lg },
  stayCard: {
    borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.deepOcean,
  },
  stayDates: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 0, fontFamily: typography.display.fontFamily },
  stayNights: { color: colors.sandLight, fontSize: 13, marginTop: 4 },
  stayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white,
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, marginTop: spacing.md,
  },
  stayBtnText: { color: colors.deepOcean, fontWeight: '700', fontSize: 12.5 },
  quickLinksRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, gap: spacing.sm },
  quickLink: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.pill,
    backgroundColor: colors.sandLight, maxWidth: '100%',
  },
  quickLinkLabel: { fontSize: 12.5, fontWeight: '600', color: colors.deepOcean, flexShrink: 1 },
  eventCard: { width: 220 },
});
