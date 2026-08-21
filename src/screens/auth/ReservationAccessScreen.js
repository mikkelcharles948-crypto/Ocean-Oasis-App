import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { RESERVATION } from '../../data/mockData';

export default function ReservationAccessScreen({ navigation }) {
  const { signIn } = useApp();
  const [reservationNumber, setReservationNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = () => {
    setError('');
    if (!reservationNumber || !lastName) {
      setError('Please enter both your reservation number and last name.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Mock validation against the sample reservation
      signIn();
    }, 1000);
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
