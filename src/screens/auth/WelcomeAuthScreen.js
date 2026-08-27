import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Logo from '../../components/Logo';
import Button from '../../components/Button';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { colors, spacing, shadow, typography } from '../../theme/theme';

// Real Dominica rainforest waterfall (Middleham Falls), used as the
// first-impression hero backdrop on this auth "front door" screen —
// ambience of the destination, not a depiction of the hotel itself.
// Verified on Wikimedia Commons.
const AUTH_HERO_URL = 'https://upload.wikimedia.org/wikipedia/commons/2/20/Middleham_Falls_at_Morne_Trois_Pitons_National_Park.jpg';

export default function WelcomeAuthScreen({ navigation }) {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: colors.deepOcean2 }}>
      <ImagePlaceholder kind="waterfall" uri={AUTH_HERO_URL} style={StyleSheet.absoluteFill} borderRadius={0} />
      <LinearGradient colors={['rgba(11,59,69,0.5)', 'rgba(9,46,55,0.82)']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
        )}
        <View style={[styles.logoWrap, { marginTop: navigation.canGoBack() ? spacing.md : spacing.xxl }]}>
          <View style={styles.logoGlowOuter} pointerEvents="none" />
          <View style={styles.logoGlowInner} pointerEvents="none" />
          <Logo size={140} light />
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.signInToOceanOasis')}</Text>
          <Text style={styles.subtitle}>{t('auth.accessReservation')}</Text>

          <Button label={t('auth.signIn')} onPress={() => navigation.navigate('SignIn')} style={{ marginTop: spacing.lg }} />
          <Button
            label={t('auth.createAccount')}
            variant="outline"
            onPress={() => navigation.navigate('CreateAccount')}
            style={{ marginTop: spacing.sm }}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>{t('auth.or')}</Text>
            <View style={styles.line} />
          </View>

          <Text style={styles.reservationTitle}>{t('auth.alreadyStaying')}</Text>
          <Text style={styles.reservationSubtitle}>{t('auth.enterReservationNumber')}</Text>
          <Button
            label={t('auth.useReservationNumber')}
            variant="secondary"
            onPress={() => navigation.navigate('ReservationAccess')}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  // A soft double-layer bloom behind the logo so it reads as a considered
  // arrival moment rather than a mark floating directly on the photo —
  // two oversized, very low-opacity white circles standing in for a
  // radial glow (LinearGradient has no true radial mode on this stack).
  logoGlowOuter: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  logoGlowInner: {
    position: 'absolute', width: 190, height: 190, borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm,
  },
  card: { backgroundColor: colors.white, borderRadius: 26, padding: spacing.lg, paddingTop: spacing.xl, ...shadow.float },
  title: { ...typography.heading, color: colors.charcoal, textAlign: 'center' },
  subtitle: { ...typography.bodySmall, color: colors.slate, textAlign: 'center', marginTop: 6 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 10, color: colors.slate, fontSize: 12 },
  reservationTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
  reservationSubtitle: { ...typography.bodySmall, color: colors.slate, textAlign: 'center', marginTop: 4 },
});
