import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card, SectionHeader, Badge, IconTile } from '../../components/UI';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import Logo from '../../components/Logo';
import { colors, spacing, radius, font, shadow, gradients } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.max(0, Math.round((d2 - d1) / 86400000));
}

function formatDateLong(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Real Dominica coastline (Soufrière Bay), used as the hero backdrop behind
// the logo/greeting — ambience of the destination, not a depiction of the
// hotel property itself. Verified on Wikimedia Commons.
const HOME_HERO_URL = 'https://commons.wikimedia.org/wiki/Special:FilePath/Soufri%C3%A8re_Bay%2C_Dominica_008.JPG';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { guest, reservation, room, unreadNotificationCount, events, activities, promotions } = useApp();

  const today = '2026-08-15';
  const nightsRemaining = daysBetween(today, reservation.checkOut);
  const todaysEvents = useMemo(() => events.filter((e) => e.date === today && e.status !== 'DRAFT'), [events]);
  const recommendation = activities[0];
  const promo = promotions.find((p) => p.status === 'PUBLISHED');
  const primaryInterest = guest.interests?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Hero backdrop — a real Dominica coastline photo behind the
            logo/greeting, standing in for the flat decorative wash used
            previously. A gradient scrim keeps the bell icon and logo
            legible over the image and blends it into the ivory page below
            before the greeting text begins, so that text is never placed
            over the photo itself. */}
        <View style={styles.hero} pointerEvents="none">
          <ImagePlaceholder kind="ocean" uri={HOME_HERO_URL} style={StyleSheet.absoluteFill} borderRadius={0} />
          <LinearGradient
            colors={['rgba(9,46,55,0.5)', 'rgba(9,46,55,0.18)', colors.ivory]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellWrap}>
            <Ionicons name="notifications-outline" size={22} color={colors.deepOcean} />
            {unreadNotificationCount > 0 && (
              <View style={styles.bellDot}>
                <Text style={styles.bellDotText}>{unreadNotificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.logoWrap}>
          <Logo size="lg" light />
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>{t('home.goodMorning', { name: guest.firstName })}</Text>
          <Text style={styles.greetingSub}>{t('home.welcome')}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{formatDateLong(today)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Ionicons name="partly-sunny-outline" size={14} color={colors.slate} />
            <Text style={styles.metaText}>29°C</Text>
          </View>
        </View>

        {/* My Stay Card */}
        <View style={styles.section}>
          <LinearGradient colors={gradients.ocean} style={styles.stayCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stayRoom}>{t('home.roomLabel', { number: room.number })}</Text>
              <Text style={styles.stayDates}>
                {new Date(reservation.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                {new Date(reservation.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.stayNights}>{t('home.nightsRemaining', { count: nightsRemaining })}</Text>
              <TouchableOpacity
                style={styles.stayBtn}
                onPress={() => navigation.getParent()?.navigate('My Stay')}
              >
                <Text style={styles.stayBtnText}>{t('home.viewStay')}</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.deepOcean} />
              </TouchableOpacity>
            </View>
            <View style={styles.stayIconWrap}>
              <Ionicons name="bed" size={44} color="rgba(255,255,255,0.35)" />
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title={t('home.quickActions')} />
          <View style={styles.quickGrid}>
            <IconTile label={t('home.requestSomething')} icon="chatbubble-ellipses" onPress={() => navigation.navigate('NewRequest')} />
            <IconTile label={t('home.bookActivity')} icon="sunny" onPress={() => navigation.navigate('Activities')} color={colors.turquoiseDark} />
            <IconTile label={t('home.dining')} icon="restaurant" onPress={() => navigation.navigate('Dining')} color={colors.forest} />
            <IconTile label={t('home.exploreDominica')} icon="compass" onPress={() => navigation.getParent()?.navigate('Explore')} color={colors.gold} />
            <IconTile label={t('home.feedback')} icon="star" onPress={() => navigation.navigate('Feedback')} color={colors.turquoiseDark} />
            <IconTile label={t('home.contactReception')} icon="call" onPress={() => navigation.navigate('ContactReception')} color={colors.deepOcean2} />
            <IconTile label={t('home.concierge')} icon="sparkles" onPress={() => navigation.navigate('Concierge')} color={colors.forest} />
            <IconTile label={t('home.promotions')} icon="pricetag" onPress={() => navigation.navigate('Promotions')} color={colors.gold} />
          </View>
        </View>

        {/* Today at Ocean Oasis */}
        <View style={styles.section}>
          <SectionHeader title={t('home.todayAtOceanOasis')} actionLabel={t('home.seeAll')} onAction={() => navigation.navigate('Events')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {todaysEvents.map((event) => (
              <TouchableOpacity key={event.id} onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}>
                <Card style={styles.eventCard}>
                  <Text style={styles.eventTime}>{event.time}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventLocation} numberOfLines={1}>{event.location}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended */}
        {recommendation && (
        <View style={styles.section}>
          <SectionHeader title={t('home.recommendedForYou')} />
          <TouchableOpacity onPress={() => navigation.navigate('ActivityDetail', { activityId: recommendation.id })} activeOpacity={0.92}>
            <Card style={[styles.photoCard, { padding: 0, overflow: 'hidden' }]}>
              <ImagePlaceholder kind={recommendation.image} uri={recommendation.imageUrl} style={{ height: 150, borderRadius: 0 }} iconSize={40} />
              <View style={{ padding: spacing.md }}>
                <Badge label={primaryInterest ? t('home.becauseYouLove', { interest: primaryInterest }) : t('home.popularWithGuests')} tone="info" />
                <Text style={styles.recTitle}>{recommendation.name}</Text>
                <Text style={styles.recDesc} numberOfLines={2}>{recommendation.shortDescription}</Text>
                <View style={styles.recFooter}>
                  <Text style={styles.recPrice}>{recommendation.price}</Text>
                  <View style={styles.exploreBtn}>
                    <Text style={styles.exploreBtnText}>{t('home.explore')}</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.deepOcean} />
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
        )}

        {/* Promotion */}
        {promo && (
        <View style={[styles.section, { marginBottom: spacing.lg }]}>
          <SectionHeader title={t('home.currentPromotion')} actionLabel={t('home.seeAll')} onAction={() => navigation.navigate('Promotions')} />
          <TouchableOpacity onPress={() => navigation.navigate('Promotions')} activeOpacity={0.92}>
            <LinearGradient colors={gradients.gold} style={styles.promoCard}>
              <Ionicons name="wine" size={28} color={colors.deepOcean} style={{ marginBottom: 8 }} />
              <Text style={styles.promoTitle}>{promo.title}</Text>
              <Text style={styles.promoDesc}>{promo.description}</Text>
              <View style={styles.promoCta}>
                <Text style={styles.promoCtaText}>{t('home.viewOffer')}</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.deepOcean} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 230, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
  },
  logoWrap: { alignItems: 'center', marginTop: 4, marginBottom: 4 },
  bellWrap: {
    padding: 6, backgroundColor: 'rgba(251,248,242,0.9)', borderRadius: radius.pill, ...shadow.soft,
  },
  bellDot: {
    position: 'absolute', top: 0, right: 0, backgroundColor: colors.error,
    borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  bellDotText: { color: colors.white, fontSize: 9, fontWeight: '700' },
  greetingBlock: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  greeting: { fontFamily: font.display, fontSize: 25, fontWeight: '700', color: colors.charcoal, letterSpacing: 0.1 },
  greetingSub: { fontSize: 14, color: colors.slate, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { fontSize: 12.5, color: colors.slate, fontWeight: '500' },
  metaDot: { color: colors.slate },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  photoCard: { ...shadow.float },
  stayCard: {
    borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', ...shadow.float,
  },
  stayRoom: { color: colors.sandLight, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  stayDates: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 6, fontFamily: font.display },
  stayNights: { color: colors.sandLight, fontSize: 13, marginTop: 4 },
  stayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white,
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, marginTop: spacing.md,
  },
  stayBtnText: { color: colors.deepOcean, fontWeight: '700', fontSize: 12.5 },
  stayIconWrap: { marginLeft: spacing.sm },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  eventCard: { width: 140, marginRight: 0 },
  eventTime: { color: colors.turquoiseDark, fontWeight: '700', fontSize: 12 },
  eventTitle: { color: colors.charcoal, fontWeight: '700', fontSize: 14.5, marginTop: 4 },
  eventLocation: { color: colors.slate, fontSize: 11.5, marginTop: 3 },
  recTitle: { fontSize: 17, fontWeight: '700', color: colors.charcoal, marginTop: 8, fontFamily: font.display },
  recDesc: { fontSize: 13, color: colors.slate, marginTop: 3, lineHeight: 18 },
  recFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  recPrice: { fontSize: 13.5, fontWeight: '700', color: colors.charcoal },
  exploreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.sandLight,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill,
  },
  exploreBtnText: { color: colors.deepOcean, fontWeight: '700', fontSize: 12.5 },
  promoCard: { borderRadius: radius.lg, padding: spacing.lg, ...shadow.float },
  promoTitle: { fontSize: 18, fontWeight: '700', color: colors.deepOcean, fontFamily: font.display },
  promoDesc: { fontSize: 13, color: colors.deepOcean2, marginTop: 4, lineHeight: 18 },
  promoCta: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.md,
    alignSelf: 'flex-start', backgroundColor: 'rgba(251,248,242,0.55)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill,
  },
  promoCtaText: { color: colors.deepOcean, fontWeight: '700', fontSize: 12.5 },
});
