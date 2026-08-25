import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) {
      setError(t('auth.enterEmailAddress'));
      return;
    }
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('auth.resetPasswordTitle')} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        {!sent ? (
          <>
            <Text style={styles.heading}>{t('auth.forgotYourPassword')}</Text>
            <Text style={styles.sub}>{t('auth.forgotPasswordSub')}</Text>
            <Field label={t('auth.email')} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label={t('auth.sendResetLink')} onPress={handleSend} loading={loading} />
          </>
        ) : (
          <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={30} color={colors.white} />
            </View>
            <Text style={styles.heading}>{t('auth.checkYourEmail')}</Text>
            <Text style={styles.sub}>{t('auth.checkYourEmailSub', { email: email || t('auth.yourEmail') })}</Text>
            <Button label={t('auth.backToSignIn')} variant="outline" onPress={() => navigation.navigate('SignIn')} style={{ marginTop: spacing.md }} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  heading: { ...typography.heading, color: colors.charcoal, marginBottom: 4, textAlign: 'center' },
  sub: { ...typography.bodySmall, color: colors.slate, marginBottom: spacing.lg, textAlign: 'center' },
  error: { ...typography.bodySmall, color: colors.error, marginBottom: spacing.sm, textAlign: 'center' },
  successCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
});
