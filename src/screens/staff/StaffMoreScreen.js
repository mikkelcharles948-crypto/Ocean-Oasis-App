import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const ITEMS = [
  { key: 'StaffGuests', i18nKey: 'guests', icon: 'people-outline' },
  { key: 'StaffMaintenance', i18nKey: 'maintenance', icon: 'build-outline' },
  { key: 'StaffEvents', i18nKey: 'events', icon: 'musical-notes-outline' },
  { key: 'StaffFeedback', i18nKey: 'feedback', icon: 'star-outline' },
  { key: 'StaffNotifications', i18nKey: 'notifications', icon: 'notifications-outline' },
  { key: 'StaffProfile', i18nKey: 'profile', icon: 'person-circle-outline' },
];

export default function StaffMoreScreen({ navigation }) {
  const { t } = useTranslation();
  const { unreadStaffNotificationCount } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('staff.moreScreen.title')}</Text>
        <Text style={styles.headerSub}>{t('staff.moreScreen.subtitle')}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
        {ITEMS.map((item) => (
          <AnimatedPressable key={item.key} style={styles.row} onPress={() => navigation.navigate(item.key)}>
            <View style={styles.iconWrap}><Ionicons name={item.icon} size={20} color={colors.white} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t(`staff.moreScreen.items.${item.i18nKey}.label`)}</Text>
              <Text style={styles.sub}>{t(`staff.moreScreen.items.${item.i18nKey}.sub`)}</Text>
            </View>
            {item.key === 'StaffNotifications' && unreadStaffNotificationCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadStaffNotificationCount}</Text></View>
            )}
            <Ionicons name="chevron-forward" size={18} color={colors.slate} />
          </AnimatedPressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  headerTitle: { ...typography.heading, color: colors.charcoal },
  headerSub: { ...typography.caption, color: colors.slate, marginTop: 2 },
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
