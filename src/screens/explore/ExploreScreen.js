import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Pill } from '../../components/UI';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import AnimatedPressable from '../../components/AnimatedPressable';
import GlassSurface from '../../components/GlassSurface';
import SectionHeading from '../../components/SectionHeading';
import ExperienceCard from '../../components/ExperienceCard';
import { colors, spacing, radius } from '../../theme/theme';
import { DESTINATIONS, DESTINATION_CATEGORIES } from '../../data/mockData';
import { getLocalizedContent } from '../../i18n/content';
import destinationsContent from '../../i18n/content/destinations';
import { useApp } from '../../context/AppContext';
import { resolvePhotoUrl } from '../../utils/photoOverrides';

// Real Dominica rainforest swimming hole (Emerald Pool), used as a hero
// backdrop behind the page title — ambience of the destinations being
// browsed, not a depiction of the hotel itself. Verified on Wikimedia Commons.
const EXPLORE_HERO_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Emerald_Pool%2C_Dominica.jpg/1280px-Emerald_Pool%2C_Dominica.jpg';

export default function ExploreScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { photoOverrides } = useApp();
  const [category, setCategory] = useState('All');

  const filtered = useMemo(
    () => (category === 'All' ? DESTINATIONS : DESTINATIONS.filter((d) => d.category === category)),
    [category]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const localized = getLocalizedContent(destinationsContent, item.id, i18n.language, item);
      // ExperienceCard reads `.location` for its meta line; destinations
      // don't have one, so the (already-short) travel time stands in —
      // the display-only object below never reaches AppContext/Supabase.
      const cardData = {
        ...localized,
        category: t(`common.category.${item.category}`),
        location: localized.travelTime,
        imageUrl: resolvePhotoUrl(photoOverrides, `destination:${item.id}`, localized.imageUrl),
      };
      return (
        // Every row is the same size deliberately — this FlatList has no
        // getItemLayout, and varying the first row's height (the previous
        // "large" first card, "medium" thereafter) is what caused card
        // titles to render blank on Android for any category with more
        // than one item: mismatched row heights corrupt FlatList's layout
        // estimation. A uniform size is the actual fix, not a workaround.
        <ExperienceCard
          activity={cardData}
          size="medium"
          onPress={() => navigation.navigate('DestinationDetail', { destinationId: item.id })}
        />
      );
    },
    [i18n.language, t, navigation, photoOverrides]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      {/* Cinematic hero — the page title and subtitle now live directly over
          a real Dominica landscape photo instead of as plain text above it,
          with the utility icons (trail maps / local guide / map) floating
          as small glass controls in the corner rather than a flat toolbar. */}
      <View style={styles.hero}>
        <ImagePlaceholder kind="rainforest" uri={EXPLORE_HERO_URL} style={StyleSheet.absoluteFill} borderRadius={0} />
        <LinearGradient
          colors={['rgba(9,46,55,0.1)', 'rgba(9,46,55,0.2)', 'rgba(9,46,55,0.88)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.heroActions}>
          <AnimatedPressable
            onPress={() => navigation.navigate('TrailMaps')}
            accessibilityRole="button"
            accessibilityLabel={t('trailMaps.title')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <GlassSurface style={styles.heroIconBtn} tint="dark" intensity={45} borderRadius={19}>
              <Ionicons name="trail-sign-outline" size={19} color={colors.white} />
            </GlassSurface>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => navigation.navigate('LocalGuide')}
            accessibilityRole="button"
            accessibilityLabel={t('localGuide.title')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <GlassSurface style={styles.heroIconBtn} tint="dark" intensity={45} borderRadius={19}>
              <Ionicons name="compass-outline" size={19} color={colors.white} />
            </GlassSurface>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => navigation.navigate('MapScreen')}
            accessibilityRole="button"
            accessibilityLabel={t('explore.map')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <GlassSurface style={styles.heroIconBtn} tint="dark" intensity={45} borderRadius={19}>
              <Ionicons name="map-outline" size={19} color={colors.white} />
            </GlassSurface>
          </AnimatedPressable>
        </View>
        <View style={styles.heroText}>
          <SectionHeading title={t('explore.title')} subtitle={t('explore.subtitle')} light />
        </View>
      </View>

      {/* A plain wrapping row, not a horizontal ScrollView: on-device testing
          found filter-pill labels rendering blank specifically inside a
          horizontal ScrollView on Android (background/selection state drew
          fine, only the Text failed to paint) — the identical Pill component
          renders correctly elsewhere in the app in this flex-wrap layout,
          so this sidesteps whatever that ScrollView-specific defect is. */}
      <View style={styles.pillRow}>
        <Pill label={t('explore.all')} selected={category === 'All'} onPress={() => setCategory('All')} />
        {DESTINATION_CATEGORIES.map((c) => (
          <Pill key={c} label={t(`common.category.${c}`)} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      {/* Trail Maps / Local Guide as real Explore content, not just the
          small hero corner icons above — this is their primary entry point
          now that Profile no longer links to them. */}
      <View style={styles.resourceRow}>
        <AnimatedPressable style={styles.resourceLink} onPress={() => navigation.navigate('TrailMaps')} accessibilityRole="button">
          <Ionicons name="trail-sign-outline" size={18} color={colors.deepOcean} />
          <Text style={styles.resourceLinkLabel} numberOfLines={1}>{t('trailMaps.title')}</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.resourceLink} onPress={() => navigation.navigate('LocalGuide')} accessibilityRole="button">
          <Ionicons name="compass-outline" size={18} color={colors.deepOcean} />
          <Text style={styles.resourceLinkLabel} numberOfLines={1}>{t('localGuide.title')}</Text>
        </AnimatedPressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.md, gap: spacing.lg }}
        renderItem={renderItem}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 260,
    overflow: 'hidden',
  },
  heroActions: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    zIndex: 2,
  },
  heroIconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.sm,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  resourceRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  resourceLink: {
    flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.pill,
    backgroundColor: colors.sandLight,
  },
  resourceLinkLabel: { fontSize: 12.5, fontWeight: '600', color: colors.deepOcean, flexShrink: 1 },
});
