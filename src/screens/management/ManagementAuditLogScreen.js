import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, EmptyState, timeAgo } from '../../components/UI';
import { colors, spacing } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { ROLE_LABELS } from '../../data/mockData';

export default function ManagementAuditLogScreen({ navigation }) {
  const { auditLog } = useApp();
  const sorted = [...auditLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title="Audit Log" onBack={() => navigation.goBack()} />
      <FlatList
        data={sorted}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="list-outline" title="No activity yet" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.action}>{item.action}</Text>
              <Text style={styles.meta}>{item.actorName} · {ROLE_LABELS[item.actorRole] || item.actorRole} · {timeAgo(item.timestamp)}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.white, borderRadius: 14, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.turquoise, marginTop: 5 },
  action: { fontSize: 13.5, color: colors.charcoal, fontWeight: '600' },
  meta: { fontSize: 11.5, color: colors.slate, marginTop: 3 },
});
