import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { ScreenHeader, Pill } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';
import { INTERESTS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export default function PreferencesScreen({ navigation }) {
  const { t } = useTranslation();
  const { guest, updateGuest } = useApp();
  const [selected, setSelected] = useState(guest.interests || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    const result = await updateGuest({ interests: selected });
    setSaving(false);
    if (!result?.ok) {
      setError(result?.error || t('profile.savePreferencesError'));
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('profile.preferencesTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.heading}>{t('profile.whatInterested')}</Text>
        <Text style={styles.sub}>{t('profile.personalizeSub')}</Text>
        <View style={styles.pillWrap}>
          {INTERESTS.map((i) => (
            <Pill key={i.id} label={t(`onboarding.interests.${i.id}`)} selected={selected.includes(i.id)} onPress={() => toggle(i.id)} />
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={t('profile.savePreferences')} onPress={save} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heading: { ...typography.subheading, color: colors.charcoal },
  sub: { ...typography.bodySmall, color: colors.slate, marginTop: 4, marginBottom: spacing.md },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  error: { ...typography.bodySmall, color: colors.error, marginTop: spacing.md },
});
