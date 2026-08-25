import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, ErrorState } from '../../components/UI';
import StatusPill from '../../components/StatusPill';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { REQUEST_STATUS_STEPS, SERVICE_REQUEST_CATEGORIES } from '../../data/mockData';

// Same category -> MaterialCommunityIcons mapping used on the New Request
// tile grid, so a request's category reads as the same glyph everywhere.
const ICON_NAME_MAP = {
  broom: 'broom', towel: 'towel', soap: 'shower-head', laundry: 'washing-machine',
  roomservice: 'room-service', tools: 'tools', car: 'car', luggage: 'bag-suitcase',
  alarm: 'alarm', concierge: 'bell-outline', roomupgrade: 'arrow-up-bold-circle-outline', other: 'dots-horizontal',
};

function categoryIcon(categoryLabel) {
  const match = SERVICE_REQUEST_CATEGORIES.find((c) => c.label === categoryLabel);
  return ICON_NAME_MAP[match?.icon] || 'dots-horizontal';
}

export default function RequestDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { serviceRequests } = useApp();
  const request = serviceRequests.find((r) => r.id === route.params?.requestId);

  if (!request) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title={t('requests.requestHeader')} onBack={() => navigation.goBack()} />
        <ErrorState title={t('requests.requestNotFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const currentIndex = REQUEST_STATUS_STEPS.indexOf(request.status);
  // Raw REQUEST_STATUS_STEPS values stay the data model; this only supplies
  // their translated display text to StatusPill.
  const statusLabels = {
    Received: t('requests.status.received'),
    Assigned: t('requests.status.assigned'),
    'In Progress': t('requests.status.inProgress'),
    Completed: t('requests.status.completed'),
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('requests.detailsTitle')} onBack={() => navigation.goBack()} />
      <View style={{ padding: spacing.lg }}>
        <Card>
          <View style={styles.categoryRow}>
            <View style={styles.categoryIconWrap}>
              <MaterialCommunityIcons name={categoryIcon(request.category)} size={20} color={colors.deepOcean} />
            </View>
            <Text style={styles.category}>{request.category}</Text>
          </View>
          <Text style={styles.desc}>{request.description}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={colors.slate} />
            <Text style={styles.metaText}>{t('requests.preferredColon', { time: request.preferredTime })}</Text>
          </View>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionTitle}>{t('requests.statusHeading')}</Text>
          <View style={styles.statusWrap}>
            <StatusPill steps={REQUEST_STATUS_STEPS} activeIndex={currentIndex} labels={statusLabels} />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.sandLight, alignItems: 'center', justifyContent: 'center' },
  category: { ...typography.heading, color: colors.charcoal, flex: 1 },
  desc: { ...typography.body, color: colors.slate, marginTop: spacing.sm, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  metaText: { fontSize: 12, color: colors.slate },
  sectionTitle: { ...typography.label, color: colors.slate, marginBottom: spacing.md },
  statusWrap: { paddingTop: spacing.xs },
});
