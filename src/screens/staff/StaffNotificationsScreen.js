import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, Badge, EmptyState, timeAgo } from '../../components/UI';
import { colors, spacing } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function StaffNotificationsScreen({ navigation }) {
  const { t } = useTranslation();
  const { staffNotifications, markStaffNotificationRead, markAllStaffNotificationsRead } = useApp();
  const sorted = [...staffNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('staff.notifications.title')} onBack={() => navigation.goBack()} right={
        sorted.length > 0 ? (
          <TouchableOpacity onPress={markAllStaffNotificationsRead}><Text style={{ fontSize: 11, color: colors.turquoiseDark, fontWeight: '700' }}>{t('staff.notifications.markAll')}</Text></TouchableOpacity>
        ) : null
      } />
      <FlatList
        data={sorted}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title={t('staff.notifications.empty')} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markStaffNotificationRead(item.id)}>
            <Card style={{ opacity: item.read ? 0.6 : 1, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
              <Badge label={item.category} tone="info" />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
              <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 13.5, fontWeight: '700', color: colors.charcoal },
  body: { fontSize: 12, color: colors.slate, marginTop: 2 },
  time: { fontSize: 11, color: colors.slate },
});
