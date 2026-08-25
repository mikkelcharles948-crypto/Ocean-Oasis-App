import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Logo from '../../components/Logo';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const OPTIONS = [
  { key: 'guest', icon: 'person-outline', tone: colors.deepOcean },
  { key: 'staff', icon: 'headset-outline', tone: colors.turquoiseDark },
  { key: 'management', icon: 'stats-chart-outline', tone: colors.forest },
];

export default function ExperienceSelectScreen({ navigation }) {
  const { t } = useTranslation();
  const { chooseExperience } = useApp();

  const handleChoose = (key) => {
    chooseExperience(key);
    if (key === 'guest') navigation.navigate('WelcomeAuth');
    else navigation.navigate('OpsLogin', { surface: key });
  };

  return (
    <LinearGradient colors={[colors.deepOcean, colors.deepOcean2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl }}>
          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <Logo size="lg" light />
          </View>

          <Text style={styles.eyebrow}>{t('experience.eyebrow')}</Text>
          <Text style={styles.heading}>{t('experience.heading')}</Text>
          <Text style={styles.sub}>{t('experience.sub')}</Text>

          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.key} style={styles.card} activeOpacity={0.9} onPress={() => handleChoose(opt.key)}>
                <View style={[styles.cardIcon, { backgroundColor: opt.tone }]}>
                  <Ionicons name={opt.icon} size={24} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{t(`experience.${opt.key}Title`)}</Text>
                  <Text style={styles.cardSub}>{t(`experience.${opt.key}Sub`)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.slate} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footNote}>
            <MaterialCommunityIcons name="information-outline" size={16} color={colors.sandLight} />
            <Text style={styles.footNoteText}>{t('experience.demoNote')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.goldSoft, fontSize: 11.5, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  heading: { color: colors.white, fontSize: 24, fontWeight: '700', fontFamily: font.display, textAlign: 'center', marginTop: 8 },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 13.5, textAlign: 'center', marginTop: 10, lineHeight: 20, paddingHorizontal: spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md, ...shadow.card,
  },
  cardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  cardSub: { fontSize: 12, color: colors.slate, marginTop: 3, lineHeight: 16.5 },
  footNote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.xl, paddingHorizontal: spacing.sm },
  footNoteText: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: 11, lineHeight: 15 },
});
