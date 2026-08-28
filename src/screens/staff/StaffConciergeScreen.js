import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, Badge, EmptyState, timeAgo } from '../../components/UI';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const STATUS_TONE = { active: 'info', escalated: 'warning', resolved: 'success' };

export default function StaffConciergeScreen({ navigation }) {
  const { t } = useTranslation();
  const { conciergeConversations } = useApp();

  const sorted = useMemo(
    () => [...conciergeConversations].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)),
    [conciergeConversations]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('staff.concierge.title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={sorted}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title={t('staff.concierge.empty')} />}
        renderItem={({ item }) => (
          <AnimatedPressable onPress={() => navigation.navigate('StaffConciergeThread', { conversationId: item.id, guestName: item.guestName })}>
            <Card style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.guestName || t('staff.concierge.unknownGuest')}</Text>
                <Text style={styles.meta}>{timeAgo(item.lastMessageAt)}</Text>
              </View>
              <Badge label={t(`staff.concierge.status.${item.status}`)} tone={STATUS_TONE[item.status] || 'neutral'} />
            </Card>
          </AnimatedPressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  meta: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
});
