import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function CreateAccountScreen({ navigation }) {
  const { t } = useTranslation();
  const { signUp } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    const parts = name.trim().split(/\s+/);
    const result = await signUp({ email, password, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') });
    setLoading(false);
    if (!result?.ok) {
      setError(result.error || t('auth.unableToCreateAccount'));
      return;
    }
    navigation.navigate('MagicLink', { fromSignup: true });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('auth.createAccountTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{t('auth.joinOceanOasis')}</Text>
        <Text style={styles.sub}>{t('auth.createAccountSub')}</Text>

        <Field label={t('auth.fullName')} value={name} onChangeText={setName} placeholder={t('auth.fullNamePlaceholder')} />
        <Field label={t('auth.email')} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        <Field label={t('auth.password')} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label={t('auth.createAccount')} onPress={handleCreate} loading={loading} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  heading: { fontSize: 24, fontWeight: '700', color: colors.charcoal, marginBottom: 4, fontFamily: font.display },
  sub: { fontSize: 13.5, color: colors.slate, marginBottom: spacing.lg },
  error: { color: colors.error, fontSize: 13, marginBottom: spacing.md },
});
