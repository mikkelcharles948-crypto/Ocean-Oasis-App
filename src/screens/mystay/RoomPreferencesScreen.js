import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card } from '../../components/UI';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function RoomPreferencesScreen({ navigation }) {
  const { t } = useTranslation();
  const { reservation, setHousekeepingPreference } = useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const current = reservation.housekeepingPreference || 'DAILY_CLEANING';

  const options = [
    {
      value: 'DAILY_CLEANING',
      icon: 'sparkles-outline',
      title: t('roomPreferences.daily.title'),
      desc: t('roomPreferences.daily.desc'),
    },
    {
      value: 'DO_NOT_DISTURB',
      icon: 'moon-outline',
      title: t('roomPreferences.dnd.title'),
      desc: t('roomPreferences.dnd.desc'),
    },
  ];

  const choose = async (value) => {
    if (value === current) return;
    setSaving(true);
    setError('');
    const result = await setHousekeepingPreference(value);
    setSaving(false);
    if (!result?.ok) setError(result?.error || t('roomPreferences.saveError'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('roomPreferences.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.intro}>{t('roomPreferences.intro')}</Text>

        {options.map((opt) => {
          const selected = current === opt.value;
          return (
            <AnimatedPressable
              key={opt.value}
              onPress={() => choose(opt.value)}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={opt.title}
              accessibilityState={{ selected, disabled: saving }}
            >
              <Card style={[styles.optionCard, selected && styles.optionCardSelected]}>
                <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                  <Ionicons name={opt.icon} size={22} color={selected ? colors.white : colors.deepOcean} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={22} color={colors.turquoiseDark} />}
              </Card>
            </AnimatedPressable>
          );
        })}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.footnote}>{t('roomPreferences.footnote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.slate, lineHeight: 19, marginBottom: spacing.md },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  optionCardSelected: { borderColor: colors.turquoise, backgroundColor: '#F3FAF9' },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.sandLight,
    alignItems: 'center', justifyContent: 'center', ...shadow.card,
  },
  iconWrapSelected: { backgroundColor: colors.turquoiseDark },
  optionTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  optionDesc: { fontSize: 12, color: colors.slate, marginTop: 2, lineHeight: 16 },
  error: { color: colors.error, fontSize: 13, marginTop: spacing.sm, textAlign: 'center' },
  footnote: { fontSize: 11.5, color: colors.slate, marginTop: spacing.lg, lineHeight: 16 },
});
