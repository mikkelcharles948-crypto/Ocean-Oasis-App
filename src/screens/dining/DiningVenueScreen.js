import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ErrorState, Field } from '../../components/UI';
import FloatingHeader from '../../components/FloatingHeader';
import Button from '../../components/Button';
import { colors, spacing, radius, typography } from '../../theme/theme';
import { getLocalizedContent } from '../../i18n/content';
import diningVenuesContent from '../../i18n/content/diningVenues';
import { optimizeImageUrl } from '../../utils/optimizeImageUrl';
import { useApp } from '../../context/AppContext';
import { resolvePhotoUrl } from '../../utils/photoOverrides';

const TYPE_KEY = {
  'Signature Restaurant': 'signatureRestaurant',
  'All-Day Dining': 'allDayDining',
  'Bar & Lounge': 'barLounge',
  'Room Service': 'roomService',
};

export default function DiningVenueScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { submitServiceRequest, photoOverrides, diningVenues } = useApp();
  const { venueId } = route.params || {};
  const rawVenue = diningVenues.find((v) => v.id === venueId);
  const localizedVenue = rawVenue ? getLocalizedContent(diningVenuesContent, rawVenue.id, i18n.language, rawVenue) : null;
  const venue = localizedVenue
    ? { ...localizedVenue, imageUrl: resolvePhotoUrl(photoOverrides, `dining:${venueId}`, localizedVenue.imageUrl) }
    : null;
  const [showForm, setShowForm] = useState(false);
  const [party, setParty] = useState('2');
  const [time, setTime] = useState('7:00 PM');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  if (!venue) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('dining.venueNotFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  // Routed through the real service-request pipeline (reaches staff's
  // actual queue) rather than a fake local confirmation — there's no
  // dedicated dining-reservation table/RPC, but Concierge/Room Service
  // requests are real, Supabase-backed, and already staff-visible.
  const submit = async () => {
    setLoading(true);
    setError('');
    const category = venue.reservationRequired ? 'Concierge' : 'Room Service';
    const description = venue.reservationRequired
      ? t('dining.reservationRequestDescription', { venue: venue.name, party, time })
      : t('dining.roomServiceRequestDescription', { venue: venue.name });
    const result = await submitServiceRequest({ category, description, preferredTime: time });
    setLoading(false);
    if (!result?.ok) {
      setError(result?.error || t('dining.requestError'));
      return;
    }
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {venue.imageUrl && !imageFailed ? (
            <Image source={{ uri: optimizeImageUrl(venue.imageUrl, 900) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} onError={() => setImageFailed(true)} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.heroFallback]}>
              <Ionicons name="restaurant-outline" size={48} color={colors.turquoiseDark} />
            </View>
          )}
          <FloatingHeader tone="light" onBack={() => navigation.goBack()} />
        </View>

        <View style={styles.content}>
          <Text style={[typography.label, styles.type]}>{t(`dining.type.${TYPE_KEY[venue.type] || 'roomService'}`)}</Text>
          <Text style={[typography.display, styles.name]}>{venue.name}</Text>
          <Text style={styles.desc}>{venue.description}</Text>

          <View style={styles.infoBox}>
            <InfoRow icon="time-outline" label={t('dining.hours')} value={venue.hours} />
            <InfoRow icon="shirt-outline" label={t('dining.dressCode')} value={venue.dressCode} />
            <InfoRow icon="location-outline" label={t('dining.location')} value={venue.location} />
          </View>

          <Button label={t('dining.viewMenu')} variant="outline" onPress={() => navigation.navigate('Menu', { venueId: venue.id })} style={{ marginTop: spacing.lg }} />

          {!submitted ? (
            !showForm ? (
              <Button
                label={venue.reservationRequired ? t('dining.reserveTable') : t('dining.requestRoomService')}
                onPress={() => setShowForm(true)}
                style={{ marginTop: spacing.sm }}
              />
            ) : (
              <View style={styles.formBox}>
                <Field label={t('dining.partySize')} value={party} onChangeText={setParty} keyboardType="number-pad" />
                <Field label={t('dining.preferredTime')} value={time} onChangeText={setTime} />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button label={t('dining.submit')} onPress={submit} loading={loading} />
              </View>
            )
          ) : (
            <View style={styles.confirmBox}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <Text style={styles.confirmText}>{t('dining.confirmText', { venue: venue.name })}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.deepOcean} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 260, overflow: 'hidden' },
  heroFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sandLight },
  content: { padding: spacing.lg },
  type: { color: colors.goldDark, marginBottom: 4 },
  name: { color: colors.charcoal },
  desc: { fontSize: 14, color: colors.slate, marginTop: 8, lineHeight: 21 },
  infoBox: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 12, color: colors.slate, width: 74 },
  infoValue: { fontSize: 12.5, color: colors.charcoal, fontWeight: '600', flex: 1 },
  formBox: { marginTop: spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  confirmBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#E4F1E9',
    padding: spacing.md, borderRadius: radius.md, marginTop: spacing.lg,
  },
  confirmText: { flex: 1, fontSize: 12.5, color: colors.success, lineHeight: 18 },
  errorText: { fontSize: 12.5, color: colors.error, marginTop: spacing.sm },
});
