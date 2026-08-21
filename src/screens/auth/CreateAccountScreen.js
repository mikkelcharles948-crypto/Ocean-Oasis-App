import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function CreateAccountScreen({ navigation }) {
  const { signIn } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('MagicLink', { fromSignup: true });
    }, 900);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Create Account" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Join Ocean Oasis</Text>
        <Text style={styles.sub}>Create an account to manage your stay and save your preferences.</Text>

        <Field label="Full Name" value={name} onChangeText={setName} placeholder="Amara Whitfield" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

        <Button label="Create Account" onPress={handleCreate} loading={loading} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  heading: { fontSize: 24, fontWeight: '700', color: colors.charcoal, marginBottom: 4 },
  sub: { fontSize: 13.5, color: colors.slate, marginBottom: spacing.lg },
});
