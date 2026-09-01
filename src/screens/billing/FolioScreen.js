import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, Badge } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

function money(n) {
  return `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function FolioScreen({ navigation }) {
  const { t } = useTranslation();
  const { reservation, room, activityBookings, activities, guest, submitServiceRequest, roomTypes } = useApp();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');

  const tier = roomTypes.find((rt) => rt.name === room.type);
  const nightlyRate = tier?.fromPricePerNight || 0;
  const roomTotal = nightlyRate * (reservation.nights || 0);

  const myBookings = useMemo(
    () => activityBookings.filter((b) => b.guestName === `${guest.firstName} ${guest.lastName}`.trim() || b.guest_id === guest.id || b.guestId === guest.id),
    [activityBookings, guest]
  );
  const activityTotal = myBookings.reduce((s, b) => s + (b.amount || 0), 0);
  const grandTotal = roomTotal + activityTotal;

  const handleRequestCheckout = async () => {
    setRequesting(true);
    setError('');
    const result = await submitServiceRequest({
      category: 'Other',
      description: t('billing.checkoutRequestDescription', { total: money(grandTotal) }),
    });
    setRequesting(false);
    if (result?.ok === false) {
      setError(result.error || t('billing.checkoutRequestError'));
      return;
    }
    setRequested(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('billing.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.intro}>{t('billing.intro')}</Text>

        <Card style={{ marginTop: spacing.sm }}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>{t('billing.room')}</Text>
            <Text style={styles.lineValue}>{money(roomTotal)}</Text>
          </View>
          <Text style={styles.lineDetail}>
            {t('billing.roomDetail', { type: room.type, nights: reservation.nights, rate: money(nightlyRate) })}
          </Text>
        </Card>

        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>{t('billing.activities')}</Text>
          {myBookings.length === 0 ? (
            <Text style={styles.emptyText}>{t('billing.noActivityCharges')}</Text>
          ) : (
            myBookings.map((b) => (
              <Card key={b.id} style={styles.lineCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.lineLabel}>{activities.find((a) => a.id === b.activityId)?.name || t('billing.activityFallback')}</Text>
                  <Text style={styles.lineValue}>{money(b.amount)}</Text>
                </View>
              </Card>
            ))
          )}
        </View>

        <Card style={styles.totalCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>{t('billing.total')}</Text>
            <Text style={styles.totalValue}>{money(grandTotal)}</Text>
          </View>
          <Badge label={t('billing.estimateBadge')} tone="neutral" />
        </Card>

        <View style={styles.checkoutBox}>
          <View style={styles.checkoutIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.deepOcean} />
          </View>
          <Text style={styles.checkoutTitle}>{t('billing.contactlessCheckoutTitle')}</Text>
          <Text style={styles.checkoutSub}>{t('billing.contactlessCheckoutSub')}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={requested ? t('billing.checkoutRequested') : t('billing.requestCheckout')}
            onPress={handleRequestCheckout}
            loading={requesting}
            disabled={requested}
            variant={requested ? 'outline' : 'primary'}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.slate, lineHeight: 19 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginBottom: spacing.sm },
  lineLabel: { fontSize: 13, color: colors.charcoal, flex: 1, paddingRight: spacing.sm },
  lineValue: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  lineDetail: { fontSize: 11.5, color: colors.slate, marginTop: 4 },
  lineCard: { marginBottom: spacing.xs, paddingVertical: spacing.sm },
  emptyText: { fontSize: 12.5, color: colors.slate, fontStyle: 'italic' },
  totalCard: { marginTop: spacing.lg, backgroundColor: colors.deepOcean, alignItems: 'flex-start', gap: 8 },
  totalLabel: { fontSize: 13, color: colors.sandLight, fontWeight: '700' },
  totalValue: { fontSize: 24, color: colors.white, fontWeight: '700', fontFamily: font.display },
  checkoutBox: {
    marginTop: spacing.xl, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...shadow.card,
  },
  checkoutIconWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.sandLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  checkoutTitle: { fontSize: 15.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, textAlign: 'center' },
  checkoutSub: { fontSize: 12, color: colors.slate, textAlign: 'center', marginTop: 4, lineHeight: 17 },
  error: { color: colors.error, fontSize: 12.5, marginTop: spacing.sm, textAlign: 'center' },
});
