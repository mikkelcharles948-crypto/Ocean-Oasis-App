import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, EmptyState, timeAgo } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const CATEGORY_ICON = {
  Reservation: 'bed', 'Activity Reminder': 'sunny', 'Hotel Announcement': 'megaphone',
  Promotion: 'pricetag', 'Service Request': 'chatbox-ellipses', Event: 'calendar',
  Transportation: 'car', 'Important Alert': 'alert-circle',
};

export default function NotificationsScreen({ navigation }) {
  const { t } = useTranslation();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader
        title={t('notifications.title')}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={markAllNotificationsRead}>
            <Text style={styles.markAll}>{t('notifications.readAll')}</Text>
          </TouchableOpacity>
        }
      />
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title={t('notifications.empty')} subtitle={t('notifications.emptySub')} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markNotificationRead(item.id)} style={[styles.row, !item.read && styles.rowUnread]}>
            <View style={styles.iconWrap}>
              <Ionicons name={CATEGORY_ICON[item.category] || 'notifications'} size={18} color={colors.deepOcean} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.category}>{t(`notifications.category.${item.category}`, { defaultValue: item.category })}</Text>
                <Text style={styles.time}>{item.createdAt ? timeAgo(item.createdAt) : item.time}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  markAll: { fontSize: 12.5, color: colors.turquoiseDark, fontWeight: '700' },
  row: {
    flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.white, borderRadius: 14,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start',
  },
  rowUnread: { backgroundColor: '#F3FAF9', borderColor: colors.turquoise },
  iconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.sandLight, alignItems: 'center', justifyContent: 'center' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { fontSize: 10.5, fontWeight: '700', color: colors.turquoiseDark, letterSpacing: 0.4 },
  time: { fontSize: 10.5, color: colors.slate },
  title: { fontSize: 14, fontWeight: '700', color: colors.charcoal, marginTop: 2, fontFamily: font.display },
  body: { fontSize: 12, color: colors.slate, marginTop: 2, lineHeight: 17 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.turquoise, marginTop: 6 },
});
