import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { ScreenHeader, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { RESERVATION } from '../../data/mockData';

export default function ReservationAccessScreen({ navigation }) {
  const { t } = useTranslation();
  const { sendMagicLink } = useApp();
  const [reservationNumber, setReservationNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setError('');
    if (!reservationNumber || !lastName) {
      setError(t('auth.reservationNumberRequired'));
      return;
    }
    setLoading(true);
    const { data: email, error: lookupError } = await supabase.rpc('find_guest_email_for_reservation', {
      p_reservation_number: reservationNumber.trim(),
      p_last_name: lastName.trim(),
    });
    if (lookupError || !email) {
      setLoading(false);
      setError(t('auth.reservationLookupFailed'));
      return;
    }
    const result = await sendMagicLink(email);
    setLoading(false);
    if (!result?.ok) {
      setError(result?.error || t('auth.unableToSendLinkRetry'));
      return;
    }
    navigation.navigate('MagicLink', { email });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('auth.reservationAccessTitle')} onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.heading}>{t('auth.alreadyStaying')}</Text>
        <Text style={styles.sub}>{t('auth.reservationAccessSub')}</Text>

        <Field
          label={t('auth.reservationNumber')}
          value={reservationNumber}
          onChangeText={setReservationNumber}
          placeholder={`e.g. ${RESERVATION.reservationNumber}`}
        />
        <Field label={t('auth.lastName')} value={lastName} onChangeText={setLastName} placeholder={t('auth.lastNamePlaceholder')} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label={t('auth.accessMyStay')} onPress={handleVerify} loading={loading} style={{ marginTop: spacing.sm }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  heading: { ...typography.heading, color: colors.charcoal, marginBottom: 4 },
  sub: { ...typography.bodySmall, color: colors.slate, marginBottom: spacing.lg },
  error: { ...typography.bodySmall, color: colors.error, marginBottom: spacing.sm },
});
