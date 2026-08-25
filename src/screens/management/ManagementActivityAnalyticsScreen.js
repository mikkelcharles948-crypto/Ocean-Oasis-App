import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, ProgressBar } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function ManagementActivityAnalyticsScreen({ navigation }) {
  const { t } = useTranslation();
  const { activities, activityBookings } = useApp();

  const stats = activities.map((a) => {
    const bookings = activityBookings.filter((b) => b.activityId === a.id);
    const bookedGuests = bookings.reduce((s, b) => s + (b.guests || 0), 0);
    const revenue = bookings.reduce((s, b) => s + (b.amount || 0), 0);
    const utilization = a.capacity ? Math.min(100, Math.round((bookedGuests / a.capacity) * 100)) : 0;
    return { id: a.id, name: a.name, capacity: a.capacity, bookedGuests, revenue, utilization, bookingsCount: bookings.length };
  }).sort((a, b) => b.utilization - a.utilization);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('management.activityAnalytics.title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={stats}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{t('management.activityAnalytics.metaLine', { booked: item.bookedGuests, capacity: item.capacity, bookings: item.bookingsCount, revenue: item.revenue.toLocaleString() })}</Text>
            <View style={{ marginTop: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.utilLabel}>{t('management.activityAnalytics.utilization')}</Text>
                <Text style={[styles.utilValue, { color: item.utilization > 85 ? colors.error : colors.turquoiseDark }]}>{item.utilization}%</Text>
              </View>
              <ProgressBar percent={item.utilization} tone={item.utilization > 85 ? 'error' : 'info'} />
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 15, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  meta: { fontSize: 12, color: colors.slate, marginTop: 4 },
  utilLabel: { fontSize: 11.5, color: colors.slate },
  utilValue: { fontSize: 11.5, fontWeight: '700' },
});
