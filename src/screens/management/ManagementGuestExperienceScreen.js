import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, SectionHeader, KpiCard, ProgressBar, timeAgo } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function ManagementGuestExperienceScreen() {
  const { feedback, propertySettings } = useApp();
  const threshold = propertySettings.lowRatingThreshold || 3;

  const avgSatisfaction = feedback.length ? Math.round((feedback.reduce((s, f) => s + f.overall, 0) / feedback.length) * 10) / 10 : 0;
  const positive = feedback.filter((f) => f.overall >= 4).length;
  const negative = feedback.filter((f) => f.overall <= 2).length;
  const alerts = feedback.filter((f) => f.overall <= threshold && !f.resolved);

  const categories = ['Room', 'Cleanliness', 'Service', 'Food', 'Activities'];
  const byCategory = useMemo(() => categories.map((cat) => {
    const vals = feedback.map((f) => f.ratings?.[cat]).filter((v) => typeof v === 'number');
    const avg = vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : 0;
    return { cat, avg };
  }), [feedback]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.heading}>Guest Experience</Text>
        <Text style={styles.sub}>Satisfaction trends and service recovery tracking.</Text>

        <View style={styles.kpiRow}>
          <KpiCard label="Overall Satisfaction" value={`${avgSatisfaction}/5`} sub={`${feedback.length} responses`} />
          <KpiCard label="Positive" value={positive} sub="rated 4–5" />
          <KpiCard label="Negative" value={negative} sub="rated 1–2" />
          <KpiCard label="Open Alerts" value={alerts.length} sub="need recovery" />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title="Satisfaction by Category" />
          <Card>
            {byCategory.map((c) => (
              <View key={c.cat} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.catLabel}>{c.cat}</Text>
                  <Text style={styles.catValue}>{c.avg}/5</Text>
                </View>
                <ProgressBar percent={(c.avg / 5) * 100} tone="info" />
              </View>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title="Open Service Recovery Alerts" />
          <Card style={{ padding: 0 }}>
            {alerts.length === 0 ? (
              <Text style={styles.emptyText}>No unresolved alerts — nice work.</Text>
            ) : alerts.map((f, i) => (
              <View key={f.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>Room {f.roomNumber} — {f.overall}/5</Text>
                  <Text style={styles.rowSub}>{f.guestName} · {timeAgo(f.createdAt)}</Text>
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
  catLabel: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  catValue: { fontSize: 12, color: colors.slate },
  emptyText: { fontSize: 13, color: colors.slate, padding: spacing.md },
  row: { padding: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowTitle: { fontSize: 13.5, fontWeight: '700', color: colors.error },
  rowSub: { fontSize: 12, color: colors.slate, marginTop: 2 },
});
