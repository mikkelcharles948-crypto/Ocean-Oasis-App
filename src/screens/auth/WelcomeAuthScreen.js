import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Logo from '../../components/Logo';
import Button from '../../components/Button';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { colors, spacing, font, shadow } from '../../theme/theme';

// Real Dominica rainforest waterfall (Middleham Falls), used as the
// first-impression hero backdrop on this auth "front door" screen —
// ambience of the destination, not a depiction of the hotel itself.
// Verified on Wikimedia Commons.
const AUTH_HERO_URL = 'https://commons.wikimedia.org/wiki/Special:FilePath/Middleham_Falls_at_Morne_Trois_Pitons_National_Park.jpg';

export default function WelcomeAuthScreen({ navigation }) {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: colors.deepOcean2 }}>
      <ImagePlaceholder kind="waterfall" uri={AUTH_HERO_URL} style={StyleSheet.absoluteFill} borderRadius={0} />
      <LinearGradient colors={['rgba(11,59,69,0.5)', 'rgba(9,46,55,0.82)']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
        )}
        <View style={{ alignItems: 'center', marginTop: navigation.canGoBack() ? spacing.md : spacing.xxl }}>
          <Logo size="lg" light />
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
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm,
  },
  card: { backgroundColor: colors.white, borderRadius: 26, padding: spacing.lg, paddingTop: spacing.xl, ...shadow.float },
  title: { fontSize: 21, fontWeight: '700', color: colors.charcoal, textAlign: 'center', fontFamily: font.display },
  subtitle: { fontSize: 13.5, color: colors.slate, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 10, color: colors.slate, fontSize: 12 },
  reservationTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
  reservationSubtitle: { fontSize: 13, color: colors.slate, textAlign: 'center', marginTop: 4 },
});
