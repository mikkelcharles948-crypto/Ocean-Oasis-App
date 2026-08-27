import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '../../components/Button';
import AnimatedPressable from '../../components/AnimatedPressable';
import FloatingHeader from '../../components/FloatingHeader';
import { ErrorState } from '../../components/UI';
import { colors, spacing, radius, typography, shadow } from '../../theme/theme';
import { DESTINATIONS } from '../../data/mockData';
import { getLocalizedContent } from '../../i18n/content';
import destinationsContent from '../../i18n/content/destinations';
import { openInGoogleMaps } from '../../utils/openMap';
import { optimizeImageUrl } from '../../utils/optimizeImageUrl';

// Tall enough to read as a cinematic hero rather than a thumbnail; the
// FloatingHeader stays in "light" tone (icons/text readable over the photo)
// until the guest has scrolled roughly past it, then switches to "dark"
// with a frosted backing over the ivory content below.
const HERO_HEIGHT = 400;
const HEADER_SWITCH_POINT = HERO_HEIGHT - 120;

export default function DestinationDetailScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { destinationId } = route.params || {};
  const rawDestination = DESTINATIONS.find((d) => d.id === destinationId);
  const destination = rawDestination
    ? getLocalizedContent(destinationsContent, rawDestination.id, i18n.language, rawDestination)
    : null;
  const [scrollY, setScrollY] = useState(0);

  if (!destination) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('explore.destinationNotFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const scrolledPastHero = scrollY > HEADER_SWITCH_POINT;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ivory }}>
      <FloatingHeader
        tone={scrolledPastHero ? 'dark' : 'light'}
        elevated={scrolledPastHero}
        title={scrolledPastHero ? destination.title : undefined}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        {destination.imageUrl ? (
          <Image source={{ uri: optimizeImageUrl(destination.imageUrl, 1100) }} style={styles.hero} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.hero, styles.heroFallback]}>
            <Ionicons name="image-outline" size={56} color={colors.turquoiseDark} />
          </View>
        )}

        <View style={styles.content}>
          <Text style={[typography.label, styles.eyebrow]}>{t(`common.category.${destination.category}`)}</Text>
          <Text style={[typography.display, styles.title]}>{destination.title}</Text>
          <Text style={[typography.body, styles.description]}>{destination.description}</Text>

          <View style={styles.statsRow}>
            <Stat icon="navigate-outline" label={t('explore.distance')} value={destination.distance} />
            <Stat icon="time-outline" label={t('explore.duration')} value={destination.duration} />
            <Stat icon="trending-up-outline" label={t('explore.difficulty')} value={t(`common.difficulty.${destination.difficulty}`)} />
          </View>

          <View style={styles.noticeBox}>
            <Ionicons name="information-circle-outline" size={16} color={colors.turquoiseDark} />
            <Text style={styles.noticeText}>{t('explore.pricingNotice')}</Text>
          </View>

          <Button label={t('explore.askConciergeToArrange')} onPress={() => navigation.navigate('Concierge')} style={{ marginTop: spacing.xl }} />

          <View style={styles.secondaryRow}>
            <AnimatedPressable
              onPress={() => navigation.navigate('MapScreen')}
              style={styles.secondaryBtn}
              accessibilityRole="button"
              accessibilityLabel={t('explore.viewOnMap')}
            >
              <Ionicons name="map-outline" size={16} color={colors.deepOcean} />
              <Text style={styles.secondaryBtnText} numberOfLines={1}>{t('explore.viewOnMap')}</Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => openInGoogleMaps(`${destination.title}, Dominica`)}
              style={styles.secondaryBtn}
              accessibilityRole="button"
              accessibilityLabel={t('explore.viewOnGoogleMaps')}
            >
              <Ionicons name="navigate-outline" size={16} color={colors.deepOcean} />
              <Text style={styles.secondaryBtnText} numberOfLines={1}>{t('explore.viewOnGoogleMaps')}</Text>
            </AnimatedPressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ icon, label, value }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color={colors.deepOcean} />
      <Text style={styles.statValue} numberOfLines={2}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: HERO_HEIGHT, backgroundColor: colors.sandLight },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: spacing.lg, marginTop: -radius.xl, backgroundColor: colors.ivory,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, ...shadow.soft,
  },
  eyebrow: { color: colors.goldDark, marginTop: spacing.sm },
  title: { color: colors.charcoal, marginTop: 6 },
  description: { color: colors.slate, marginTop: spacing.sm },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  stat: { alignItems: 'center', flex: 1, gap: 4 },
  statValue: { fontSize: 13, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
  statLabel: { fontSize: 10.5, color: colors.slate, textAlign: 'center' },
  noticeBox: {
    flexDirection: 'row', gap: 8, backgroundColor: '#E1F2F1', padding: spacing.sm,
    borderRadius: radius.md, marginTop: spacing.md, alignItems: 'flex-start',
  },
  noticeText: { flex: 1, fontSize: 12, color: colors.turquoiseDark, lineHeight: 17 },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.deepOcean,
  },
  secondaryBtnText: { color: colors.deepOcean, fontWeight: '700', fontSize: 13, flexShrink: 1 },
});
