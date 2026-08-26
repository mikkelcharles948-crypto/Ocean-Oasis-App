import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, SectionHeader, KpiCard } from '../../components/UI';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function ManagementRevenueScreen({ navigation }) {
  const { t } = useTranslation();
  const { activities, activityBookings, promotions } = useApp();

  const activityRevenue = activityBookings.reduce((s, b) => s + (b.amount || 0), 0);
  const promotionRevenue = promotions.reduce((s, p) => s + (p.revenue || 0), 0);

  const revenueByActivity = activities.map((a) => ({
    name: a.name,
    revenue: activityBookings.filter((b) => b.activityId === a.id).reduce((s, b) => s + (b.amount || 0), 0),
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('management.revenue.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.sub}>{t('management.revenue.sub')}</Text>

        <Card style={{ backgroundColor: '#E1F2F1', borderWidth: 0, marginBottom: spacing.md }}>
          <Text style={styles.noteText}>
            <Text style={{ fontWeight: '700' }}>{t('management.revenue.noteBoldTotal')}</Text>{t('management.revenue.noteMiddle')}<Text style={{ fontWeight: '700' }}>{t('management.revenue.noteBoldPlatform')}</Text>{t('management.revenue.noteEnd')}
          </Text>
        </Card>

        <View style={styles.kpiRow}>
          <KpiCard label={t('management.overview.kpi.platformRevenue')} value={`$${(activityRevenue + promotionRevenue).toLocaleString()}`} style={{ flexBasis: '100%' }} />
          <KpiCard label={t('management.revenue.kpi.activityRevenue')} value={`$${activityRevenue.toLocaleString()}`} sub={t('management.revenue.kpi.bookingsSub', { count: activityBookings.length })} />
          <KpiCard label={t('management.revenue.kpi.promotionRevenue')} value={`$${promotionRevenue.toLocaleString()}`} sub={t('management.revenue.kpi.redemptionsSub', { count: promotions.reduce((s, p) => s + (p.redemptions || 0), 0) })} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title={t('management.revenue.byActivity')} />
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
          <SectionHeader title={t('management.revenue.byPromotion')} />
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
  sub: { ...typography.bodySmall, color: colors.slate, marginTop: 2, marginBottom: spacing.md },
  noteText: { fontSize: 12.5, color: colors.charcoal, lineHeight: 19 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowTitle: { fontSize: 13.5, fontWeight: '600', color: colors.charcoal, flex: 1 },
  rowValue: { fontSize: 13.5, fontWeight: '700', color: colors.deepOcean },
});
