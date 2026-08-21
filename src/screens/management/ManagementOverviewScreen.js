import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, SectionHeader, KpiCard, ProgressBar } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function ManagementOverviewScreen() {
  const { opsSession, rooms, serviceRequests, feedback, activityBookings, promotions } = useApp();

  const inHouseCount = rooms.filter((r) => r.status.startsWith('OCCUPIED')).length;
  const occupancy = rooms.length ? Math.round((inHouseCount / rooms.length) * 100) : 0;
  const openRequests = serviceRequests.filter((r) => !['Completed', 'Cancelled'].includes(r.status));
  const avgSatisfaction = feedback.length ? Math.round((feedback.reduce((s, f) => s + f.overall, 0) / feedback.length) * 10) / 10 : 0;
  const activityRevenue = activityBookings.reduce((s, b) => s + (b.amount || 0), 0);
  const promotionRevenue = promotions.reduce((s, p) => s + (p.revenue || 0), 0);

  const byDepartment = useMemo(() => {
    const map = {};
    serviceRequests.forEach((r) => {
      map[r.department] = map[r.department] || { total: 0, completed: 0 };
      map[r.department].total += 1;
      if (r.status === 'Completed') map[r.department].completed += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [serviceRequests]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.eyebrow}>OCEAN OASIS · MANAGEMENT</Text>
        <Text style={styles.heading}>Overview</Text>
        <Text style={styles.sub}>Signed in as {opsSession?.name} · Sandbox data</Text>

        <View style={styles.kpiRow}>
          <KpiCard label="Occupancy" value={`${occupancy}%`} sub={`${inHouseCount}/${rooms.length} rooms`} />
          <KpiCard label="Guest Satisfaction" value={`${avgSatisfaction}/5`} sub={`${feedback.length} responses`} />
          <KpiCard label="Open Requests" value={openRequests.length} sub={`${serviceRequests.length} total`} />
          <KpiCard label="Platform Revenue" value={`$${(activityRevenue + promotionRevenue).toLocaleString()}`} sub="activities + promotions" />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title="Requests by Department" />
          <Card>
            {byDepartment.map(([dept, d]) => (
              <View key={dept} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.deptLabel}>{dept}</Text>
                  <Text style={styles.deptValue}>{d.completed}/{d.total} completed</Text>
                </View>
                <ProgressBar percent={d.total ? (d.completed / d.total) * 100 : 0} tone="success" />
              </View>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title="Revenue Note" />
          <Card>
            <Text style={styles.note}>
              These figures reflect revenue with a traceable transaction inside this platform — activity bookings and
              redeemed promotions. They are <Text style={{ fontWeight: '700' }}>not</Text> a measure of total hotel
              revenue, which also includes room revenue and other channels not yet integrated.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.gold },
  heading: { fontSize: 24, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginTop: 4 },
  sub: { fontSize: 13, color: colors.slate, marginTop: 2, marginBottom: spacing.md },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  deptLabel: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  deptValue: { fontSize: 11.5, color: colors.slate },
  note: { fontSize: 12.5, color: colors.slate, lineHeight: 19 },
});
