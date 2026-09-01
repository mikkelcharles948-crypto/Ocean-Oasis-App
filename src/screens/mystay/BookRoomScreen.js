import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Field, ErrorState } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, typography, shadow, gradients } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

function formatDateShort(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Stepper({ value, min, max, onChange, label }) {
  const { t } = useTranslation();
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.stepperBtn}
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel={label ? `${t('common.decrease')} ${label}` : t('common.decrease')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="remove" size={18} color={colors.deepOcean} />
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value}</Text>
      <TouchableOpacity
        style={styles.stepperBtn}
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel={label ? `${t('common.increase')} ${label}` : t('common.increase')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="add" size={18} color={colors.deepOcean} />
      </TouchableOpacity>
    </View>
  );
}

export default function BookRoomScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { createReservation, roomTypes } = useApp();
  const { room, checkIn, checkOut, nights, adults: initialAdults, children: initialChildren } = route.params || {};

  const [adults, setAdults] = useState(initialAdults || 2);
  const [children, setChildren] = useState(initialChildren || 0);
  const [arrivalTime, setArrivalTime] = useState('3:00 PM');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservation, setReservation] = useState(null);

  if (!room) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('booking.confirm.roomNotFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const tier = roomTypes.find((rt) => rt.name === room.type);
  const perNight = tier?.fromPricePerNight ?? null;
  const total = perNight != null ? perNight * nights : null;
  const maxOccupancy = room.max_occupancy || tier?.maxOccupancy || 4;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    const result = await createReservation({ roomId: room.id, checkIn, checkOut, adults, children, specialRequests, arrivalTime });
    setLoading(false);
    if (!result.ok) {
      setError(result.error || t('booking.confirm.bookingError'));
      return;
    }
    setReservation(result.reservation);
  };

  if (reservation) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title={t('booking.success.title')} onBack={() => navigation.popToTop?.() || navigation.goBack()} />
        <View style={styles.successWrap}>
          <LinearGradient colors={gradients.success} style={styles.successCircle}>
            <Ionicons name="checkmark" size={32} color={colors.white} />
          </LinearGradient>
          <Text style={styles.successTitle}>{t('booking.success.heading')}</Text>
          <Text style={styles.successSub}>
            {t('booking.success.subtitle', {
              number: reservation.reservationNumber,
              checkIn: formatDateShort(checkIn),
              checkOut: formatDateShort(checkOut),
            })}
          </Text>
          <Button
            label={t('booking.success.viewReservations')}
            onPress={() => navigation.navigate('PastStays')}
            style={{ marginTop: spacing.lg }}
          />
          <Button
            label={t('booking.success.done')}
            variant="outline"
            onPress={() => navigation.popToTop?.() || navigation.goBack()}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('booking.confirm.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
        <View style={styles.summaryBox}>
          <SummaryRow label={t('booking.confirm.room')} value={`${room.number} · ${room.type}`} />
          <SummaryRow label={t('booking.confirm.checkIn')} value={formatDateShort(checkIn)} />
          <SummaryRow label={t('booking.confirm.checkOut')} value={formatDateShort(checkOut)} />
          <SummaryRow label={t('booking.confirm.nights')} value={String(nights)} />
          {total != null && <SummaryRow label={t('booking.confirm.estimatedTotal')} value={`$${total}`} />}
        </View>

        <Text style={styles.label}>{t('booking.confirm.adultsLabel')}</Text>
        <Stepper value={adults} min={1} max={maxOccupancy} onChange={setAdults} label={t('booking.confirm.adultsLabel')} />

        <Text style={styles.label}>{t('booking.confirm.childrenLabel')}</Text>
        <Stepper value={children} min={0} max={Math.max(0, maxOccupancy - adults)} onChange={setChildren} label={t('booking.confirm.childrenLabel')} />

        <Text style={styles.occupancyNote}>{t('booking.confirm.maxOccupancy', { count: maxOccupancy })}</Text>

        <Field
          label={t('booking.confirm.arrivalTimeLabel')}
          value={arrivalTime}
          onChangeText={setArrivalTime}
          placeholder={t('booking.confirm.arrivalTimePlaceholder')}
        />
        <Field
          label={t('booking.confirm.specialRequestsLabel')}
          value={specialRequests}
          onChangeText={setSpecialRequests}
          placeholder={t('booking.confirm.specialRequestsPlaceholder')}
          multiline
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button label={t('booking.confirm.confirmButton')} onPress={handleConfirm} loading={loading} style={{ marginTop: spacing.lg }} />
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
  summaryBox: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { ...typography.bodySmall, color: colors.slate },
  summaryValue: { ...typography.bodySmall, fontWeight: '700', color: colors.charcoal },
  label: { ...typography.label, color: colors.slate, marginTop: spacing.lg, marginBottom: spacing.sm },
  occupancyNote: { fontSize: 11.5, color: colors.slate, marginTop: spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stepperBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepperValue: { ...typography.subheading, color: colors.charcoal, minWidth: 24, textAlign: 'center' },
  errorText: { ...typography.bodySmall, color: colors.error, marginTop: spacing.md, textAlign: 'center' },
  successWrap: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  successCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadow.soft },
  successTitle: { ...typography.heading, color: colors.charcoal },
  successSub: { ...typography.bodySmall, color: colors.slate, textAlign: 'center', marginTop: 6 },
});
