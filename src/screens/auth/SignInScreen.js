import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function SignInScreen({ navigation }) {
  const { t } = useTranslation();
  const { signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    const result = await signIn(email, password);
    setLoading(false);
    if (!result?.ok) setError(result.error || t('auth.unableToSignIn'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('auth.signIn')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{t('auth.welcomeBack')}</Text>
        <Text style={styles.sub}>{t('auth.signInSubtitle')}</Text>

        <Field label={t('auth.email')} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        <Field label={t('auth.password')} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginBottom: spacing.lg }}>
          <Text style={styles.link}>{t('auth.forgotPassword')}</Text>
        </TouchableOpacity>

        <Button label={t('auth.signIn')} onPress={handleSignIn} loading={loading} />
        <Button
          label={t('auth.signInWithMagicLink')}
          variant="ghost"
          onPress={() => navigation.navigate('MagicLink')}
          style={{ marginTop: spacing.sm }}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t('auth.noAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
            <Text style={styles.link}>{t('auth.createOne')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  heading: { ...typography.heading, color: colors.charcoal, marginBottom: 4 },
  sub: { ...typography.bodySmall, color: colors.slate, marginBottom: spacing.lg },
  link: { color: colors.turquoiseDark, fontWeight: '600', fontSize: 13.5 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { ...typography.bodySmall, color: colors.slate },
  error: { ...typography.bodySmall, color: colors.error, marginBottom: spacing.md },
});
