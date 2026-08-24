import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card, Badge, SectionHeader } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

function fmt(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyStayScreen({ navigation }) {
  const { t } = useTranslation();
  const { guest, reservation, room, checkedIn } = useApp();

  const timeline = [
    { key: 'arrival', label: t('mystay.timeline.arrival'), done: true, icon: 'airplane' },
    { key: 'stay', label: t('mystay.timeline.duringStay'), done: false, icon: 'sunny' },
    { key: 'departure', label: t('mystay.timeline.departure'), done: false, icon: 'exit' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.headerTitle}>{t('mystay.title')}</Text>

        {!checkedIn && (
          <TouchableOpacity onPress={() => navigation.navigate('DigitalCheckIn')}>
            <Card style={styles.checkinBanner}>
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
            <Text style={styles.guestName}>{guest.firstName} {guest.lastName}</Text>
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
              {room.amenities.map((a) => (
                <View key={a} style={styles.amenityChip}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <Button
          label={t('mystay.contactReception')}
          variant="outline"
          onPress={() => navigation.navigate('ContactReception')}
          style={{ marginTop: spacing.lg }}
        />
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
  headerTitle: { fontSize: 26, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginBottom: spacing.md },
  checkinBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBF1DD', borderWidth: 1, borderColor: colors.goldSoft },
  checkinTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  checkinSub: { fontSize: 12, color: colors.slate, marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  guestName: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
  detailItem: { width: '50%', marginBottom: spacing.sm },
  detailLabel: { fontSize: 11, color: colors.slate },
  detailValue: { fontSize: 13.5, fontWeight: '600', color: colors.charcoal, marginTop: 2 },
  timelineRow: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', width: 34 },
  timelineDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.slate, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: colors.success },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4 },
  timelineLabel: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  timelineDetail: { fontSize: 12, color: colors.slate, marginTop: 4 },
  timelineLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  timelineLink: { fontSize: 12.5, color: colors.turquoiseDark, fontWeight: '600' },
  amenityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.sandLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  amenityText: { fontSize: 11.5, color: colors.charcoal, fontWeight: '600' },
});
