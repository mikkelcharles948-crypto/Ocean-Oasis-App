import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const PRESETS = [
  { key: 'evacuation', icon: 'exit-outline' },
  { key: 'weather', icon: 'thunderstorm-outline' },
  { key: 'security', icon: 'shield-outline' },
];

export default function ManagementEmergencyScreen({ navigation }) {
  const { t } = useTranslation();
  const { sendEmergencyBroadcast } = useApp();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [lastSentCount, setLastSentCount] = useState(null);

  const applyPreset = (key) => {
    setTitle(t(`management.emergency.presets.${key}.title`));
    setBody(t(`management.emergency.presets.${key}.body`));
  };

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      setError(t('management.emergency.fieldsRequired'));
      return;
    }
    Alert.alert(
      t('management.emergency.confirmTitle'),
      t('management.emergency.confirmMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('management.emergency.sendNow'),
          style: 'destructive',
          onPress: async () => {
            setSending(true);
            setError('');
            const result = await sendEmergencyBroadcast(title.trim(), body.trim());
            setSending(false);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setLastSentCount(result.count);
            setTitle('');
            setBody('');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('management.emergency.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={20} color="#9A5B26" />
          <Text style={styles.warningText}>{t('management.emergency.warning')}</Text>
        </View>

        <Text style={styles.label}>{t('management.emergency.presetsLabel')}</Text>
        <View style={styles.presetRow}>
          {PRESETS.map((p) => (
            <TouchableOpacity key={p.key} style={styles.presetChip} onPress={() => applyPreset(p.key)}>
              <Ionicons name={p.icon} size={16} color={colors.deepOcean} />
              <Text style={styles.presetLabel}>{t(`management.emergency.presets.${p.key}.chip`)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label={t('management.emergency.titleLabel')} value={title} onChangeText={setTitle} placeholder={t('management.emergency.titlePlaceholder')} />
        <Field label={t('management.emergency.messageLabel')} value={body} onChangeText={setBody} placeholder={t('management.emergency.messagePlaceholder')} multiline />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {lastSentCount !== null ? (
          <Text style={styles.success}>{t('management.emergency.sentConfirmation', { count: lastSentCount })}</Text>
        ) : null}

        <Button label={t('management.emergency.sendBroadcast')} onPress={handleSend} loading={sending} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  warningBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: '#F6E9DE',
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: '#EAD2B8',
  },
  warningText: { flex: 1, fontSize: 12.5, color: '#7A4A1E', lineHeight: 18 },
  label: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  presetChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8,
  },
  presetLabel: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  error: { color: colors.error, fontSize: 13, marginTop: spacing.sm },
  success: { color: colors.success, fontSize: 13, marginTop: spacing.sm, fontWeight: '600' },
});
