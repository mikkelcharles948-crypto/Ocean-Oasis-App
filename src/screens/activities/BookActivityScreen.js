import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, ErrorState } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font, shadow, gradients } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function BookActivityScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { activityId } = route.params || {};
  const { activities, addToItinerary, bookActivity } = useApp();
  const activity = activities.find((a) => a.id === activityId);

  const [guests, setGuests] = useState(2);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!activity) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('activities.notFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    const result = await bookActivity({ activityId: activity.id, guests });
    setLoading(false);
    if (!result.ok) {
      setError(result.error || t('activities.bookingError'));
      return;
    }
    addToItinerary({
      type: 'activity', refId: activity.id, title: activity.name,
      date: activity.date, time: activity.time, location: activity.location,
    });
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title={t('activities.confirmed')} onBack={() => navigation.popToTop?.() || navigation.goBack()} />
        <View style={styles.successWrap}>
          <LinearGradient colors={gradients.success} style={styles.successCircle}>
            <Ionicons name="checkmark" size={32} color={colors.white} />
          </LinearGradient>
          <Text style={styles.successTitle}>{t('activities.activityReserved')}</Text>
          <Text style={styles.successSub}>{t('activities.addedToItinerary', { name: activity.name })}</Text>
          <Button label={t('activities.viewItinerary')} onPress={() => navigation.navigate('Itinerary')} style={{ marginTop: spacing.lg }} />
          <Button label={t('activities.done')} variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('activities.reserveActivity')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.activityName}>{activity.name}</Text>
        <Text style={styles.activityMeta}>{activity.date} · {activity.time}</Text>

        <Text style={styles.label}>{t('activities.numberOfGuests')}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => setGuests(Math.max(1, guests - 1))}>
            <Ionicons name="remove" size={18} color={colors.deepOcean} />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{guests}</Text>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => setGuests(Math.min(8, guests + 1))}>
            <Ionicons name="add" size={18} color={colors.deepOcean} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>{t('activities.reviewBooking')}</Text>
          <SummaryRow label={t('activities.activityLabel')} value={activity.name} />
          <SummaryRow label={t('activities.date')} value={activity.date} />
          <SummaryRow label={t('activities.time')} value={activity.time} />
          <SummaryRow label={t('activities.guestsLabel')} value={String(guests)} />
          <SummaryRow label={t('activities.priceLabel')} value={activity.price} />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button label={t('activities.confirmReservation')} onPress={handleConfirm} loading={loading} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  activityName: { fontSize: 20, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  activityMeta: { fontSize: 13, color: colors.slate, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '700', color: colors.charcoal, marginTop: spacing.lg, marginBottom: spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stepperBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepperValue: { fontSize: 18, fontWeight: '700', color: colors.charcoal, minWidth: 24, textAlign: 'center' },
  summaryBox: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 12.5, color: colors.slate },
  summaryValue: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal },
  successWrap: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  successCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadow.soft },
  successTitle: { fontSize: 20, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  successSub: { fontSize: 13.5, color: colors.slate, textAlign: 'center', marginTop: 6 },
  errorText: { fontSize: 12.5, color: colors.error, marginTop: spacing.md, textAlign: 'center' },
});
