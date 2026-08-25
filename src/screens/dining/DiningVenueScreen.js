import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, ErrorState, Field } from '../../components/UI';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import Button from '../../components/Button';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { DINING_VENUES } from '../../data/mockData';
import { getLocalizedContent } from '../../i18n/content';
import diningVenuesContent from '../../i18n/content/diningVenues';

const TYPE_KEY = {
  'Signature Restaurant': 'signatureRestaurant',
  'All-Day Dining': 'allDayDining',
  'Bar & Lounge': 'barLounge',
  'Room Service': 'roomService',
};

export default function DiningVenueScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { venueId } = route.params || {};
  const rawVenue = DINING_VENUES.find((v) => v.id === venueId);
  const venue = rawVenue ? getLocalizedContent(diningVenuesContent, rawVenue.id, i18n.language, rawVenue) : null;
  const [showForm, setShowForm] = useState(false);
  const [party, setParty] = useState('2');
  const [time, setTime] = useState('7:00 PM');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!venue) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('dining.venueNotFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={venue.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.heroWrap}>
          <ImagePlaceholder kind={venue.image} uri={venue.imageUrl} style={{ height: 180 }} iconSize={40} />
        </View>
        <Text style={styles.type}>{t(`dining.type.${TYPE_KEY[venue.type] || 'roomService'}`)}</Text>
        <Text style={styles.name}>{venue.name}</Text>
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
              <Button label={t('dining.submit')} onPress={submit} loading={loading} />
            </View>
          )
        ) : (
          <View style={styles.confirmBox}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <Text style={styles.confirmText}>{t('dining.confirmText', { venue: venue.name })}</Text>
          </View>
        )}
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
  heroWrap: { borderRadius: radius.lg, ...shadow.float },
  type: { fontSize: 12, fontWeight: '700', color: colors.turquoiseDark, marginTop: spacing.md, letterSpacing: 0.5 },
  name: { fontSize: 24, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginTop: 4 },
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
});
