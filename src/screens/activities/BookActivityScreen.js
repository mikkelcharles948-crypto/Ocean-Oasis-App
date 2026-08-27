import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { ScreenHeader, ErrorState, Card } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, typography, shadow, gradients } from '../../theme/theme';
import { duration, easing, useReducedMotion } from '../../theme/motion';
import { useApp } from '../../context/AppContext';
import { formatActivityPrice } from '../../utils/formatActivityPrice';

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
          <SuccessMark />
          <Text style={styles.successTitle}>{t('activities.activityReserved')}</Text>
          <Text style={styles.successSub}>{t('activities.addedToItinerary', { name: activity.name })}</Text>
          <Button label={t('activities.viewItinerary')} onPress={() => navigation.navigate('Itinerary')} style={{ marginTop: spacing.xl }} />
          <Button label={t('activities.done')} variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('activities.reserveActivity')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} showsVerticalScrollIndicator={false}>
        <Text style={styles.activityName}>{activity.name}</Text>
        <Text style={styles.activityMeta}>{activity.date} · {activity.time}</Text>

        <Text style={styles.label}>{t('activities.numberOfGuests')}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setGuests(Math.max(1, guests - 1))}
            accessibilityRole="button"
            accessibilityLabel={t('activities.decreaseGuests')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="remove" size={18} color={colors.deepOcean} />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{guests}</Text>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setGuests(Math.min(8, guests + 1))}
            accessibilityRole="button"
            accessibilityLabel={t('activities.increaseGuests')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={18} color={colors.deepOcean} />
          </TouchableOpacity>
        </View>

        <Card style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>{t('activities.reviewBooking')}</Text>
          <SummaryRow label={t('activities.activityLabel')} value={activity.name} />
          <SummaryRow label={t('activities.date')} value={activity.date} />
          <SummaryRow label={t('activities.time')} value={activity.time} />
          <SummaryRow label={t('activities.guestsLabel')} value={String(guests)} />
          <SummaryRow label={t('activities.priceLabel')} value={formatActivityPrice(activity, t)} last />
        </Card>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button label={t('activities.confirmReservation')} onPress={handleConfirm} loading={loading} style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// A restrained fade+scale entrance for the "confirmed" moment — skips
// straight to the settled state when the OS Reduce Motion setting is on.
function SuccessMark() {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (!reducedMotion) {
      progress.value = withTiming(1, { duration: duration.slow, easing: easing.decelerate });
    }
  }, [reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.8 + progress.value * 0.2 }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient colors={gradients.success} style={styles.successCircle}>
        <Ionicons name="checkmark" size={32} color={colors.white} />
      </LinearGradient>
    </Animated.View>
  );
}

function SummaryRow({ label, value, last }) {
  return (
    <View style={[styles.summaryRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  activityName: { ...typography.heading, color: colors.charcoal },
  activityMeta: { ...typography.bodySmall, color: colors.slate, marginTop: 4 },
  label: { ...typography.label, color: colors.slate, marginTop: spacing.xl, marginBottom: spacing.md },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  stepperBtn: {
    width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepperValue: { ...typography.subheading, color: colors.charcoal, minWidth: 26, textAlign: 'center' },
  summaryBox: { marginTop: spacing.xl },
  summaryTitle: { ...typography.label, color: colors.slate, marginBottom: spacing.sm },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  summaryLabel: { ...typography.bodySmall, color: colors.slate },
  summaryValue: { ...typography.bodySmall, fontWeight: '700', color: colors.charcoal, marginLeft: spacing.md, flexShrink: 1, textAlign: 'right' },
  errorText: { ...typography.bodySmall, color: colors.error, marginTop: spacing.md, textAlign: 'center' },
  successWrap: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  successCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, ...shadow.soft },
  successTitle: { ...typography.heading, color: colors.charcoal },
  successSub: { ...typography.bodySmall, color: colors.slate, textAlign: 'center', marginTop: spacing.sm, maxWidth: 300 },
});
