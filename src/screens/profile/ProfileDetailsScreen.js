import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function ProfileDetailsScreen({ navigation }) {
  const { guest, updateGuest } = useApp();
  const [firstName, setFirstName] = useState(guest.firstName);
  const [lastName, setLastName] = useState(guest.lastName);
  const [email, setEmail] = useState(guest.email);
  const [phone, setPhone] = useState(guest.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    const result = await updateGuest({ firstName, lastName, email, phone });
    setSaving(false);
    if (result?.ok) navigation.goBack();
    else setError(result?.error || 'Your profile could not be saved.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Personal Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Field label="First Name" value={firstName} onChangeText={setFirstName} />
        <Field label="Last Name" value={lastName} onChangeText={setLastName} />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {error ? <Text style={{ color: colors.error, fontSize: 13, marginTop: spacing.sm }}>{error}</Text> : null}
        <Button label="Save Changes" onPress={save} loading={saving} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </SafeAreaView>
  );
}
