import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card, SectionHeader, KpiCard, ProgressBar } from '../../components/UI';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function ManagementOverviewScreen() {
  const { t } = useTranslation();
  const { opsSession, rooms, serviceRequests, feedback, activityBookings, promotions, conciergeConversations } = useApp();

  const inHouseCount = rooms.filter((r) => r.status.startsWith('OCCUPIED')).length;
  const occupancy = rooms.length ? Math.round((inHouseCount / rooms.length) * 100) : 0;
  const openRequests = serviceRequests.filter((r) => !['Completed', 'Cancelled'].includes(r.status));
  const avgSatisfaction = feedback.length ? Math.round((feedback.reduce((s, f) => s + f.overall, 0) / feedback.length) * 10) / 10 : 0;
  const activityRevenue = activityBookings.reduce((s, b) => s + (b.amount || 0), 0);
  const promotionRevenue = promotions.reduce((s, p) => s + (p.revenue || 0), 0);
  const escalatedConversations = conciergeConversations.filter((c) => c.status === 'escalated').length;

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
        <Text style={styles.eyebrow}>{t('management.overview.eyebrow')}</Text>
        <Text style={styles.heading}>{t('management.overview.heading')}</Text>
        <Text style={styles.sub}>{t('management.overview.signedInAs', { name: opsSession?.name })}</Text>

        <View style={styles.kpiRow}>
          <KpiCard label={t('staff.dashboard.kpi.occupancy')} value={`${occupancy}%`} sub={t('staff.dashboard.kpi.roomsSub', { count: inHouseCount, total: rooms.length })} />
          <KpiCard label={t('management.overview.kpi.guestSatisfaction')} value={`${avgSatisfaction}/5`} sub={t('management.overview.kpi.responsesSub', { count: feedback.length })} />
          <KpiCard label={t('staff.dashboard.kpi.openRequests')} value={openRequests.length} sub={t('management.overview.kpi.totalSub', { count: serviceRequests.length })} />
          <KpiCard label={t('management.overview.kpi.platformRevenue')} value={`$${(activityRevenue + promotionRevenue).toLocaleString()}`} sub={t('management.overview.kpi.revenueSub')} />
          <KpiCard label={t('management.overview.kpi.aiConcierge')} value={conciergeConversations.length} sub={t('management.overview.kpi.aiConciergeSub', { count: escalatedConversations })} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title={t('management.overview.requestsByDepartment')} />
          <Card>
            {byDepartment.map(([dept, d]) => (
              <View key={dept} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.deptLabel}>{dept}</Text>
                  <Text style={styles.deptValue}>{t('management.overview.completedOfTotal', { completed: d.completed, total: d.total })}</Text>
                </View>
                <ProgressBar percent={d.total ? (d.completed / d.total) * 100 : 0} tone="success" />
              </View>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title={t('management.overview.revenueNoteTitle')} />
          <Card>
            <Text style={styles.note}>
              {t('management.overview.revenueNoteBefore')}<Text style={{ fontWeight: '700' }}>{t('management.overview.revenueNoteBold')}</Text>{t('management.overview.revenueNoteAfter')}
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { ...typography.label, color: colors.goldDark },
  heading: { ...typography.heading, color: colors.charcoal, marginTop: 4 },
  sub: { ...typography.bodySmall, color: colors.slate, marginTop: 2, marginBottom: spacing.md },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  deptLabel: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  deptValue: { fontSize: 11.5, color: colors.slate },
  note: { fontSize: 12.5, color: colors.slate, lineHeight: 19 },
});
