import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function BiometricLockScreen() {
  const { t } = useTranslation();
  const { unlockWithBiometrics, unlockWithPasswordFallback } = useApp();
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const attemptUnlock = async () => {
    setChecking(true);
    setError('');
    const result = await unlockWithBiometrics();
    setChecking(false);
    if (!result.ok) setError(result.error || t('auth.biometric.failed'));
  };

  useEffect(() => {
    attemptUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.deepOcean }}>
      <View style={styles.content}>
        <Logo size="lg" light />
        <View style={styles.iconWrap}>
          <Ionicons name="finger-print" size={40} color={colors.white} />
        </View>
        <Text style={styles.title}>{t('auth.biometric.locked')}</Text>
        <Text style={styles.sub}>{t('auth.biometric.lockedSub')}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={t('auth.biometric.tryAgain')} onPress={attemptUnlock} loading={checking} style={{ marginTop: spacing.lg, width: '100%' }} />
        <Button
          label={t('auth.biometric.usePassword')}
          variant="outline"
          onPress={unlockWithPasswordFallback}
          style={{ marginTop: spacing.sm, width: '100%', borderColor: 'rgba(255,255,255,0.4)' }}
          textStyle={{ color: colors.white }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconWrap: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, marginBottom: spacing.lg,
  },
  title: { ...typography.heading, color: colors.white, textAlign: 'center' },
  sub: { ...typography.bodySmall, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 8 },
  error: { ...typography.bodySmall, color: colors.goldSoft, marginTop: spacing.md, textAlign: 'center' },
});
