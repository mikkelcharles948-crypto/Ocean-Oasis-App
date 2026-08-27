import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card, SectionHeader, KpiCard, ProgressBar, timeAgo } from '../../components/UI';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const CATEGORY_KEY = { Room: 'room', Cleanliness: 'cleanliness', Service: 'service', Food: 'food', Activities: 'activities' };

export default function ManagementGuestExperienceScreen() {
  const { t } = useTranslation();
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
        <Text style={styles.heading}>{t('management.experience.heading')}</Text>
        <Text style={styles.sub}>{t('management.experience.sub')}</Text>

        <View style={styles.kpiRow}>
          <KpiCard label={t('management.experience.kpi.overallSatisfaction')} value={`${avgSatisfaction}/5`} sub={t('management.overview.kpi.responsesSub', { count: feedback.length })} />
          <KpiCard label={t('management.experience.kpi.positive')} value={positive} sub={t('management.experience.kpi.positiveSub')} />
          <KpiCard label={t('management.experience.kpi.negative')} value={negative} sub={t('management.experience.kpi.negativeSub')} />
          <KpiCard label={t('management.experience.kpi.openAlerts')} value={alerts.length} sub={t('management.experience.kpi.needRecoverySub')} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title={t('management.experience.satisfactionByCategory')} />
          <Card>
            {byCategory.map((c) => (
              <View key={c.cat} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.catLabel}>{t(`feedback.categories.${CATEGORY_KEY[c.cat]}`)}</Text>
                  <Text style={styles.catValue}>{c.avg}/5</Text>
                </View>
                <ProgressBar percent={(c.avg / 5) * 100} tone="info" />
              </View>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title={t('management.experience.openAlertsSection')} />
          <Card style={{ padding: 0 }}>
            {alerts.length === 0 ? (
              <Text style={styles.emptyText}>{t('management.experience.noAlerts')}</Text>
            ) : alerts.map((f, i) => (
              <View key={f.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{t('management.experience.alertRow', { room: f.roomNumber, rating: f.overall })}</Text>
                  <Text style={styles.rowSub}>{t('management.experience.alertMeta', { name: f.guestName, time: timeAgo(f.createdAt) })}</Text>
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
  heading: { ...typography.heading, color: colors.charcoal },
  sub: { ...typography.bodySmall, color: colors.slate, marginTop: 2, marginBottom: spacing.md },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  catLabel: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  catValue: { fontSize: 12, color: colors.slate },
  emptyText: { fontSize: 13, color: colors.slate, padding: spacing.md },
  row: { padding: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowTitle: { fontSize: 13.5, fontWeight: '700', color: colors.error },
  rowSub: { fontSize: 12, color: colors.slate, marginTop: 2 },
});
