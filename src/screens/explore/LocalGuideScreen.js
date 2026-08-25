import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, SectionHeader } from '../../components/UI';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { openInGoogleMaps } from '../../utils/openMap';

// Verified against current sources (Tripadvisor, Wanderlog, Discover
// Dominica) rather than carried over unchecked — "Goûte Dominik" was
// previously (and incorrectly) used as a restaurant name here, but it's
// actually the name of Dominica's annual restaurant-week festival (see
// src/i18n/content/events.js, e_11); the real rainforest venue that
// description was describing is Papillote Rainforest Restaurant.
const RESTAURANTS = [
  { key: 'laRobeCreole', icon: 'restaurant-outline' },
  { key: 'pearlsCuisine', icon: 'cafe-outline' },
  { key: 'theGreatOldHouse', icon: 'restaurant-outline' },
  { key: 'kozysNiche', icon: 'restaurant-outline' },
  { key: 'guiyave', icon: 'cafe-outline' },
  { key: 'palisadesFortYoung', icon: 'restaurant-outline' },
  { key: 'patosSnackette', icon: 'fast-food-outline' },
  { key: 'cornerhouseCafe', icon: 'cafe-outline' },
  { key: 'papillote', icon: 'leaf-outline' },
];

const TIPS = ['currency', 'language', 'driving', 'tipping', 'weather', 'water'];

export default function LocalGuideScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('localGuide.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.intro}>{t('localGuide.intro')}</Text>

        <View style={{ marginTop: spacing.md }}>
          <SectionHeader title={t('localGuide.diningTitle')} />
          {RESTAURANTS.map((r) => (
            <Card key={r.key} style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name={r.icon} size={20} color={colors.deepOcean} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{t(`localGuide.restaurants.${r.key}.name`)}</Text>
                <Text style={styles.meta}>{t(`localGuide.restaurants.${r.key}.location`)}</Text>
                <Text style={styles.desc}>{t(`localGuide.restaurants.${r.key}.desc`)}</Text>
                <TouchableOpacity
                  style={styles.mapLink}
                  activeOpacity={0.7}
                  onPress={() => openInGoogleMaps(`${t(`localGuide.restaurants.${r.key}.name`)}, Dominica`)}
                >
                  <Ionicons name="map-outline" size={13} color={colors.turquoiseDark} />
                  <Text style={styles.mapLinkText}>{t('explore.viewOnGoogleMaps')}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
          <Text style={styles.footnote}>{t('localGuide.diningFootnote')}</Text>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title={t('localGuide.tipsTitle')} />
          {TIPS.map((key) => (
            <View key={key} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.turquoiseDark} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipLabel}>{t(`localGuide.tips.${key}.label`)}</Text>
                <Text style={styles.tipValue}>{t(`localGuide.tips.${key}.value`)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.slate, lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.sandLight,
    alignItems: 'center', justifyContent: 'center', ...shadow.card,
  },
  name: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  meta: { fontSize: 11.5, color: colors.turquoiseDark, fontWeight: '600', marginTop: 2 },
  desc: { fontSize: 12, color: colors.slate, marginTop: 3, lineHeight: 17 },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  mapLinkText: { fontSize: 11.5, color: colors.turquoiseDark, fontWeight: '700' },
  footnote: { fontSize: 11, color: colors.slate, marginTop: 4, fontStyle: 'italic' },
  tipRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tipLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal },
  tipValue: { fontSize: 12.5, color: colors.slate, marginTop: 2, lineHeight: 17 },
});
