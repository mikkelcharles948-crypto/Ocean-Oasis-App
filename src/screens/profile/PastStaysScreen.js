import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, Card, EmptyState } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { loadPastStays } from '../../services/supabaseData';

const STATUS_LABELS = { confirmed: 'Upcoming', checked_in: 'Current Stay', checked_out: 'Completed', cancelled: 'Cancelled' };

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PastStaysScreen({ navigation }) {
  const { guest, authSession } = useApp();
  const [stays, setStays] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    if (!authSession?.user?.id || !guest?.id) {
      setStays([]);
      return undefined;
    }
    loadPastStays(guest.id)
      .then((data) => { if (mounted) setStays(data); })
      .catch(() => { if (mounted) setError('We could not load your stay history. Please try again.'); });
    return () => { mounted = false; };
  }, [guest?.id, authSession?.user?.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Past Stays" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        {stays === null && !error && (
          <View style={{ paddingTop: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator color={colors.deepOcean} />
          </View>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {stays && stays.length === 0 && (
          <EmptyState icon="time-outline" title="No stay history yet" subtitle="Your completed reservations will appear here after checkout." />
        )}
        {stays?.map((stay) => (
          <Card key={stay.id} style={{ marginBottom: spacing.sm }}>
            <View style={styles.row}>
              <Text style={styles.reservation}>{stay.reservationNumber}</Text>
              <Text style={styles.status}>{STATUS_LABELS[stay.status] || stay.status}</Text>
            </View>
            <Text style={styles.dates}>{formatDate(stay.checkIn)} – {formatDate(stay.checkOut)}</Text>
            {stay.roomType ? <Text style={styles.room}>{stay.roomType}{stay.roomNumber ? ` · Room ${stay.roomNumber}` : ''}</Text> : null}
            <Text style={styles.meta}>{stay.nights} night{stay.nights === 1 ? '' : 's'} · {stay.adults} adult{stay.adults === 1 ? '' : 's'}{stay.children ? `, ${stay.children} child${stay.children === 1 ? '' : 'ren'}` : ''}</Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reservation: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  status: { fontSize: 11.5, fontWeight: '700', color: colors.turquoiseDark },
  dates: { fontSize: 13, color: colors.charcoal, marginTop: 6 },
  room: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  meta: { fontSize: 11.5, color: colors.slate, marginTop: 4 },
  errorText: { color: colors.error, fontSize: 13, textAlign: 'center', marginTop: spacing.lg },
});
