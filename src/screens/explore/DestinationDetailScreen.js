import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ImagePlaceholder from '../../components/ImagePlaceholder';
import Button from '../../components/Button';
import { Badge, ErrorState } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { DESTINATIONS } from '../../data/mockData';

export default function DestinationDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { destinationId } = route.params || {};
  const destination = DESTINATIONS.find((d) => d.id === destinationId);

  if (!destination) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('explore.destinationNotFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <ImagePlaceholder kind={destination.image} uri={destination.imageUrl} style={{ height: 260, borderRadius: 0 }} iconSize={56} />
          <SafeAreaView style={styles.backOverlay} edges={['top']}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <Badge label={t(`common.category.${destination.category}`)} tone="info" />
          <Text style={styles.title}>{destination.title}</Text>
          <Text style={styles.description}>{destination.description}</Text>

          <View style={styles.statsRow}>
            <Stat icon="navigate-outline" label={t('explore.distance')} value={destination.distance} />
            <Stat icon="time-outline" label={t('explore.duration')} value={destination.duration} />
            <Stat icon="trending-up-outline" label={t('explore.difficulty')} value={t(`common.difficulty.${destination.difficulty}`)} />
          </View>

          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.turquoiseDark} />
            <Text style={styles.noticeText}>
              {t('explore.pricingNotice')}
            </Text>
          </View>

          <Button label={t('explore.askConciergeToArrange')} onPress={() => navigation.navigate('Concierge')} style={{ marginTop: spacing.lg }} />
          <Button
            label={t('explore.viewOnMap')}
            variant="outline"
            onPress={() => navigation.navigate('MapScreen')}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ icon, label, value }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color={colors.deepOcean} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backOverlay: { position: 'absolute', top: 0, left: 0 },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(9,46,55,0.5)',
    alignItems: 'center', justifyContent: 'center', margin: spacing.sm,
  },
  content: { padding: spacing.lg },
  title: { fontSize: 26, fontWeight: '700', color: colors.charcoal, marginTop: 8, fontFamily: font.display },
  description: { fontSize: 14.5, color: colors.slate, marginTop: 8, lineHeight: 21 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  stat: { alignItems: 'center', flex: 1, gap: 4 },
  statValue: { fontSize: 13, fontWeight: '700', color: colors.charcoal },
  statLabel: { fontSize: 10.5, color: colors.slate },
  noticeBox: {
    flexDirection: 'row', gap: 8, backgroundColor: '#E1F2F1', padding: spacing.sm,
    borderRadius: radius.md, marginTop: spacing.md, alignItems: 'flex-start',
  },
  noticeText: { flex: 1, fontSize: 12, color: colors.turquoiseDark, lineHeight: 17 },
});
