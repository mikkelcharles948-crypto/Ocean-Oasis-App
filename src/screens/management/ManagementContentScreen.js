import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, Badge, timeAgo } from '../../components/UI';
import { colors, spacing, radius } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { CONTENT_STATUSES } from '../../data/mockData';

const STATUS_TONE = { DRAFT: 'neutral', SCHEDULED: 'warning', PUBLISHED: 'success', ARCHIVED: 'neutral' };

export default function ManagementContentScreen({ navigation }) {
  const { t } = useTranslation();
  const { contentItems, setContentStatus } = useApp();

  const handleSetStatus = async (id, status) => {
    const result = await setContentStatus(id, status);
    if (!result?.ok) Alert.alert(t('common.somethingWrong'), result?.error || t('common.pleaseTryAgain'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('management.content.title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={contentItems}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Badge label={item.type} tone="neutral" />
              <Badge label={item.status} tone={STATUS_TONE[item.status]} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{t('management.content.updatedLabel', { time: timeAgo(item.updatedAt) })}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
              {CONTENT_STATUSES.map((s) => (
                <TouchableOpacity key={s} onPress={() => handleSetStatus(item.id, s)} style={[styles.chip, item.status === s && styles.chipActive]}>
                  <Text style={[styles.chipText, item.status === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', color: colors.charcoal },
  meta: { fontSize: 11.5, color: colors.slate, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.sandLight },
  chipActive: { backgroundColor: colors.deepOcean },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.charcoal },
  chipTextActive: { color: colors.white },
});
