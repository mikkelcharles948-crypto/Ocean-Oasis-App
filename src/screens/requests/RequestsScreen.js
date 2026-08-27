import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card, Badge, EmptyState, ErrorState } from '../../components/UI';
import LoadingState from '../../components/LoadingState';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, shadow, gradients, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { SERVICE_REQUEST_CATEGORIES } from '../../data/mockData';

const STATUS_TONE = { Received: 'info', Assigned: 'warning', 'In Progress': 'warning', Completed: 'success' };
const STATUS_KEY = { Received: 'received', Assigned: 'assigned', 'In Progress': 'inProgress', Completed: 'completed' };

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

function timeAgo(iso, t) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return t('requests.justNow');
  if (hrs < 24) return t('requests.hoursAgo', { count: hrs });
  return t('requests.daysAgo', { count: Math.floor(hrs / 24) });
}

export default function RequestsScreen({ navigation }) {
  const { t } = useTranslation();
  const { serviceRequests, dataLoading, dataError, refreshGuestData } = useApp();

  const showLoading = dataLoading && serviceRequests.length === 0;
  const showError = !dataLoading && !!dataError && serviceRequests.length === 0;

  const renderRequest = useCallback(
    ({ item }) => (
      <AnimatedPressable onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}>
        <Card style={styles.reqCard}>
          <View style={styles.reqIconWrap}>
            <MaterialCommunityIcons name={categoryIcon(item.category)} size={18} color={colors.deepOcean} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reqCategory} numberOfLines={1}>{item.category}</Text>
            <Text style={styles.reqTime}>{timeAgo(item.createdAt, t)}</Text>
          </View>
          <Badge label={t(`requests.status.${STATUS_KEY[item.status] || item.status}`)} tone={STATUS_TONE[item.status]} />
        </Card>
      </AnimatedPressable>
    ),
    [navigation, t]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('requests.title')}</Text>
        <Text style={styles.headerSub}>{t('requests.subtitle')}</Text>
      </View>

      <AnimatedPressable
        onPress={() => navigation.navigate('NewRequest')}
        style={styles.newBtn}
        accessibilityRole="button"
      >
        <LinearGradient colors={gradients.ocean} style={styles.newBtnIcon}>
          <Ionicons name="add" size={22} color={colors.white} />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.newBtnTitle}>{t('requests.requestSomething')}</Text>
          <Text style={styles.newBtnSub}>{t('requests.requestSomethingSub')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.deepOcean} />
      </AnimatedPressable>

      <Text style={styles.historyLabel}>{t('requests.requestHistory')}</Text>

      {showLoading ? (
        <LoadingState variant="list" count={3} />
      ) : showError ? (
        <ErrorState onRetry={refreshGuestData} />
      ) : (
        <FlatList
          data={serviceRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm }}
          ListEmptyComponent={
            <EmptyState
              icon="chatbox-ellipses-outline"
              title={t('requests.noRequestsTitle')}
              subtitle={t('requests.noRequestsSub')}
            />
          }
          renderItem={renderRequest}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: spacing.xs },
  headerTitle: { ...typography.display, color: colors.charcoal },
  headerSub: { ...typography.body, color: colors.slate, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white,
    marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, ...shadow.soft,
  },
  newBtnIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  newBtnTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal },
  newBtnSub: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
  historyLabel: { ...typography.label, color: colors.slate, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  reqCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reqIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.sandLight, alignItems: 'center', justifyContent: 'center' },
  reqCategory: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  reqTime: { fontSize: 11.5, color: colors.slate, marginTop: 2 },
});
