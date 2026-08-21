import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, Badge, EmptyState } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const STATUS_TONE = { Received: 'info', Assigned: 'warning', 'In Progress': 'warning', Completed: 'success' };

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RequestsScreen({ navigation }) {
  const { serviceRequests } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Requests</Text>
          <Text style={styles.headerSub}>Housekeeping, dining, concierge, and more.</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('NewRequest')} style={styles.newBtn}>
        <View style={styles.newBtnIcon}>
          <Ionicons name="add" size={22} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.newBtnTitle}>Request Something</Text>
          <Text style={styles.newBtnSub}>Housekeeping, towels, maintenance, transportation & more</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.deepOcean} />
      </TouchableOpacity>

      <Text style={styles.historyLabel}>Request History</Text>

      <FlatList
        data={serviceRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm }}
        ListEmptyComponent={
          <EmptyState
            icon="chatbox-ellipses-outline"
            title="No requests yet"
            subtitle="When you request something from our team, you'll see its status here."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}>
            <Card style={styles.reqCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reqCategory}>{item.category}</Text>
                <Text style={styles.reqDesc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.reqTime}>{timeAgo(item.createdAt)}</Text>
              </View>
              <Badge label={item.status} tone={STATUS_TONE[item.status]} />
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  headerTitle: { fontSize: 26, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  headerSub: { fontSize: 13, color: colors.slate, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white,
    marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  newBtnIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
  newBtnTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal },
  newBtnSub: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
  historyLabel: { fontSize: 13, fontWeight: '700', color: colors.charcoal, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  reqCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reqCategory: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  reqDesc: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  reqTime: { fontSize: 11, color: colors.slate, marginTop: 4 },
});
