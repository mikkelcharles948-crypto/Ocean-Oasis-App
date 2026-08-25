import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function ProfileDetailsScreen({ navigation }) {
  const { t } = useTranslation();
  const { guest, updateGuest } = useApp();
  const [firstName, setFirstName] = useState(guest.firstName);
  const [lastName, setLastName] = useState(guest.lastName);
  const [email, setEmail] = useState(guest.email);
  const [phone, setPhone] = useState(guest.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    const result = await updateGuest({ firstName, lastName, email, phone });
    setSaving(false);
    if (result?.ok) navigation.goBack();
    else setError(result?.error || t('profile.couldNotSaveProfile'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('profile.profileDetailsTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Field label={t('profile.firstName')} value={firstName} onChangeText={setFirstName} />
        <Field label={t('profile.lastName')} value={lastName} onChangeText={setLastName} />
        <Field label={t('profile.email')} value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label={t('profile.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {error ? <Text style={{ ...typography.bodySmall, color: colors.error, marginTop: spacing.sm }}>{error}</Text> : null}
        <Button label={t('profile.saveChanges')} onPress={save} loading={saving} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </SafeAreaView>
  );
}
