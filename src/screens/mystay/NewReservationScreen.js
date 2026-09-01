import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, Pill, EmptyState, SectionHeader } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { getLocalizedString } from '../../i18n/content';
import roomAmenitiesContent from '../../i18n/content/roomAmenities';

const QUICK_DATE_OFFSETS = [
  { key: 'today', days: 0 },
  { key: 'tomorrow', days: 1 },
  { key: 'in3Days', days: 3 },
  { key: 'in1Week', days: 7 },
  { key: 'in2Weeks', days: 14 },
];

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}
function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
function formatDateShort(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Stepper({ value, min, max, onChange, label }) {
  const { t } = useTranslation();
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.stepperBtn}
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel={label ? `${t('common.decrease')} ${label}` : t('common.decrease')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="remove" size={18} color={colors.deepOcean} />
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value}</Text>
      <TouchableOpacity
        style={styles.stepperBtn}
        onPress={() => onChange(Math.min(max, value + 1))}
        accessibilityRole="button"
        accessibilityLabel={label ? `${t('common.increase')} ${label}` : t('common.increase')}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="add" size={18} color={colors.deepOcean} />
      </TouchableOpacity>
    </View>
  );
}

function RoomResultCard({ room, nights, checkIn, checkOut, adults, childrenCount, navigation }) {
  const { t, i18n } = useTranslation();
  const { roomTypes } = useApp();
  const tier = roomTypes.find((rt) => rt.name === room.type);
  const perNight = tier?.fromPricePerNight ?? null;
  const total = perNight != null ? perNight * nights : null;
  const amenities = Array.isArray(room.amenities) ? room.amenities.slice(0, 4) : [];

  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <View style={styles.resultHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultRoom}>{t('booking.roomNumber', { number: room.number })}</Text>
          <Text style={styles.resultType}>{room.type}</Text>
          {room.bed_config ? (
            <Text style={styles.resultMeta}>
              {room.bed_config} · {t('booking.maxGuests', { count: room.max_occupancy })}
            </Text>
          ) : null}
        </View>
        {perNight != null && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.resultPrice}>{t('booking.perNight', { price: perNight })}</Text>
            <Text style={styles.resultTotal}>{t('booking.totalForNights', { price: total, count: nights })}</Text>
          </View>
        )}
      </View>
      {amenities.length > 0 && (
        <View style={styles.amenityWrap}>
          {amenities.map((a) => (
            <View key={a} style={styles.amenityChip}>
              <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              <Text style={styles.amenityText}>{getLocalizedString(roomAmenitiesContent, a, i18n.language, a)}</Text>
            </View>
          ))}
        </View>
      )}
      <Button
        label={t('booking.bookThisRoom')}
        onPress={() => navigation.navigate('BookRoom', { room, checkIn, checkOut, nights, adults, children: childrenCount })}
        style={{ marginTop: spacing.md }}
      />
    </Card>
  );
}

export default function NewReservationScreen({ navigation }) {
  const { t } = useTranslation();
  const { searchAvailableRooms, roomTypes } = useApp();

  const quickDates = useMemo(() => {
    const now = new Date();
    return QUICK_DATE_OFFSETS.map((o) => ({ ...o, iso: toISODate(addDays(now, o.days)) }));
  }, []);

  const [checkIn, setCheckIn] = useState(quickDates[1].iso);
  const [nights, setNights] = useState(3);
  const [roomType, setRoomType] = useState(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  const checkOut = useMemo(() => toISODate(addDays(new Date(checkIn + 'T00:00:00'), nights)), [checkIn, nights]);

  const handleSearch = async () => {
    setSearching(true);
    setSearchError('');
    setSearched(true);
    const result = await searchAvailableRooms(checkIn, checkOut, roomType, adults + children);
    setSearching(false);
    if (!result.ok) {
      setSearchError(result.error || t('booking.searchError'));
      setResults([]);
      return;
    }
    setResults(result.rooms || []);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('booking.newReservationTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>{t('booking.subtitle')}</Text>

        <Text style={styles.label}>{t('booking.checkInLabel')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {quickDates.map((qd) => (
            <Pill
              key={qd.key}
              label={t(`booking.quickDates.${qd.key}`)}
              selected={checkIn === qd.iso}
              onPress={() => setCheckIn(qd.iso)}
            />
          ))}
        </View>

        <View style={styles.dateSummary}>
          <Text style={styles.dateSummaryText}>{formatDateShort(checkIn)}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.slate} style={{ marginHorizontal: 8 }} />
          <Text style={styles.dateSummaryText}>{formatDateShort(checkOut)}</Text>
        </View>

        <Text style={styles.label}>{t('booking.lengthOfStay')}</Text>
        <View style={styles.rowBetween}>
          <Stepper value={nights} min={1} max={14} onChange={setNights} label={t('booking.lengthOfStay')} />
          <Text style={styles.nightsLabel}>{t('booking.nights', { count: nights })}</Text>
        </View>

        <Text style={styles.label}>{t('booking.roomTypeLabel')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Pill label={t('booking.anyRoomType')} selected={roomType === null} onPress={() => setRoomType(null)} />
          {roomTypes.map((rt) => (
            <Pill key={rt.id} label={rt.name} selected={roomType === rt.name} onPress={() => setRoomType(rt.name)} />
          ))}
        </View>

        <Text style={styles.label}>{t('booking.adultsLabel')}</Text>
        <Stepper value={adults} min={1} max={4} onChange={setAdults} label={t('booking.adultsLabel')} />

        <Text style={styles.label}>{t('booking.childrenLabel')}</Text>
        <Stepper value={children} min={0} max={3} onChange={setChildren} label={t('booking.childrenLabel')} />

        {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}
        <Button
          label={t('booking.searchAvailability')}
          onPress={handleSearch}
          loading={searching}
          style={{ marginTop: spacing.lg }}
        />

        {searched && !searching && (
          <View style={{ marginTop: spacing.xl }}>
            {results.length > 0 ? (
              <>
                <SectionHeader title={t('booking.resultsTitle')} />
                {results.map((room) => (
                  <RoomResultCard
                    key={room.id}
                    room={room}
                    nights={nights}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    adults={adults}
                    childrenCount={children}
                    navigation={navigation}
                  />
                ))}
              </>
            ) : !searchError ? (
              <EmptyState icon="bed-outline" title={t('booking.emptyTitle')} subtitle={t('booking.emptySub')} />
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 13.5, color: colors.slate, marginBottom: spacing.md, lineHeight: 19 },
  label: { ...typography.label, color: colors.slate, marginTop: spacing.lg, marginBottom: spacing.sm },
  dateSummary: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  dateSummaryText: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  nightsLabel: { fontSize: 13.5, color: colors.slate },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stepperBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepperValue: { ...typography.subheading, color: colors.charcoal, minWidth: 24, textAlign: 'center' },
  errorText: { ...typography.bodySmall, color: colors.error, marginTop: spacing.md, textAlign: 'center' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resultRoom: { fontSize: 16, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  resultType: { fontSize: 13, color: colors.turquoiseDark, fontWeight: '600', marginTop: 2 },
  resultMeta: { fontSize: 11.5, color: colors.slate, marginTop: 4 },
  resultPrice: { fontSize: 13.5, fontWeight: '700', color: colors.charcoal },
  resultTotal: { fontSize: 11, color: colors.slate, marginTop: 2 },
  amenityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.sandLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  amenityText: { fontSize: 11.5, color: colors.charcoal, fontWeight: '600' },
});
