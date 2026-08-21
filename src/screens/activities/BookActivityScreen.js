import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader, ErrorState } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function BookActivityScreen({ route, navigation }) {
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
        <ErrorState title="Activity not found" onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const handleConfirm = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const result = bookActivity({ activityId: activity.id, guests });
      if (!result.ok) {
        setLoading(false);
        setError(result.error);
        return;
      }
      addToItinerary({
        type: 'activity', refId: activity.id, title: activity.name,
        date: activity.date, time: activity.time, location: activity.location,
      });
      setLoading(false);
      setConfirmed(true);
    }, 900);
  };

  if (confirmed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title="Confirmed" onBack={() => navigation.popToTop?.() || navigation.goBack()} />
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={32} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Activity Reserved</Text>
          <Text style={styles.successSub}>{activity.name} has been added to your itinerary.</Text>
          <Button label="View Itinerary" onPress={() => navigation.navigate('Itinerary')} style={{ marginTop: spacing.lg }} />
          <Button label="Done" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Reserve Activity" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.activityName}>{activity.name}</Text>
        <Text style={styles.activityMeta}>{activity.date} · {activity.time}</Text>

        <Text style={styles.label}>Number of Guests</Text>
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
          <Text style={styles.summaryTitle}>Review Booking</Text>
          <SummaryRow label="Activity" value={activity.name} />
          <SummaryRow label="Date" value={activity.date} />
          <SummaryRow label="Time" value={activity.time} />
          <SummaryRow label="Guests" value={String(guests)} />
          <SummaryRow label="Price" value={activity.price} />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button label="Confirm Reservation" onPress={handleConfirm} loading={loading} style={{ marginTop: spacing.lg }} />
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
  successCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  successTitle: { fontSize: 20, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  successSub: { fontSize: 13.5, color: colors.slate, textAlign: 'center', marginTop: 6 },
  errorText: { fontSize: 12.5, color: colors.error, marginTop: spacing.md, textAlign: 'center' },
});
