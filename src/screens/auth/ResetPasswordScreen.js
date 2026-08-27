import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '../../components/Button';
import { ScreenHeader, Field } from '../../components/UI';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

// Reached only via a Supabase password-reset email link (see the deep-link
// handling in AppContext.js) — RootNavigator shows this in place of the
// normal signed-in app for as long as passwordRecoveryActive is true, since
// the recovery link signs in a real (temporary) session before the guest
// has actually chosen a new password.
export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { completePasswordRecovery, signOut } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError('');
    if (password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    setLoading(true);
    const result = await completePasswordRecovery(password);
    setLoading(false);
    if (!result?.ok) setError(result?.error || t('auth.unableToResetPassword'));
    // On success, passwordRecoveryActive flips false and RootNavigator
    // routes into the app on its own — no manual navigation needed here.
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('auth.chooseNewPasswordTitle')} onBack={signOut} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed-outline" size={30} color={colors.deepOcean} />
        </View>
        <Text style={styles.sub}>{t('auth.chooseNewPasswordSub')}</Text>

        <Field label={t('auth.newPassword')} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        <Field label={t('auth.confirmPassword')} value={confirm} onChangeText={setConfirm} placeholder="••••••••" secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={t('auth.savePassword')} onPress={handleSave} loading={loading} style={{ marginTop: spacing.lg }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, alignItems: 'center', marginTop: spacing.lg },
  iconCircle: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#E1F2F1',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  sub: { ...typography.bodySmall, color: colors.slate, textAlign: 'center', marginBottom: spacing.lg },
  error: { ...typography.bodySmall, color: colors.error, marginTop: spacing.sm },
});
