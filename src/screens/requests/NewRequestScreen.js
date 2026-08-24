import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { SERVICE_REQUEST_CATEGORIES } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

export default function NewRequestScreen({ navigation, route }) {
  const { submitServiceRequest } = useApp();
  const preselected = route?.params?.category;
  const [category, setCategory] = useState(preselected || null);
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const result = await submitServiceRequest({ category: category?.label || category, description, preferredTime: preferredTime || 'No preference' });
    setSubmitting(false);
    if (result?.ok) setSuccess(true);
    else setError(result?.error || 'Your request could not be submitted.');
  };

  if (success) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title="Request Sent" onBack={() => navigation.goBack()} />
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={32} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Request received.</Text>
          <Text style={styles.successSub}>Our team has been notified and will update you as it progresses.</Text>
          <Button label="Back to Requests" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Request Something" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.grid}>
          {SERVICE_REQUEST_CATEGORIES.map((c) => {
            const selected = category?.id === c.id || category === c.label;
            return (
              <TouchableOpacity key={c.id} style={[styles.catTile, selected && styles.catTileSelected]} onPress={() => setCategory(c)}>
                <MaterialCommunityIcons
                  name={{
                    broom: 'broom', towel: 'towel', soap: 'shower-head', laundry: 'washing-machine',
                    roomservice: 'room-service', tools: 'tools', car: 'car', luggage: 'bag-suitcase',
                    alarm: 'alarm', concierge: 'bell-outline', other: 'dots-horizontal',
                  }[c.icon] || 'dots-horizontal'}
                  size={20}
                  color={selected ? colors.white : colors.deepOcean}
                />
                <Text style={[styles.catLabel, selected && { color: colors.white }]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Field label="Description" value={description} onChangeText={setDescription} placeholder="Tell us what you need…" multiline />
        <Field label="Preferred Time (optional)" value={preferredTime} onChangeText={setPreferredTime} placeholder="e.g. As soon as possible, 4:00 PM" />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.imageBtn}>
          <Ionicons name="camera-outline" size={18} color={colors.slate} />
          <Text style={styles.imageBtnText}>Attach a photo (optional)</Text>
        </TouchableOpacity>

        <Button
          label="Submit Request"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!category || !description}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.md },
  catTile: {
    width: '30%', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 12, alignItems: 'center', gap: 6,
  },
  catTileSelected: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
  catLabel: { fontSize: 10.5, fontWeight: '600', color: colors.charcoal, textAlign: 'center' },
  error: { color: colors.error, fontSize: 13, marginTop: spacing.sm },
  imageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border,
    borderStyle: 'dashed', borderRadius: radius.md, padding: spacing.sm, justifyContent: 'center', marginBottom: spacing.sm,
  },
  imageBtnText: { fontSize: 12.5, color: colors.slate },
  successWrap: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  successCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  successTitle: { fontSize: 20, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  successSub: { fontSize: 13.5, color: colors.slate, textAlign: 'center', marginTop: 6, lineHeight: 19 },
});
