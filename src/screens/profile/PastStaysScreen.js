import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, EmptyState } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { loadPastStays } from '../../services/supabaseData';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PastStaysScreen({ navigation }) {
  const { t } = useTranslation();
  const { guest, authSession } = useApp();
  const [stays, setStays] = useState(null);
  const [error, setError] = useState('');

  const STATUS_LABELS = {
    confirmed: t('pastStays.status.confirmed'),
    checked_in: t('pastStays.status.checked_in'),
    checked_out: t('pastStays.status.checked_out'),
    cancelled: t('pastStays.status.cancelled'),
  };

  useEffect(() => {
    let mounted = true;
    if (!authSession?.user?.id || !guest?.id) {
      setStays([]);
      return undefined;
    }
    loadPastStays(guest.id)
      .then((data) => { if (mounted) setStays(data); })
      .catch(() => { if (mounted) setError(t('pastStays.loadError')); });
    return () => { mounted = false; };
  }, [guest?.id, authSession?.user?.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('profile.pastStays')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        {stays === null && !error && (
          <View style={{ paddingTop: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator color={colors.deepOcean} />
          </View>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {stays && stays.length === 0 && (
          <EmptyState icon="time-outline" title={t('pastStays.emptyTitle')} subtitle={t('pastStays.emptySub')} />
        )}
        {stays?.map((stay) => (
          <Card key={stay.id} style={{ marginBottom: spacing.sm }}>
            <View style={styles.row}>
              <Text style={styles.reservation}>{stay.reservationNumber}</Text>
              <Text style={styles.status}>{STATUS_LABELS[stay.status] || stay.status}</Text>
            </View>
            <Text style={styles.dates}>{formatDate(stay.checkIn)} – {formatDate(stay.checkOut)}</Text>
            {stay.roomType ? (
              <Text style={styles.room}>
                {stay.roomNumber ? t('pastStays.roomWithNumber', { type: stay.roomType, number: stay.roomNumber }) : stay.roomType}
              </Text>
            ) : null}
            <Text style={styles.meta}>
              {t('pastStays.nights', { count: stay.nights })} · {t('pastStays.adults', { count: stay.adults })}
              {stay.children ? t('pastStays.children', { count: stay.children }) : ''}
            </Text>
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
