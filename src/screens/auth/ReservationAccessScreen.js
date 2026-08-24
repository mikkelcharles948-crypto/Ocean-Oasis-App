import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { RESERVATION } from '../../data/mockData';

export default function ReservationAccessScreen({ navigation }) {
  const { sendMagicLink } = useApp();
  const [reservationNumber, setReservationNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setError('');
    if (!reservationNumber || !lastName) {
      setError('Please enter both your reservation number and last name.');
      return;
    }
    setLoading(true);
    const { data: email, error: lookupError } = await supabase.rpc('find_guest_email_for_reservation', {
      p_reservation_number: reservationNumber.trim(),
      p_last_name: lastName.trim(),
    });
    if (lookupError || !email) {
      setLoading(false);
      setError('We could not find a reservation matching those details.');
      return;
    }
    const result = await sendMagicLink(email);
    setLoading(false);
    if (!result?.ok) {
      setError(result?.error || 'Unable to send your sign-in link. Please try again.');
      return;
    }
    navigation.navigate('MagicLink', { email });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Reservation Access" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.heading}>Already staying with us?</Text>
        <Text style={styles.sub}>Enter your reservation number and last name to access your stay.</Text>

        <Field
          label="Reservation Number"
          value={reservationNumber}
          onChangeText={setReservationNumber}
          placeholder={`e.g. ${RESERVATION.reservationNumber}`}
        />
        <Field label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Whitfield" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Access My Stay" onPress={handleVerify} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  heading: { fontSize: 22, fontWeight: '700', color: colors.charcoal, marginBottom: 4 },
  sub: { fontSize: 13.5, color: colors.slate, marginBottom: spacing.lg, lineHeight: 19 },
  error: { color: colors.error, fontSize: 13, marginBottom: spacing.sm },
});
