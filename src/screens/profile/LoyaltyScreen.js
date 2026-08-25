import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, SectionHeader, ProgressBar } from '../../components/UI';
import { colors, spacing, radius, font, shadow, gradients } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const TIERS = [
  { key: 'silver', name: 'Silver', icon: 'medal-outline', threshold: 0 },
  { key: 'gold', name: 'Gold', icon: 'trophy-outline', threshold: 1 },
  { key: 'platinum', name: 'Platinum', icon: 'diamond-outline', threshold: 2 },
];

export default function LoyaltyScreen({ navigation }) {
  const { t } = useTranslation();
  const { guest, promotions } = useApp();

  const tierName = (guest.loyaltyTier || '').split('—').pop()?.trim() || 'Silver';
  const currentIndex = Math.max(0, TIERS.findIndex((tier) => tier.name.toLowerCase() === tierName.toLowerCase()));
  const nextTier = TIERS[currentIndex + 1];
  const progressPercent = nextTier ? 55 : 100;

  const diningSpecials = promotions.filter((p) => (p.category || '').toLowerCase().includes('dining') || (p.title || '').toLowerCase().includes('dining'));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('loyalty.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <LinearGradient colors={gradients.gold} style={styles.statusCard}>
          <Text style={styles.programName}>{t('loyalty.programName')}</Text>
          <Text style={styles.tierName}>{TIERS[currentIndex].name}</Text>
          <ProgressBar percent={progressPercent} tone="gold" />
          <Text style={styles.progressLabel}>
            {nextTier ? t('loyalty.progressToNext', { tier: nextTier.name }) : t('loyalty.topTier')}
          </Text>
        </LinearGradient>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title={t('loyalty.perksTitle')} />
          {TIERS.map((tier, i) => (
            <Card key={tier.key} style={[styles.tierCard, i === currentIndex && styles.tierCardActive]}>
              <View style={styles.tierRow}>
                <Ionicons name={tier.icon} size={20} color={i <= currentIndex ? colors.gold : colors.slate} />
                <Text style={styles.tierCardName}>{tier.name}</Text>
                {i === currentIndex && <Text style={styles.currentLabel}>{t('loyalty.currentTier')}</Text>}
              </View>
              <Text style={styles.perkText}>{t(`loyalty.perks.${tier.key}`)}</Text>
            </Card>
          ))}
        </View>

        {diningSpecials.length > 0 && (
          <View style={{ marginTop: spacing.lg }}>
            <SectionHeader title={t('loyalty.memberDiningSpecials')} actionLabel={t('loyalty.viewAll')} onAction={() => navigation.getParent()?.navigate('Promotions')} />
            {diningSpecials.slice(0, 2).map((p) => (
              <Card key={p.id} style={{ marginBottom: spacing.sm }}>
                <Text style={styles.promoTitle}>{p.title}</Text>
                <Text style={styles.promoDesc} numberOfLines={2}>{p.description}</Text>
              </Card>
            ))}
          </View>
        )}

        <Text style={styles.footnote}>{t('loyalty.footnote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statusCard: { borderRadius: radius.lg, padding: spacing.lg, ...shadow.float },
  programName: { color: colors.deepOcean2, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  tierName: { color: colors.deepOcean, fontSize: 26, fontWeight: '700', fontFamily: font.display, marginTop: 2, marginBottom: spacing.sm },
  progressLabel: { color: colors.deepOcean2, fontSize: 12, marginTop: 6 },
  tierCard: { marginBottom: spacing.sm },
  tierCardActive: { borderWidth: 1.5, borderColor: colors.gold },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierCardName: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, flex: 1 },
  currentLabel: { fontSize: 10.5, fontWeight: '700', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  perkText: { fontSize: 12.5, color: colors.slate, marginTop: 6, lineHeight: 18 },
  promoTitle: { fontSize: 14, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  promoDesc: { fontSize: 12, color: colors.slate, marginTop: 3, lineHeight: 17 },
  footnote: { fontSize: 11.5, color: colors.slate, marginTop: spacing.lg, lineHeight: 16 },
});
