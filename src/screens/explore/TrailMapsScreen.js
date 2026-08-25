import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, SectionHeader, Badge } from '../../components/UI';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';

// The Waitukubuli National Trail is the Caribbean's first long-distance
// hiking trail — 14 segments end-to-end across Dominica, roughly 184 km
// (115 mi) total. This screen ships fully bundled with the app (no network
// call, no remote images) so it works with the phone in airplane mode or
// with no signal on the trail itself.
const TRAIL_SEGMENTS = [
  { key: 's1', difficulty: 'Moderate' },
  { key: 's4', difficulty: 'Easy' },
  { key: 's6', difficulty: 'Challenging' },
  { key: 's12', difficulty: 'Moderate' },
  { key: 's13', difficulty: 'Challenging' },
];

const DIFFICULTY_TONE = { Easy: 'success', Moderate: 'info', Challenging: 'warning' };

export default function TrailMapsScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('trailMaps.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={styles.offlineBadge}>
          <Ionicons name="cloud-offline-outline" size={14} color={colors.turquoiseDark} />
          <Text style={styles.offlineText}>{t('trailMaps.offlineNotice')}</Text>
        </View>

        <Text style={styles.intro}>{t('trailMaps.intro')}</Text>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title={t('trailMaps.roseauTitle')} />
          <Card>
            <Text style={styles.desc}>{t('trailMaps.roseauDesc')}</Text>
          </Card>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title={t('trailMaps.waitukubuliTitle')} subtitle={t('trailMaps.waitukubuliSubtitle')} />
          {TRAIL_SEGMENTS.map((seg) => (
            <Card key={seg.key} style={styles.segmentCard}>
              <View style={styles.segmentHeader}>
                <View style={styles.segmentIconWrap}>
                  <Ionicons name="trail-sign-outline" size={18} color={colors.deepOcean} />
                </View>
                <Text style={styles.segmentName}>{t(`trailMaps.segments.${seg.key}.name`)}</Text>
                <Badge label={t(`common.difficulty.${seg.difficulty}`)} tone={DIFFICULTY_TONE[seg.difficulty]} />
              </View>
              <Text style={styles.segmentRoute}>{t(`trailMaps.segments.${seg.key}.route`)}</Text>
              <Text style={styles.desc}>{t(`trailMaps.segments.${seg.key}.desc`)}</Text>
            </Card>
          ))}
        </View>

        <Text style={styles.footnote}>{t('trailMaps.footnote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  offlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: '#E1F2F1', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
  },
  offlineText: { fontSize: 11, color: colors.turquoiseDark, fontWeight: '700' },
  intro: { fontSize: 13, color: colors.slate, lineHeight: 19, marginTop: spacing.sm },
  desc: { fontSize: 12.5, color: colors.slate, lineHeight: 18 },
  segmentCard: { marginBottom: spacing.sm },
  segmentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 6 },
  segmentIconWrap: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.sandLight,
    alignItems: 'center', justifyContent: 'center', ...shadow.card,
  },
  segmentName: { fontSize: 14, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, flex: 1 },
  segmentRoute: { fontSize: 11.5, color: colors.turquoiseDark, fontWeight: '600', marginBottom: 4 },
  footnote: { fontSize: 11.5, color: colors.slate, marginTop: spacing.lg, lineHeight: 16 },
});
