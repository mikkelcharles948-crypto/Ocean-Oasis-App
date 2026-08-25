import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, Pill } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';

const TEXT_SIZES = ['Standard', 'Large', 'Extra Large'];
const TEXT_SIZE_KEY = { Standard: 'standard', Large: 'large', 'Extra Large': 'extraLarge' };

export default function AccessibilityScreen({ navigation }) {
  const { t } = useTranslation();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [textSize, setTextSize] = useState('Standard');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('profile.accessibility')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.sectionLabel}>{t('accessibility.textSize')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
          {TEXT_SIZES.map((size) => (
            <Pill key={size} label={t(`accessibility.textSizes.${TEXT_SIZE_KEY[size]}`)} selected={textSize === size} onPress={() => setTextSize(size)} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t('accessibility.display')}</Text>
        <Card style={{ paddingVertical: 0 }}>
          <ToggleRow label={t('accessibility.boldText')} description={t('accessibility.boldTextDesc')} value={boldText} onValueChange={setBoldText} />
          <View style={styles.divider} />
          <ToggleRow label={t('accessibility.highContrast')} description={t('accessibility.highContrastDesc')} value={highContrast} onValueChange={setHighContrast} />
          <View style={styles.divider} />
          <ToggleRow label={t('accessibility.reduceMotion')} description={t('accessibility.reduceMotionDesc')} value={reduceMotion} onValueChange={setReduceMotion} />
        </Card>

        <Text style={styles.footnote}>{t('accessibility.footnote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({ label, description, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: colors.turquoise }} thumbColor={colors.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.slate, marginBottom: spacing.sm, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rowLabel: { fontSize: 14, fontWeight: '600', color: colors.charcoal, fontFamily: font.display },
  rowDesc: { fontSize: 11.5, color: colors.slate, marginTop: 2, lineHeight: 15 },
  divider: { height: 1, backgroundColor: colors.border },
  footnote: { fontSize: 11.5, color: colors.slate, marginTop: spacing.lg, lineHeight: 16 },
});
