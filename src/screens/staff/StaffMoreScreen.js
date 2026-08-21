import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const ITEMS = [
  { key: 'StaffGuests', label: 'Guests', icon: 'people-outline', sub: 'Unified guest profiles' },
  { key: 'StaffMaintenance', label: 'Maintenance', icon: 'build-outline', sub: 'Work orders & response tracking' },
  { key: 'StaffEvents', label: 'Events', icon: 'musical-notes-outline', sub: 'Publish hotel events' },
  { key: 'StaffFeedback', label: 'Feedback', icon: 'star-outline', sub: 'Guest experience alerts' },
  { key: 'StaffNotifications', label: 'Notifications', icon: 'notifications-outline', sub: 'Team alerts' },
  { key: 'StaffProfile', label: 'Profile', icon: 'person-circle-outline', sub: 'Your account' },
];

export default function StaffMoreScreen({ navigation }) {
  const { unreadStaffNotificationCount } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <Text style={styles.headerSub}>Everything else in Staff Operations.</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
        {ITEMS.map((item) => (
          <TouchableOpacity key={item.key} style={styles.row} onPress={() => navigation.navigate(item.key)}>
            <View style={styles.iconWrap}><Ionicons name={item.icon} size={20} color={colors.white} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.sub}>{item.sub}</Text>
            </View>
            {item.key === 'StaffNotifications' && unreadStaffNotificationCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadStaffNotificationCount}</Text></View>
            )}
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
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  sub: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
  badge: { backgroundColor: colors.error, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});
