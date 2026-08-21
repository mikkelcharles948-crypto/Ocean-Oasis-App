import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, radius, font } from '../../theme/theme';

const ITEMS = [
  { key: 'ManagementRevenue', label: 'Revenue Analytics', icon: 'cash-outline', sub: 'Platform-attributed revenue' },
  { key: 'ManagementActivities', label: 'Activity Analytics', icon: 'flag-outline', sub: 'Utilization & revenue per activity' },
  { key: 'ManagementContent', label: 'Content', icon: 'reader-outline', sub: 'Destinations, FAQs, announcements' },
  { key: 'ManagementStaffPerformance', label: 'Staff Performance', icon: 'people-outline', sub: 'Assigned vs. completed requests' },
  { key: 'ManagementAuditLog', label: 'Audit Log', icon: 'list-outline', sub: 'Every administrative action' },
  { key: 'ManagementSettings', label: 'Settings', icon: 'settings-outline', sub: 'Property configuration' },
];

export default function ManagementMoreScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <Text style={styles.headerSub}>Everything else in Management.</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
        {ITEMS.map((item) => (
          <TouchableOpacity key={item.key} style={styles.row} onPress={() => navigation.navigate(item.key)}>
            <View style={styles.iconWrap}><Ionicons name={item.icon} size={20} color={colors.white} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.sub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.slate} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  headerSub: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  sub: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
});
