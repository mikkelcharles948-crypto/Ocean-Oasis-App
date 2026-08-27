import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, SectionHeader, Badge } from '../../components/UI';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { openInGoogleMaps } from '../../utils/openMap';

// The Waitukubuli National Trail is the Caribbean's first long-distance
// hiking trail — 14 segments end-to-end across Dominica, roughly 184 km
// (115 mi) total. Segment data (start/end points, distance, duration,
// difficulty, highlights) is sourced from the trail authority's own site,
// waitukubulitrail.dm. This screen ships fully bundled with the app (no
// network call, no remote images needed to READ it) so the segment guides
// work with the phone in airplane mode or with no signal on the trail
// itself — only the "View on Google Maps" buttons need connectivity, which
// is expected since they hand off to an external app.
// mapQuery names the trail + segment number explicitly, not just the
// nearest village — a bare village name (what this used to be) always
// resolves to that village's own map pin, never the trail itself. Each
// place referenced is still the real trailhead/landmark for that segment
// (cross-checked against the segment routes below), just phrased so
// Google Maps' search has an actual shot at surfacing the trail/trailhead
// rather than only the town.
const TRAIL_SEGMENTS = [
  { key: 's1', difficulty: 'VeryDifficult', mapQuery: 'Waitukubuli National Trail Segment 1, Scotts Head, Dominica' },
  { key: 's2', difficulty: 'Moderate', mapQuery: 'Waitukubuli National Trail Segment 2, Soufriere Estate, Dominica' },
  { key: 's3', difficulty: 'Moderate', mapQuery: 'Waitukubuli National Trail Segment 3, Bellevue Chopin, Dominica' },
  { key: 's4', difficulty: 'Moderate', mapQuery: 'Waitukubuli National Trail Segment 4, Wotten Waven, Dominica' },
  { key: 's5', difficulty: 'Moderate', mapQuery: 'Waitukubuli National Trail Segment 5, Pont Casse, Dominica' },
  { key: 's6', difficulty: 'Moderate', mapQuery: 'Waitukubuli National Trail Segment 6, Castle Bruce, Dominica' },
  { key: 's7', difficulty: 'Moderate', mapQuery: 'Waitukubuli National Trail Segment 7, Hatton Garden, Dominica' },
  { key: 's8', difficulty: 'VeryDifficult', mapQuery: 'Waitukubuli National Trail Segment 8, Melville Hall Estate, Dominica' },
  { key: 's9', difficulty: 'VeryDifficult', mapQuery: 'Waitukubuli National Trail Segment 9, Petite Macoucherie, Dominica' },
  { key: 's10', difficulty: 'Easy', mapQuery: 'Waitukubuli National Trail Segment 10, Colihaut, Dominica' },
  { key: 's11', difficulty: 'Challenging', mapQuery: 'Waitukubuli National Trail Segment 11, Syndicate, Dominica' },
  { key: 's12', difficulty: 'Challenging', mapQuery: 'Waitukubuli National Trail Segment 12, Borne, Dominica' },
  { key: 's13', difficulty: 'Moderate', mapQuery: 'Waitukubuli National Trail Segment 13, Penville, Dominica' },
  { key: 's14', difficulty: 'Moderate', mapQuery: 'Waitukubuli National Trail Segment 14, Cabrits National Park, Dominica' },
];

const DIFFICULTY_TONE = { Easy: 'success', Moderate: 'info', Challenging: 'warning', VeryDifficult: 'error' };

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

        <View style={styles.noticeBox}>
          <Ionicons name="ticket-outline" size={16} color={colors.turquoiseDark} />
          <Text style={styles.noticeText}>{t('trailMaps.passNotice')}</Text>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title={t('trailMaps.roseauTitle')} />
          <Card>
            <Text style={styles.desc}>{t('trailMaps.roseauDesc')}</Text>
            <MapButton label={t('explore.viewOnGoogleMaps')} onPress={() => openInGoogleMaps('Roseau, Dominica')} />
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

              <View style={styles.statsRow}>
                <View style={styles.statChip}>
                  <Ionicons name="navigate-outline" size={13} color={colors.slate} />
                  <Text style={styles.statChipText}>{t(`trailMaps.segments.${seg.key}.distance`)}</Text>
                </View>
                <View style={styles.statChip}>
                  <Ionicons name="time-outline" size={13} color={colors.slate} />
                  <Text style={styles.statChipText}>{t(`trailMaps.segments.${seg.key}.duration`)}</Text>
                </View>
              </View>

              <Text style={styles.desc}>{t(`trailMaps.segments.${seg.key}.desc`)}</Text>
              <MapButton label={t('explore.viewOnGoogleMaps')} onPress={() => openInGoogleMaps(seg.mapQuery)} />
            </Card>
          ))}
        </View>

        <Text style={styles.footnote}>{t('trailMaps.footnote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MapButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.mapBtn} activeOpacity={0.7} onPress={onPress}>
      <Ionicons name="map-outline" size={13} color={colors.turquoiseDark} />
      <Text style={styles.mapBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  offlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: '#E1F2F1', paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
  },
  offlineText: { fontSize: 11, color: colors.turquoiseDark, fontWeight: '700' },
  intro: { fontSize: 13, color: colors.slate, lineHeight: 19, marginTop: spacing.sm },
  noticeBox: {
    flexDirection: 'row', gap: 8, backgroundColor: '#F6E9DE', padding: spacing.sm,
    borderRadius: radius.md, marginTop: spacing.md, alignItems: 'flex-start',
  },
  noticeText: { flex: 1, fontSize: 12, color: '#9A5B26', lineHeight: 17 },
  desc: { fontSize: 12.5, color: colors.slate, lineHeight: 18 },
  segmentCard: { marginBottom: spacing.sm },
  segmentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 6 },
  segmentIconWrap: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.sandLight,
    alignItems: 'center', justifyContent: 'center', ...shadow.card,
  },
  segmentName: { fontSize: 14, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, flex: 1 },
  segmentRoute: { fontSize: 11.5, color: colors.turquoiseDark, fontWeight: '600', marginBottom: 6 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: 6 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.sandLight,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill,
  },
  statChipText: { fontSize: 11, color: colors.slate, fontWeight: '600' },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, alignSelf: 'flex-start' },
  mapBtnText: { fontSize: 11.5, color: colors.turquoiseDark, fontWeight: '700' },
  footnote: { fontSize: 11.5, color: colors.slate, marginTop: spacing.lg, lineHeight: 16 },
});
