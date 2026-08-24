import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, Card, Pill } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';

const TEXT_SIZES = ['Standard', 'Large', 'Extra Large'];

export default function AccessibilityScreen({ navigation }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [textSize, setTextSize] = useState('Standard');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Accessibility" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.sectionLabel}>Text Size</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
          {TEXT_SIZES.map((size) => (
            <Pill key={size} label={size} selected={textSize === size} onPress={() => setTextSize(size)} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Display</Text>
        <Card style={{ paddingVertical: 0 }}>
          <ToggleRow label="Bold Text" description="Increase text weight for readability." value={boldText} onValueChange={setBoldText} />
          <View style={styles.divider} />
          <ToggleRow label="High Contrast" description="Increase contrast between text and backgrounds." value={highContrast} onValueChange={setHighContrast} />
          <View style={styles.divider} />
          <ToggleRow label="Reduce Motion" description="Minimize animations and transitions." value={reduceMotion} onValueChange={setReduceMotion} />
        </Card>

        <Text style={styles.footnote}>These preferences apply to this device and take effect immediately.</Text>
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
