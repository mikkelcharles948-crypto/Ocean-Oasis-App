import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, shadow, gradients, typography } from '../../theme/theme';
import { SERVICE_REQUEST_CATEGORIES } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const ICON_NAME_MAP = {
  broom: 'broom', towel: 'towel', soap: 'shower-head', laundry: 'washing-machine',
  roomservice: 'room-service', tools: 'tools', car: 'car', luggage: 'bag-suitcase',
  alarm: 'alarm', concierge: 'bell-outline', roomupgrade: 'arrow-up-bold-circle-outline', other: 'dots-horizontal',
};

export default function NewRequestScreen({ navigation, route }) {
  const { t } = useTranslation();
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
    const result = await submitServiceRequest({ category: category?.label || category, description, preferredTime: preferredTime || t('requests.noPreference') });
    setSubmitting(false);
    if (result?.ok) setSuccess(true);
    else setError(result?.error || t('requests.couldNotSubmit'));
  };

  if (success) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title={t('requests.requestSentTitle')} onBack={() => navigation.goBack()} />
        <View style={styles.successWrap}>
          <LinearGradient colors={gradients.success} style={styles.successCircle}>
            <Ionicons name="checkmark" size={32} color={colors.white} />
          </LinearGradient>
          <Text style={styles.successTitle}>{t('requests.requestReceived')}</Text>
          <Text style={styles.successSub}>{t('requests.requestReceivedSub')}</Text>
          <Button label={t('requests.backToRequests')} onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('requests.requestSomething')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.label}>{t('requests.category')}</Text>
        {/* Visual category tiles, not a form dropdown — picking a category
            should feel like a single tactile tap. */}
        <View style={styles.grid}>
          {SERVICE_REQUEST_CATEGORIES.map((c) => {
            const selected = category?.id === c.id || category === c.label;
            const label = t(`requests.categoryOptions.${c.id}`);
            return (
              <AnimatedPressable
                key={c.id}
                onPress={() => setCategory(c)}
                style={[styles.catTile, selected && styles.catTileSelected]}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
              >
                <View style={[styles.catIconWrap, selected && styles.catIconWrapSelected]}>
                  <MaterialCommunityIcons
                    name={ICON_NAME_MAP[c.icon] || 'dots-horizontal'}
                    size={20}
                    color={selected ? colors.white : colors.deepOcean}
                  />
                </View>
                <Text style={[styles.catLabel, selected && styles.catLabelSelected]} numberOfLines={2}>{label}</Text>
                {selected ? (
                  <View style={styles.catCheck}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.turquoise} />
                  </View>
                ) : null}
              </AnimatedPressable>
            );
          })}
        </View>

        <Field label={t('requests.description')} value={description} onChangeText={setDescription} placeholder={t('requests.descriptionPlaceholder')} multiline />
        <Field label={t('requests.preferredTimeOptional')} value={preferredTime} onChangeText={setPreferredTime} placeholder={t('requests.preferredTimePlaceholder')} />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={t('requests.submitRequest')}
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
  label: { ...typography.label, color: colors.slate, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.lg },
  catTile: {
    width: '31%', backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', gap: 8, position: 'relative',
  },
  catTileSelected: { borderColor: colors.deepOcean, backgroundColor: colors.sandLight, ...shadow.soft },
  catIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.sandLight, alignItems: 'center', justifyContent: 'center' },
  catIconWrapSelected: { backgroundColor: colors.deepOcean },
  catLabel: { fontSize: 11, fontWeight: '600', color: colors.slate, textAlign: 'center' },
  catLabelSelected: { color: colors.deepOcean, fontWeight: '700' },
  catCheck: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.white, borderRadius: 8 },
  error: { color: colors.error, fontSize: 13, marginTop: spacing.sm },
  successWrap: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  successCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadow.soft },
  successTitle: { ...typography.heading, color: colors.charcoal },
  successSub: { ...typography.body, color: colors.slate, textAlign: 'center', marginTop: 6 },
});
