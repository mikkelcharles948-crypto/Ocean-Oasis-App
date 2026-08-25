import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { ROLE_LABELS } from '../../data/mockData';

function minutesBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}
function fmtMins(n, t) {
  if (n === null || n === undefined) return t('management.operations.noData');
  if (n < 60) return t('management.operations.minutesShort', { count: n });
  return t('management.operations.hoursMinutesShort', { h: Math.floor(n / 60), m: n % 60 });
}

export default function ManagementStaffPerformanceScreen({ navigation }) {
  const { t } = useTranslation();
  const { serviceRequests, staffDirectory } = useApp();

  const rows = staffDirectory.map((s) => {
    const assigned = serviceRequests.filter((r) => r.assignedStaffId === s.id);
    const completed = assigned.filter((r) => r.status === 'Completed' && r.completedAt);
    const avgResolution = completed.length
      ? Math.round(completed.reduce((sum, r) => sum + minutesBetween(r.createdAt, r.completedAt), 0) / completed.length)
      : null;
    return { ...s, assignedCount: assigned.length, completedCount: completed.length, avgResolution };
  }).sort((a, b) => b.completedCount - a.completedCount);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('management.staffPerformance.title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={rows}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{t(`common.roleLabels.${item.role}`, { defaultValue: ROLE_LABELS[item.role] })} · {item.department}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.count}>{item.completedCount}/{item.assignedCount}</Text>
              <Text style={styles.avgTime}>{t('management.operations.avgSuffix', { time: fmtMins(item.avgResolution, t) })}</Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  name: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  meta: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
  count: { fontSize: 15, fontWeight: '700', color: colors.deepOcean, fontFamily: font.display },
  avgTime: { fontSize: 10.5, color: colors.slate, marginTop: 2 },
});
