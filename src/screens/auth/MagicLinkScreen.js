import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '../../components/Button';
import { ScreenHeader, Field } from '../../components/UI';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function MagicLinkScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { sendMagicLink } = useApp();
  const [email, setEmail] = useState(route?.params?.email || '');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(!!route?.params?.email);
  const fromSignup = route?.params?.fromSignup;
  const [verifying, setVerifying] = useState(false);

  const handleTapLink = async () => {
    setVerifying(true);
    setError('');
    const result = await sendMagicLink(email);
    setVerifying(false);
    if (result?.ok) setSent(true);
    else setError(result?.error || t('auth.unableToSendLink'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={fromSignup ? t('auth.verifyEmailTitle') : t('auth.magicLinkTitle')} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={30} color={colors.deepOcean} />
        </View>
        <Text style={styles.heading}>
          {fromSignup ? t('auth.verifyYourEmail') : t('auth.checkYourInbox')}
        </Text>
        <Text style={styles.sub}>
          {fromSignup ? t('auth.verifyEmailSub') : t('auth.magicLinkSub')}
        </Text>

        <Field label={t('auth.email')} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={verifying ? t('auth.sending') : sent ? t('auth.linkSent') : t('auth.sendSignInLink')}
          onPress={handleTapLink}
          loading={verifying}
          disabled={sent}
          style={{ marginTop: spacing.lg }}
        />
        <Text style={styles.hint}>{t('auth.devHint')}</Text>
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
  heading: { ...typography.heading, color: colors.charcoal, textAlign: 'center' },
  sub: { ...typography.bodySmall, color: colors.slate, textAlign: 'center', marginTop: 8 },
  hint: { fontSize: 11.5, color: colors.slate, marginTop: spacing.md, textAlign: 'center', fontStyle: 'italic' },
  error: { ...typography.bodySmall, color: colors.error, marginTop: spacing.sm },
});
