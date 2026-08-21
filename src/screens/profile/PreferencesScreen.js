import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, Pill } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, font } from '../../theme/theme';
import { INTERESTS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export default function PreferencesScreen({ navigation }) {
  const { guest, setGuest } = useApp();
  const [selected, setSelected] = useState(guest.interests || []);
  const [saving, setSaving] = useState(false);

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setGuest((g) => ({ ...g, interests: selected }));
      setSaving(false);
      navigation.goBack();
    }, 500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Preferences & Interests" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.heading}>What are you interested in?</Text>
        <Text style={styles.sub}>We'll use this to personalize recommendations across the app.</Text>
        <View style={styles.pillWrap}>
          {INTERESTS.map((i) => (
            <Pill key={i.id} label={i.label} selected={selected.includes(i.id)} onPress={() => toggle(i.id)} />
          ))}
        </View>
        <Button label="Save Preferences" onPress={save} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 19, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  sub: { fontSize: 13, color: colors.slate, marginTop: 4, marginBottom: spacing.md },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
});
