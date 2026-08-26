import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card, SectionHeader, Badge, KpiCard, timeAgo } from '../../components/UI';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, font, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const PRIORITY_TONE = { URGENT: 'error', HIGH: 'warning', NORMAL: 'neutral' };

export default function StaffHomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { opsSession, serviceRequests, rooms, maintenanceIssues, feedback, propertySettings, events, activities, activityBookings } = useApp();

  const openRequests = useMemo(
    () => serviceRequests.filter((r) => !['Completed', 'Cancelled'].includes(r.status))
      .sort((a, b) => {
        const order = { URGENT: 0, HIGH: 1, NORMAL: 2 };
        if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
        return new Date(b.createdAt) - new Date(a.createdAt);
      }),
    [serviceRequests]
  );
  const urgent = openRequests.filter((r) => r.priority === 'URGENT');
  const openMaintenance = maintenanceIssues.filter((m) => m.status !== 'RESOLVED');
  const inHouseCount = rooms.filter((r) => r.status.startsWith('OCCUPIED')).length;
  const occupancy = rooms.length ? Math.round((inHouseCount / rooms.length) * 100) : 0;
  const unresolvedFeedback = feedback.filter((f) => f.overall <= (propertySettings.lowRatingThreshold || 3) && !f.resolved);

  const greetingHour = new Date().getHours();
  const greetingKey = greetingHour < 12 ? 'staff.dashboard.greetingMorning' : greetingHour < 18 ? 'staff.dashboard.greetingAfternoon' : 'staff.dashboard.greetingEvening';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.eyebrow}>{t('staff.dashboard.eyebrow')}</Text>
        <Text style={styles.greeting}>{t(greetingKey, { name: opsSession?.name?.split(' ')[0] || t('staff.dashboard.teamFallback') })}</Text>
        <Text style={styles.dateLine}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

        <View style={styles.kpiRow}>
          <KpiCard label={t('staff.dashboard.kpi.occupancy')} value={`${occupancy}%`} sub={t('staff.dashboard.kpi.roomsSub', { count: inHouseCount, total: rooms.length })} />
          <KpiCard label={t('staff.dashboard.kpi.openRequests')} value={openRequests.length} sub={t('staff.dashboard.kpi.urgentSub', { count: urgent.length })} />
          <KpiCard label={t('staff.dashboard.kpi.maintenance')} value={openMaintenance.length} sub={t('staff.dashboard.kpi.openIssuesSub')} />
          <KpiCard label={t('staff.dashboard.kpi.feedbackAlerts')} value={unresolvedFeedback.length} sub={t('staff.dashboard.kpi.needFollowUpSub')} />
        </View>

        {(urgent.length > 0 || unresolvedFeedback.length > 0) && (
          <Card style={{ backgroundColor: '#FBF0EC', borderWidth: 1, borderColor: '#EAC3B8', marginTop: spacing.sm }}>
            <Text style={styles.alertTitle}>{t('staff.dashboard.alertBanner')}</Text>
            {urgent.map((r) => (
              <Text key={r.id} style={styles.alertLine}>{t('staff.dashboard.alertRequestLine', { room: r.roomNumber, category: r.category, description: r.description })}</Text>
            ))}
            {unresolvedFeedback.map((f) => (
              <Text key={f.id} style={styles.alertLine}>{t('staff.dashboard.alertFeedbackLine', { room: f.roomNumber, rating: f.overall })}</Text>
            ))}
          </Card>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title={t('staff.dashboard.priorityQueue')} actionLabel={t('staff.dashboard.viewAll')} onAction={() => navigation.navigate('Requests')} />
          <Card style={{ padding: 0 }}>
            {openRequests.length === 0 ? (
              <Text style={styles.emptyText}>{t('staff.dashboard.noOpenRequests')}</Text>
            ) : openRequests.slice(0, 5).map((r, i) => (
              <AnimatedPressable key={r.id} style={[styles.row, i > 0 && styles.rowBorder]} onPress={() => navigation.navigate('Requests')}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>Room {r.roomNumber} — {r.category}</Text>
                  <Text style={styles.rowSub}>{r.department} · {timeAgo(r.createdAt)}</Text>
                </View>
                <Badge label={r.priority} tone={PRIORITY_TONE[r.priority]} />
              </AnimatedPressable>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title={t('staff.dashboard.maintenanceWatchlist')} actionLabel={t('staff.dashboard.viewAll')} onAction={() => navigation.navigate('More', { screen: 'StaffMaintenance' })} />
          <Card style={{ padding: 0 }}>
            {openMaintenance.length === 0 ? (
              <Text style={styles.emptyText}>{t('staff.dashboard.noOpenMaintenance')}</Text>
            ) : openMaintenance.slice(0, 4).map((m, i) => (
              <View key={m.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>Room {m.roomNumber} — {m.category}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{m.description}</Text>
                </View>
                <Badge label={m.status.replace('_', ' ')} tone={m.status === 'OPEN' ? 'error' : 'warning'} />
              </View>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title={t('home.todayAtOceanOasis')} />
          <Card style={{ padding: 0 }}>
            {[...events.filter((e) => e.date === '2026-08-15'), ...activities.filter((a) => a.date === '2026-08-15')].map((item, i) => (
              <View key={item.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.time} — {item.title || item.name}</Text>
                  <Text style={styles.rowSub}>{item.location || item.meetingPoint}{item.name ? ` · ${activityBookings.filter((b) => b.activityId === item.id).reduce((s, b) => s + b.guests, 0)} booked` : ''}</Text>
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
  // colors.gold is ~2.4:1 against ivory (fails WCAG AA as text); goldDark
  // reaches ~4.9:1. typography.label supplies the shared eyebrow scale.
  eyebrow: { ...typography.label, color: colors.goldDark },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginTop: 4 },
  dateLine: { fontSize: 13, color: colors.slate, marginTop: 2, marginBottom: spacing.md },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  alertTitle: { fontWeight: '800', color: colors.error, fontSize: 13, marginBottom: 6 },
  alertLine: { fontSize: 12.5, color: colors.charcoal, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.slate, padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowTitle: { fontSize: 13.5, fontWeight: '700', color: colors.charcoal },
  rowSub: { fontSize: 12, color: colors.slate, marginTop: 2 },
});
