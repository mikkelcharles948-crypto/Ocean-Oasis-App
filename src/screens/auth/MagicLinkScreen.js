import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/Button';
import { ScreenHeader } from '../../components/UI';
import { colors, spacing } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function MagicLinkScreen({ navigation, route }) {
  const { signIn } = useApp();
  const fromSignup = route?.params?.fromSignup;
  const [verifying, setVerifying] = useState(false);

  const handleTapLink = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      signIn();
    }, 1200);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={fromSignup ? 'Verify Email' : 'Magic Link'} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={30} color={colors.deepOcean} />
        </View>
        <Text style={styles.heading}>
          {fromSignup ? 'Verify your email' : 'Check your inbox'}
        </Text>
        <Text style={styles.sub}>
          {fromSignup
            ? "We've sent a verification link to your email. Tap it to activate your Ocean Oasis account."
            : "We've sent a secure sign-in link to your email. Tap it on this device to continue."}
        </Text>

        <Button
          label={verifying ? 'Verifying…' : 'Simulate Tapping Email Link'}
          onPress={handleTapLink}
          loading={verifying}
          style={{ marginTop: spacing.lg }}
        />
        <Text style={styles.hint}>(In production this screen is opened automatically from the email link.)</Text>
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
  heading: { fontSize: 21, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
  sub: { fontSize: 13.5, color: colors.slate, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  hint: { fontSize: 11.5, color: colors.slate, marginTop: spacing.md, textAlign: 'center', fontStyle: 'italic' },
});
