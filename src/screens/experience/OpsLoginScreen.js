import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '../../components/Button';
import { Field } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function OpsLoginScreen({ route, navigation }) {
  const { t } = useTranslation();
  const surface = route?.params?.surface || 'staff';
  const { opsSignIn, chooseExperience } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError(t('experience.enterEmailAndPassword'));
      return;
    }
    setLoading(true);
    setError('');
    const result = await opsSignIn(email, password, surface);
    setLoading(false);
    if (!result?.ok) {
      setError(result?.error || t('experience.unableToSignIn'));
      return;
    }
    chooseExperience(surface);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.lg }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
          <Ionicons name="chevron-back" size={24} color={colors.deepOcean} />
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Ionicons name={surface === 'staff' ? 'headset' : 'stats-chart'} size={26} color={colors.white} />
        </View>
        <Text style={styles.title}>{surface === 'staff' ? t('experience.staffSignIn') : t('experience.managementSignIn')}</Text>
        <Text style={styles.subtitle}>
          {surface === 'staff' ? t('experience.staffSignInSub') : t('experience.managementSignInSub')}
        </Text>

        <View style={{ marginTop: spacing.lg }}>
          <Field label={t('auth.email')} value={email} onChangeText={setEmail} placeholder="you@oceanoasisdominica.com" keyboardType="email-address" />
          <Field label={t('auth.password')} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <Button label={surface === 'staff' ? t('experience.enterStaffDashboard') : t('experience.enterManagementDashboard')} onPress={handleSignIn} loading={loading} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  subtitle: { fontSize: 13.5, color: colors.slate, marginTop: 6, lineHeight: 19 },
  error: { color: colors.error, fontSize: 13, marginTop: 4, marginBottom: spacing.sm },
});
