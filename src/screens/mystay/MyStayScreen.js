import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { LinearGradient } from 'expo-linear-gradient';
import { Card, Badge, SectionHeader } from '../../components/UI';
import Button from '../../components/Button';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { colors, spacing, radius, font, shadow, gradients } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { ROOM_TYPES } from '../../data/mockData';
import { getLocalizedContent, getLocalizedString } from '../../i18n/content';
import roomTypesContent from '../../i18n/content/roomTypes';
import roomAmenitiesContent from '../../i18n/content/roomAmenities';

// Real Dominica beach (Mero Beach), used as a hero backdrop behind the
// screen title — ambience of the destination, not a depiction of the
// hotel's own grounds. Verified on Wikimedia Commons.
const MYSTAY_HERO_URL = 'https://commons.wikimedia.org/wiki/Special:FilePath/MERO_BEACH%2C_DOMINICA.jpg';

function fmt(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function UpgradeCard({ tier: rawTier, featured, onRequested }) {
  const { t, i18n } = useTranslation();
  const { submitServiceRequest } = useApp();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const tier = getLocalizedContent(roomTypesContent, rawTier.id, i18n.language, rawTier);

  const handleRequest = async () => {
    setRequesting(true);
    const result = await submitServiceRequest({
      category: 'Room Upgrade',
      description: `Guest is interested in upgrading to a ${tier.name}.`,
    });
    setRequesting(false);
    if (result?.ok !== false) {
      setRequested(true);
      onRequested?.();
    }
  };

  return (
    <Card style={[styles.upgradeCard, featured && styles.upgradeCardFeatured]}>
      {featured && (
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeRibbon} />
      )}
      <View style={styles.upgradeHeaderRow}>
        <View style={styles.upgradeIconWrap}>
          <Ionicons name="arrow-up-circle" size={18} color={featured ? colors.gold : colors.turquoiseDark} />
        </View>
        <Text style={styles.upgradeName}>{tier.name}</Text>
        <Text style={styles.upgradePrice}>{t('mystay.upgrades.fromPrice', { price: tier.fromPricePerNight })}</Text>
      </View>
      <Text style={styles.upgradeDesc}>{tier.description}</Text>
      <View style={styles.amenityWrap}>
        {tier.amenities.slice(0, 4).map((a) => (
          <View key={a} style={styles.amenityChip}>
            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
            <Text style={styles.amenityText}>{getLocalizedString(roomAmenitiesContent, a, i18n.language, a)}</Text>
          </View>
        ))}
      </View>
      <Button
        label={requested ? t('mystay.upgrades.requested') : t('mystay.upgrades.request')}
        variant={requested ? 'outline' : 'primary'}
        disabled={requested}
        loading={requesting}
        onPress={handleRequest}
        style={{ marginTop: spacing.md }}
      />
    </Card>
  );
}

export default function MyStayScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { guest, reservation, room, checkedIn } = useApp();
  const currentTierIndex = ROOM_TYPES.findIndex((rt) => rt.name === room.type);
  const upgradeOptions = currentTierIndex >= 0 ? ROOM_TYPES.slice(currentTierIndex + 1) : [];

  const timeline = [
    { key: 'arrival', label: t('mystay.timeline.arrival'), done: true, icon: 'airplane' },
    { key: 'stay', label: t('mystay.timeline.duringStay'), done: false, icon: 'sunny' },
    { key: 'departure', label: t('mystay.timeline.departure'), done: false, icon: 'exit' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Hero band — a real Dominica beach photo behind the screen title,
            with a bottom-weighted scrim (gradients.scrim) so the white
            title text stays fully legible over the image. */}
        <View style={styles.hero}>
          <ImagePlaceholder kind="ocean" uri={MYSTAY_HERO_URL} style={StyleSheet.absoluteFill} borderRadius={0} />
          <LinearGradient colors={gradients.scrim} style={StyleSheet.absoluteFill} />
          <Text style={styles.heroTitle}>{t('mystay.title')}</Text>
        </View>

        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>

        {reservation.status === 'confirmed' && (
          <TouchableOpacity onPress={() => navigation.navigate('DigitalCheckIn')} activeOpacity={0.9}>
            <Card style={styles.checkinBanner}>
              <View style={styles.checkinIconWrap}>
                <Ionicons name="finger-print" size={20} color={colors.deepOcean} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkinTitle}>{t('mystay.completeCheckIn')}</Text>
                <Text style={styles.checkinSub}>{t('mystay.completeCheckInSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.deepOcean} />
            </Card>
          </TouchableOpacity>
        )}

        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={[styles.guestName, { flexShrink: 1, marginRight: spacing.sm }]} numberOfLines={1}>{guest.firstName} {guest.lastName}</Text>
            <Badge label={checkedIn ? t('mystay.checkedIn') : reservation.status.replace('_', ' ')} tone={checkedIn ? 'success' : 'info'} />
          </View>
          <View style={styles.detailGrid}>
            <Detail label={t('mystay.room')} value={`${room.number} · ${room.type}`} />
            <Detail label={t('mystay.reservationNo')} value={reservation.reservationNumber} />
            <Detail label={t('mystay.checkIn')} value={fmt(reservation.checkIn)} />
            <Detail label={t('mystay.checkOut')} value={fmt(reservation.checkOut)} />
            <Detail label={t('mystay.nights')} value={String(reservation.nights)} />
            <Detail label={t('mystay.guestsLabel')} value={t('mystay.guests', { count: reservation.adults })} />
          </View>
        </Card>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title={t('mystay.yourJourney')} />
          <Card>
            {timeline.map((step, i) => (
              <View key={step.key} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, step.done && styles.timelineDotDone]}>
                    <Ionicons name={step.icon} size={14} color={colors.white} />
                  </View>
                  {i < timeline.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={{ flex: 1, paddingBottom: spacing.lg }}>
                  <Text style={styles.timelineLabel}>{step.label}</Text>
                  {step.key === 'arrival' && (
                    <Text style={styles.timelineDetail}>{t('mystay.arrivalDetail', { time: reservation.arrivalTime })}</Text>
                  )}
                  {step.key === 'stay' && (
                    <View style={styles.timelineLinks}>
                      <TouchableOpacity onPress={() => navigation.navigate('Activities')}><Text style={styles.timelineLink}>{t('mystay.activitiesLink')}</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => navigation.navigate('Dining')}><Text style={styles.timelineLink}>{t('mystay.diningLink')}</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => navigation.navigate('Events')}><Text style={styles.timelineLink}>{t('mystay.eventsLink')}</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Requests')}><Text style={styles.timelineLink}>{t('mystay.serviceRequestsLink')}</Text></TouchableOpacity>
                    </View>
                  )}
                  {step.key === 'departure' && (
                    <View style={styles.timelineLinks}>
                      <Text style={styles.timelineDetail}>{t('mystay.checkoutDetail')}</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('NewRequest', { category: 'Luggage Assistance' })}><Text style={styles.timelineLink}>{t('mystay.luggageAssistance')}</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => navigation.navigate('Feedback')}><Text style={styles.timelineLink}>{t('mystay.leaveFeedback')}</Text></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title={t('mystay.roomAmenities')} />
          <Card>
            <View style={styles.amenityWrap}>
              {(room.amenities || []).map((a) => (
                <View key={a} style={styles.amenityChip}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.amenityText}>{getLocalizedString(roomAmenitiesContent, a, i18n.language, a)}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('NewReservation')} activeOpacity={0.9} style={{ marginTop: spacing.lg }}>
          <Card style={styles.newBookingBanner}>
            <View style={styles.newBookingIconWrap}>
              <Ionicons name="add-circle" size={20} color={colors.turquoiseDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.newBookingTitle}>{t('mystay.newBooking.title')}</Text>
              <Text style={styles.newBookingSub}>{t('mystay.newBooking.subtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.turquoiseDark} />
          </Card>
        </TouchableOpacity>

        {upgradeOptions.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionHeader title={t('mystay.upgrades.title')} subtitle={t('mystay.upgrades.subtitle')} />
            {upgradeOptions.map((tier, i) => (
              <UpgradeCard key={tier.id} tier={tier} featured={i === 0} />
            ))}
          </View>
        )}

        <Button
          label={t('mystay.contactReception')}
          variant="outline"
          onPress={() => navigation.navigate('ContactReception')}
          style={{ marginTop: spacing.lg }}
        />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 150, justifyContent: 'flex-end', padding: spacing.lg, overflow: 'hidden' },
  heroTitle: { fontSize: 26, fontWeight: '700', color: colors.white, fontFamily: font.display },
  checkinBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: '#FBF1DD', borderWidth: 1, borderColor: colors.goldSoft, ...shadow.soft,
  },
  checkinIconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.goldSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  checkinTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  checkinSub: { fontSize: 12, color: colors.slate, marginTop: 2 },
  newBookingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: '#E1F2F1', borderWidth: 1, borderColor: colors.turquoise, ...shadow.soft,
  },
  newBookingIconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  newBookingTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  newBookingSub: { fontSize: 12, color: colors.slate, marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  guestName: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
  detailItem: { width: '50%', marginBottom: spacing.sm },
  detailLabel: { fontSize: 11, color: colors.slate },
  detailValue: { fontSize: 13.5, fontWeight: '600', color: colors.charcoal, marginTop: 2 },
  timelineRow: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', width: 34 },
  timelineDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.slate, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: colors.success, ...shadow.card },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4 },
  timelineLabel: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  timelineDetail: { fontSize: 12, color: colors.slate, marginTop: 4 },
  timelineLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  timelineLink: { fontSize: 12.5, color: colors.turquoiseDark, fontWeight: '600' },
  amenityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.sandLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  amenityText: { fontSize: 11.5, color: colors.charcoal, fontWeight: '600' },
  upgradeCard: { marginBottom: spacing.md, overflow: 'hidden', ...shadow.float },
  upgradeCardFeatured: { borderColor: colors.goldSoft, borderWidth: 1.5 },
  upgradeRibbon: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  upgradeHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  upgradeIconWrap: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  upgradeName: { flex: 1, fontSize: 15.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  upgradePrice: { fontSize: 12.5, fontWeight: '700', color: colors.turquoiseDark },
  upgradeDesc: { fontSize: 12.5, color: colors.slate, marginTop: 6, lineHeight: 18, marginBottom: spacing.sm, marginLeft: 34 },
});
