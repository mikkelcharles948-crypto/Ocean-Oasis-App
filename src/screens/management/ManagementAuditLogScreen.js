import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, EmptyState, timeAgo } from '../../components/UI';
import { colors, spacing, radius } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { ROLE_LABELS } from '../../data/mockData';

// audit_log rows come from two sources: the DB trigger on
// service_requests/rooms/activity_bookings (raw action="insert/update
// <table>" + whatever the trigger captured in metadata — see the
// write_audit_entry migration) and explicit logAudit(...) calls elsewhere
// in AppContext, which already write a finished sentence as `action`. This
// turns the trigger's raw table+operation+metadata into the same kind of
// sentence, so both sources read the same way in the list below.
function describeEntry(item, staffDirectory, t) {
  const m = item.metadata || {};
  const staffName = (id) => staffDirectory.find((s) => s.id === id)?.name || t('management.auditLog.someone');

  if (item.action === 'insert service_requests') {
    return t('management.auditLog.desc.newRequest', { category: m.category || '?', room: m.room_number || '?' });
  }
  if (item.action === 'update service_requests') {
    if (m.assigned_staff_id) return t('management.auditLog.desc.assigned', { category: m.category || '?', room: m.room_number || '?', name: staffName(m.assigned_staff_id) });
    if (m.status_to) return t('management.auditLog.desc.statusChange', { category: m.category || '?', room: m.room_number || '?', status: m.status_to });
  }
  if (item.action === 'update rooms' && m.status_to) {
    return t('management.auditLog.desc.roomStatus', { room: m.room_number || '?', status: m.status_to });
  }
  if (item.action === 'insert activity_bookings') {
    return t('management.auditLog.desc.newBooking', { count: m.guests || 1 });
  }
  // Explicit logAudit(...) calls already wrote a full sentence.
  return item.action;
}

export default function ManagementAuditLogScreen({ navigation }) {
  const { t } = useTranslation();
  const { auditLog, staffDirectory } = useApp();
  const sorted = [...auditLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('management.auditLog.title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={sorted}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="list-outline" title={t('management.auditLog.empty')} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.action}>{describeEntry(item, staffDirectory, t)}</Text>
              <Text style={styles.meta}>
                {item.actorName || t('management.auditLog.guest')}
                {item.actorRole ? ` · ${t(`common.roleLabels.${item.actorRole}`, { defaultValue: ROLE_LABELS[item.actorRole] || item.actorRole })}` : ''}
                {' · '}{timeAgo(item.timestamp)}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.turquoise, marginTop: 5 },
  action: { fontSize: 13.5, color: colors.charcoal, fontWeight: '600' },
  meta: { fontSize: 11.5, color: colors.slate, marginTop: 3 },
});
