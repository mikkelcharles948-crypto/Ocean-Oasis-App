import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, SectionHeader, KpiCard } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function ManagementRevenueScreen() {
  const { activities, activityBookings, promotions } = useApp();

  const activityRevenue = activityBookings.reduce((s, b) => s + (b.amount || 0), 0);
  const promotionRevenue = promotions.reduce((s, p) => s + (p.revenue || 0), 0);

  const revenueByActivity = activities.map((a) => ({
    name: a.name,
    revenue: activityBookings.filter((b) => b.activityId === a.id).reduce((s, b) => s + (b.amount || 0), 0),
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.heading}>Revenue Analytics</Text>
        <Text style={styles.sub}>Platform-attributed revenue only.</Text>

        <Card style={{ backgroundColor: '#E1F2F1', borderWidth: 0, marginBottom: spacing.md }}>
          <Text style={styles.noteText}>
            <Text style={{ fontWeight: '700' }}>Total Hotel Revenue</Text> (room revenue, walk-in dining, etc.) isn't
            tracked by this platform. Figures below are <Text style={{ fontWeight: '700' }}>Platform-Attributed
            Revenue</Text> — transactions with a traceable event inside Ocean Oasis Ops.
          </Text>
        </Card>

        <View style={styles.kpiRow}>
          <KpiCard label="Platform Revenue" value={`$${(activityRevenue + promotionRevenue).toLocaleString()}`} style={{ flexBasis: '100%' }} />
          <KpiCard label="Activity Revenue" value={`$${activityRevenue.toLocaleString()}`} sub={`${activityBookings.length} bookings`} />
          <KpiCard label="Promotion Revenue" value={`$${promotionRevenue.toLocaleString()}`} sub={`${promotions.reduce((s, p) => s + (p.redemptions || 0), 0)} redemptions`} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title="Revenue by Activity" />
          <Card style={{ padding: 0 }}>
            {revenueByActivity.map((a, i) => (
              <View key={a.name} style={[styles.row, i > 0 && styles.rowBorder]}>
                <Text style={styles.rowTitle}>{a.name}</Text>
                <Text style={styles.rowValue}>${a.revenue.toLocaleString()}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title="Revenue by Promotion" />
          <Card style={{ padding: 0 }}>
            {promotions.map((p, i) => (
              <View key={p.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <Text style={styles.rowTitle}>{p.title}</Text>
                <Text style={styles.rowValue}>${(p.revenue || 0).toLocaleString()}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  sub: { fontSize: 13, color: colors.slate, marginTop: 2, marginBottom: spacing.md },
  noteText: { fontSize: 12.5, color: colors.charcoal, lineHeight: 19 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowTitle: { fontSize: 13.5, fontWeight: '600', color: colors.charcoal, flex: 1 },
  rowValue: { fontSize: 13.5, fontWeight: '700', color: colors.deepOcean },
});
