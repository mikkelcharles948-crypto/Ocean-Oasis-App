import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme/theme';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Enter your email address.');
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
      <ScreenHeader title="Reset Password" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        {!sent ? (
          <>
            <Text style={styles.heading}>Forgot your password?</Text>
            <Text style={styles.sub}>Enter your email and we'll send you a link to reset it.</Text>
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Send Reset Link" onPress={handleSend} loading={loading} />
          </>
        ) : (
          <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={30} color={colors.white} />
            </View>
            <Text style={styles.heading}>Check your email</Text>
            <Text style={styles.sub}>We've sent password reset instructions to {email || 'your email'}.</Text>
            <Button label="Back to Sign In" variant="outline" onPress={() => navigation.navigate('SignIn')} style={{ marginTop: spacing.md }} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  heading: { fontSize: 22, fontWeight: '700', color: colors.charcoal, marginBottom: 4, textAlign: 'center' },
  sub: { fontSize: 13.5, color: colors.slate, marginBottom: spacing.lg, textAlign: 'center' },
  error: { color: colors.error, fontSize: 13, marginBottom: spacing.sm, textAlign: 'center' },
  successCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
});
