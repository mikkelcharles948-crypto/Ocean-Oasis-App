import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, SectionHeader, KpiCard } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

function minutesBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}
function fmtMins(n) {
  if (n === null || n === undefined) return '—';
  if (n < 60) return `${n} min`;
  return `${Math.floor(n / 60)}h ${n % 60}m`;
}

export default function ManagementOperationsScreen() {
  const { serviceRequests, maintenanceIssues } = useApp();

  const openRequests = serviceRequests.filter((r) => !['Completed', 'Cancelled'].includes(r.status));
  const completed = serviceRequests.filter((r) => r.status === 'Completed' && r.completedAt);
  const avgResolution = completed.length
    ? Math.round(completed.reduce((s, r) => s + minutesBetween(r.createdAt, r.completedAt), 0) / completed.length)
    : null;
  const openMaintenance = maintenanceIssues.filter((m) => m.status !== 'RESOLVED');

  const byDepartment = useMemo(() => {
    const map = {};
    serviceRequests.forEach((r) => {
      map[r.department] = map[r.department] || { total: 0, completed: 0, resolutionTimes: [] };
      map[r.department].total += 1;
      if (r.status === 'Completed' && r.completedAt) {
        map[r.department].completed += 1;
        map[r.department].resolutionTimes.push(minutesBetween(r.createdAt, r.completedAt));
      }
    });
    return Object.entries(map).map(([dept, d]) => ({
      dept, total: d.total, completed: d.completed,
      avgResolution: d.resolutionTimes.length ? Math.round(d.resolutionTimes.reduce((s, v) => s + v, 0) / d.resolutionTimes.length) : null,
    })).sort((a, b) => b.total - a.total);
  }, [serviceRequests]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.heading}>Operations Analytics</Text>
        <Text style={styles.sub}>Response and resolution performance across departments.</Text>

        <View style={styles.kpiRow}>
          <KpiCard label="Total Requests" value={serviceRequests.length} />
          <KpiCard label="Open Requests" value={openRequests.length} />
          <KpiCard label="Avg Resolution" value={fmtMins(avgResolution)} />
          <KpiCard label="Open Maintenance" value={openMaintenance.length} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title="Department Performance" />
          <Card style={{ padding: 0 }}>
            {byDepartment.map((d, i) => (
              <View key={d.dept} style={[styles.row, i > 0 && styles.rowBorder]}>
                <Text style={styles.deptName}>{d.dept}</Text>
                <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: 4 }}>
                  <Text style={styles.stat}>{d.total} total</Text>
                  <Text style={styles.stat}>{d.completed} completed</Text>
                  <Text style={styles.stat}>{fmtMins(d.avgResolution)} avg</Text>
                </View>
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
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  row: { padding: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  deptName: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  stat: { fontSize: 11.5, color: colors.slate },
});
