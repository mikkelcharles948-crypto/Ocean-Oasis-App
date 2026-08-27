import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { TextInput } from '../../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, Badge, EmptyState, Field, Pill } from '../../components/UI';
import AnimatedPressable from '../../components/AnimatedPressable';
import GlassSurface from '../../components/GlassSurface';
import Button from '../../components/Button';
import { colors, spacing, radius, font, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { ROOM_TYPES } from '../../data/mockData';

// -----------------------------------------------------------------------
// Date helpers — this project has no date-picker dependency installed, so
// check-in/check-out are chosen from a horizontally-scrolling strip of
// date chips (next ~60 days for check-in, next ~30 days after check-in for
// check-out) rather than pulling in a new native library.
// -----------------------------------------------------------------------
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function addDays(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}
function dateRange(startISO, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(addDays(startISO, i));
  return out;
}
function chipLabel(iso, lang) {
  try {
    return fromISO(iso).toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}
function fullLabel(iso, lang) {
  try {
    return fromISO(iso).toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}
function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = fromISO(checkOut).getTime() - fromISO(checkIn).getTime();
  return Math.round(ms / 86400000);
}

function DateChipRow({ dates, value, onChange, lang }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {dates.map((d) => (
        <TouchableOpacity key={d} onPress={() => onChange(d)} style={[styles.dateChip, value === d && styles.dateChipActive]}>
          <Text style={[styles.dateChipText, value === d && styles.dateChipTextActive]}>{chipLabel(d, lang)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function Stepper({ value, onChange, min = 0, max = 12 }) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={[styles.stepperBtn, value <= min && styles.stepperBtnDisabled]}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
      >
        <Ionicons name="remove" size={18} color={value <= min ? colors.slate : colors.deepOcean} />
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value}</Text>
      <TouchableOpacity
        style={[styles.stepperBtn, value >= max && styles.stepperBtnDisabled]}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
      >
        <Ionicons name="add" size={18} color={value >= max ? colors.slate : colors.deepOcean} />
      </TouchableOpacity>
    </View>
  );
}

const STEPS = ['guest', 'details', 'confirm'];

export default function StaffNewBookingScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { allGuestsForStaff, searchAvailableRoomsStaff, createReservationForGuest, createGuestProfile } = useApp();

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];

  // --- Guest step ---
  const [guestTab, setGuestTab] = useState('existing'); // 'existing' | 'new'
  const [guestQuery, setGuestQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null); // { id, firstName, lastName }
  const [newGuestForm, setNewGuestForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [creatingGuest, setCreatingGuest] = useState(false);
  const [guestError, setGuestError] = useState('');

  // --- Details / availability step ---
  const todayISO = useMemo(() => toISO(new Date()), []);
  const checkInDates = useMemo(() => dateRange(todayISO, 60), [todayISO]);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const checkOutDates = useMemo(() => (checkIn ? dateRange(addDays(checkIn, 1), 30) : []), [checkIn]);
  const [roomTypeFilter, setRoomTypeFilter] = useState(null); // null = any
  const [guestCount, setGuestCount] = useState(2);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [availableRooms, setAvailableRooms] = useState(null); // null = not searched yet
  const [selectedRoom, setSelectedRoom] = useState(null);

  // --- Confirm step ---
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  const filteredGuests = useMemo(() => {
    const q = guestQuery.trim().toLowerCase();
    if (!q) return allGuestsForStaff;
    return allGuestsForStaff.filter((g) => `${g.firstName} ${g.lastName}`.toLowerCase().includes(q));
  }, [allGuestsForStaff, guestQuery]);

  const resetAll = () => {
    setStepIndex(0);
    setGuestTab('existing');
    setGuestQuery('');
    setSelectedGuest(null);
    setNewGuestForm({ firstName: '', lastName: '', email: '', phone: '' });
    setGuestError('');
    setCheckIn(null);
    setCheckOut(null);
    setRoomTypeFilter(null);
    setGuestCount(2);
    setSearchError('');
    setAvailableRooms(null);
    setSelectedRoom(null);
    setAdults(1);
    setChildren(0);
    setSpecialRequests('');
    setArrivalTime('');
    setBookingError('');
    setConfirmedReservation(null);
  };

  const handleBack = () => {
    if (confirmedReservation) {
      navigation.goBack();
      return;
    }
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  const submitNewGuest = async () => {
    if (!newGuestForm.firstName.trim() || !newGuestForm.lastName.trim()) return;
    setCreatingGuest(true);
    setGuestError('');
    const result = await createGuestProfile(newGuestForm);
    setCreatingGuest(false);
    if (result.ok) {
      setSelectedGuest({ id: result.guest.id, firstName: result.guest.first_name, lastName: result.guest.last_name });
      setGuestTab('existing');
      setGuestQuery('');
    } else {
      setGuestError(result.error || t('staff.newBooking.guestCreateErrorFallback'));
    }
  };

  const runSearch = async () => {
    if (!checkIn || !checkOut) return;
    setSearching(true);
    setSearchError('');
    setAvailableRooms(null);
    setSelectedRoom(null);
    const result = await searchAvailableRoomsStaff(checkIn, checkOut, roomTypeFilter, guestCount);
    setSearching(false);
    if (result.ok) {
      setAvailableRooms(result.rooms);
    } else {
      setSearchError(result.error || t('staff.newBooking.searchErrorFallback'));
    }
  };

  const chooseRoom = (room) => {
    setSelectedRoom(room);
    setAdults(Math.max(1, guestCount));
    setChildren(0);
    setBookingError('');
    setStepIndex(2);
  };

  const submitBooking = async () => {
    if (!selectedGuest || !selectedRoom || !checkIn || !checkOut) return;
    setBooking(true);
    setBookingError('');
    const result = await createReservationForGuest(selectedGuest.id, {
      roomId: selectedRoom.id,
      checkIn,
      checkOut,
      adults,
      children,
      specialRequests: specialRequests.trim(),
      arrivalTime: arrivalTime.trim(),
    });
    setBooking(false);
    if (result.ok) {
      setConfirmedReservation(result.reservation);
    } else {
      setBookingError(result.error || t('staff.newBooking.bookingErrorFallback'));
    }
  };

  const nights = nightsBetween(checkIn, checkOut);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('staff.newBooking.title')} onBack={handleBack} />

      {!confirmedReservation && (
        <View style={styles.stepIndicatorRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepIndicatorItem}>
              <View style={[styles.stepDot, i <= stepIndex && styles.stepDotActive]}>
                {i < stepIndex ? (
                  <Ionicons name="checkmark" size={13} color={colors.white} />
                ) : (
                  <Text style={[styles.stepDotText, i <= stepIndex && styles.stepDotTextActive]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepIndicatorLabel, i === stepIndex && styles.stepIndicatorLabelActive]}>
                {t(`staff.newBooking.step${s.charAt(0).toUpperCase()}${s.slice(1)}`)}
              </Text>
              {i < STEPS.length - 1 && <View style={styles.stepConnector} />}
            </View>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
        {confirmedReservation ? (
          <GlassSurface style={styles.successCard} borderRadius={radius.lg} intensity={38} tint="light">
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={54} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>{t('staff.newBooking.successTitle')}</Text>
            <Text style={styles.successSubtitle}>
              {t('staff.newBooking.successSubtitle', { number: confirmedReservation.reservationNumber })}
            </Text>
            <View style={styles.successDivider} />
            <Text style={styles.successLine}>
              {t('staff.newBooking.successGuest', { name: `${selectedGuest?.firstName} ${selectedGuest?.lastName}` })}
            </Text>
            <Text style={styles.successLine}>
              {t('staff.newBooking.successRoom', { number: selectedRoom?.number, type: selectedRoom?.type })}
            </Text>
            <Text style={styles.successLine}>
              {t('staff.newBooking.successDates', { checkIn: fullLabel(checkIn, i18n.language), checkOut: fullLabel(checkOut, i18n.language) })}
            </Text>
            <Button label={t('staff.newBooking.newBookingButton')} variant="outline" onPress={resetAll} style={{ marginTop: spacing.lg }} />
            <Button label={t('staff.newBooking.doneButton')} onPress={() => navigation.goBack()} style={{ marginTop: spacing.sm }} />
          </GlassSurface>
        ) : step === 'guest' ? (
          <>
            <Text style={styles.stepTitle}>{t('staff.newBooking.guestStepTitle')}</Text>
            <Text style={styles.stepSubtitle}>{t('staff.newBooking.guestStepSubtitle')}</Text>

            {selectedGuest && (
              <Card style={styles.selectedGuestCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedGuestLabel}>{t('staff.newBooking.selectedGuestLabel')}</Text>
                  <Text style={styles.selectedGuestName}>{selectedGuest.firstName} {selectedGuest.lastName}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedGuest(null)}>
                  <Text style={styles.changeLink}>{t('staff.newBooking.changeGuest')}</Text>
                </TouchableOpacity>
              </Card>
            )}

            {!selectedGuest && (
              <>
                <View style={styles.tabRow}>
                  <Pill label={t('staff.newBooking.existingGuestTab')} selected={guestTab === 'existing'} onPress={() => setGuestTab('existing')} />
                  <Pill label={t('staff.newBooking.newGuestTab')} selected={guestTab === 'new'} onPress={() => setGuestTab('new')} />
                </View>

                {guestTab === 'existing' ? (
                  <>
                    <View style={styles.searchBox}>
                      <Ionicons name="search" size={16} color={colors.slate} />
                      <TextInput
                        style={styles.searchInput}
                        value={guestQuery}
                        onChangeText={setGuestQuery}
                        placeholder={t('staff.newBooking.searchGuestsPlaceholder')}
                        placeholderTextColor={colors.slate}
                        returnKeyType="search"
                      />
                    </View>
                    {filteredGuests.length === 0 ? (
                      <EmptyState
                        icon="people-outline"
                        title={t('staff.newBooking.noGuestsFound')}
                        subtitle={t('staff.newBooking.noGuestsFoundSub')}
                        actionLabel={t('staff.newBooking.newGuestTab')}
                        onAction={() => setGuestTab('new')}
                      />
                    ) : (
                      <View style={{ gap: spacing.sm }}>
                        {filteredGuests.map((g) => (
                          <AnimatedPressable key={g.id} onPress={() => setSelectedGuest(g)}>
                            <Card style={styles.guestRow}>
                              <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{g.firstName[0]}{g.lastName[0]}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.guestName}>{g.firstName} {g.lastName}</Text>
                                <Text style={styles.guestMeta}>
                                  {g.roomNumber
                                    ? t('staff.guests.roomReservation', { room: g.roomNumber, reservation: g.reservationNumber })
                                    : t('staff.newBooking.noStayOnFile')}
                                </Text>
                              </View>
                              <Ionicons name="chevron-forward" size={18} color={colors.slate} />
                            </Card>
                          </AnimatedPressable>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View>
                    <Field label={t('staff.newBooking.newGuestFirstName')} value={newGuestForm.firstName} onChangeText={(v) => setNewGuestForm({ ...newGuestForm, firstName: v })} />
                    <Field label={t('staff.newBooking.newGuestLastName')} value={newGuestForm.lastName} onChangeText={(v) => setNewGuestForm({ ...newGuestForm, lastName: v })} />
                    <Field label={t('staff.newBooking.newGuestEmail')} value={newGuestForm.email} onChangeText={(v) => setNewGuestForm({ ...newGuestForm, email: v })} keyboardType="email-address" />
                    <Field label={t('staff.newBooking.newGuestPhone')} value={newGuestForm.phone} onChangeText={(v) => setNewGuestForm({ ...newGuestForm, phone: v })} keyboardType="phone-pad" />
                    {!!guestError && <Text style={styles.errorText}>{guestError}</Text>}
                    <Button
                      label={creatingGuest ? t('staff.newBooking.creatingGuest') : t('staff.newBooking.createGuestButton')}
                      onPress={submitNewGuest}
                      loading={creatingGuest}
                      disabled={!newGuestForm.firstName.trim() || !newGuestForm.lastName.trim()}
                      style={{ marginTop: spacing.xs }}
                    />
                  </View>
                )}
              </>
            )}

            <Button
              label={t('common.continue')}
              onPress={() => setStepIndex(1)}
              disabled={!selectedGuest}
              style={{ marginTop: spacing.lg }}
            />
          </>
        ) : step === 'details' ? (
          <>
            <Text style={styles.stepTitle}>{t('staff.newBooking.detailsStepTitle')}</Text>
            <Text style={styles.stepSubtitle}>{t('staff.newBooking.detailsStepSubtitle')}</Text>

            <Text style={styles.fieldLabel}>{t('staff.newBooking.checkInLabel')}</Text>
            <DateChipRow dates={checkInDates} value={checkIn} lang={i18n.language} onChange={(d) => {
              setCheckIn(d);
              if (checkOut && fromISO(checkOut) <= fromISO(d)) setCheckOut(null);
              setAvailableRooms(null);
            }} />
            {checkIn && <Text style={styles.selectedDateText}>{fullLabel(checkIn, i18n.language)}</Text>}

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>{t('staff.newBooking.checkOutLabel')}</Text>
            {checkIn ? (
              <>
                <DateChipRow dates={checkOutDates} value={checkOut} lang={i18n.language} onChange={(d) => { setCheckOut(d); setAvailableRooms(null); }} />
                {checkOut && <Text style={styles.selectedDateText}>{fullLabel(checkOut, i18n.language)}</Text>}
              </>
            ) : (
              <Text style={styles.hintText}>{t('staff.newBooking.chooseCheckInFirst')}</Text>
            )}

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>{t('staff.newBooking.roomTypeLabel')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <TouchableOpacity onPress={() => { setRoomTypeFilter(null); setAvailableRooms(null); }} style={[styles.chip, !roomTypeFilter && styles.chipActive]}>
                <Text style={[styles.chipText, !roomTypeFilter && styles.chipTextActive]}>{t('staff.newBooking.anyRoomType')}</Text>
              </TouchableOpacity>
              {ROOM_TYPES.map((rt) => (
                <TouchableOpacity key={rt.id} onPress={() => { setRoomTypeFilter(rt.name); setAvailableRooms(null); }} style={[styles.chip, roomTypeFilter === rt.name && styles.chipActive]}>
                  <Text style={[styles.chipText, roomTypeFilter === rt.name && styles.chipTextActive]}>{rt.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>{t('staff.newBooking.guestsLabel')}</Text>
            <Stepper value={guestCount} onChange={(v) => { setGuestCount(v); setAvailableRooms(null); }} min={1} max={12} />

            <Button
              label={searching ? t('staff.newBooking.searching') : t('staff.newBooking.searchAvailabilityButton')}
              onPress={runSearch}
              loading={searching}
              disabled={!checkIn || !checkOut}
              style={{ marginTop: spacing.lg }}
            />
            {!!searchError && <Text style={styles.errorText}>{searchError}</Text>}

            {availableRooms !== null && (
              <View style={{ marginTop: spacing.lg }}>
                {availableRooms.length === 0 ? (
                  <EmptyState
                    icon="bed-outline"
                    title={t('staff.newBooking.noAvailabilityTitle')}
                    subtitle={t('staff.newBooking.noAvailabilitySubtitle')}
                  />
                ) : (
                  <>
                    <Text style={styles.resultsTitle}>{t('staff.newBooking.resultsSubtitle', { count: availableRooms.length })}</Text>
                    <View style={{ gap: spacing.sm }}>
                      {availableRooms.map((room) => (
                        <AnimatedPressable key={room.id} onPress={() => chooseRoom(room)}>
                          <Card style={styles.roomRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.roomNumber}>{t('staff.newBooking.roomLabel', { number: room.number })}</Text>
                              <Text style={styles.roomMeta}>{room.type} · {t('staff.newBooking.roomFloor', { floor: room.floor })}</Text>
                              <Badge label={t('staff.newBooking.roomCapacity', { count: room.max_occupancy })} tone="info" />
                            </View>
                            <View style={styles.selectBtn}>
                              <Text style={styles.selectBtnText}>{t('staff.newBooking.selectRoomButton')}</Text>
                            </View>
                          </Card>
                        </AnimatedPressable>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.stepTitle}>{t('staff.newBooking.confirmStepTitle')}</Text>
            <Text style={styles.stepSubtitle}>{t('staff.newBooking.confirmStepSubtitle')}</Text>

            <Card style={{ marginBottom: spacing.md }}>
              <Text style={styles.summaryLine}><Text style={styles.summaryLabel}>{t('staff.newBooking.summaryGuest')}: </Text>{selectedGuest?.firstName} {selectedGuest?.lastName}</Text>
              <Text style={styles.summaryLine}><Text style={styles.summaryLabel}>{t('staff.newBooking.summaryRoom')}: </Text>{t('staff.newBooking.roomLabel', { number: selectedRoom?.number })} · {selectedRoom?.type}</Text>
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>{t('staff.newBooking.summaryDates')}: </Text>
                {fullLabel(checkIn, i18n.language)} → {fullLabel(checkOut, i18n.language)}
              </Text>
              <Text style={styles.summaryLine}><Text style={styles.summaryLabel}>{t('staff.newBooking.summaryNights')}: </Text>{t('staff.newBooking.nightsCount', { count: nights })}</Text>
            </Card>

            <View style={styles.stepperRow}>
              <Text style={styles.fieldLabel}>{t('staff.newBooking.adultsLabel')}</Text>
              <Stepper value={adults} onChange={setAdults} min={1} max={12} />
            </View>
            <View style={styles.stepperRow}>
              <Text style={styles.fieldLabel}>{t('staff.newBooking.childrenLabel')}</Text>
              <Stepper value={children} onChange={setChildren} min={0} max={12} />
            </View>

            <Field
              label={t('staff.newBooking.specialRequestsLabel')}
              value={specialRequests}
              onChangeText={setSpecialRequests}
              placeholder={t('staff.newBooking.specialRequestsPlaceholder')}
              multiline
            />
            <Field
              label={t('staff.newBooking.arrivalTimeLabel')}
              value={arrivalTime}
              onChangeText={setArrivalTime}
              placeholder={t('staff.newBooking.arrivalTimePlaceholder')}
            />

            {!!bookingError && <Text style={styles.errorText}>{bookingError}</Text>}

            <Button
              label={booking ? t('staff.newBooking.creatingBooking') : t('staff.newBooking.createBookingButton')}
              onPress={submitBooking}
              loading={booking}
              style={{ marginTop: spacing.sm }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollBody: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  stepIndicatorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  stepIndicatorItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.sandLight, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.deepOcean },
  stepDotText: { fontSize: 11, fontWeight: '700', color: colors.slate },
  stepDotTextActive: { color: colors.white },
  stepIndicatorLabel: { fontSize: 11, color: colors.slate, marginLeft: 6, marginRight: 4 },
  stepIndicatorLabelActive: { color: colors.charcoal, fontWeight: '700' },
  stepConnector: { flex: 1, height: 1, backgroundColor: colors.border, marginRight: 4 },
  stepTitle: { fontSize: 19, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginBottom: 4 },
  stepSubtitle: { fontSize: 12.5, color: colors.slate, marginBottom: spacing.md, lineHeight: 18 },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginBottom: 8 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.white, marginBottom: spacing.md,
  },
  searchInput: { flex: 1, fontSize: 14.5, color: colors.charcoal },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.turquoiseDark, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  guestName: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  guestMeta: { fontSize: 12, color: colors.slate, marginTop: 2 },
  selectedGuestCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, backgroundColor: '#E1F2F1' },
  selectedGuestLabel: { fontSize: 11, fontWeight: '700', color: colors.turquoiseDark, textTransform: 'uppercase', letterSpacing: 0.4 },
  selectedGuestName: { fontSize: 15.5, fontWeight: '700', color: colors.charcoal, marginTop: 2 },
  changeLink: { fontSize: 13, fontWeight: '700', color: colors.turquoiseDark },
  errorText: { fontSize: 12.5, color: colors.error, marginTop: 8, marginBottom: 4, lineHeight: 18 },
  hintText: { fontSize: 12.5, color: colors.slate, fontStyle: 'italic', paddingVertical: 8 },
  chipRow: { gap: 8, paddingVertical: 2 },
  dateChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  dateChipActive: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
  dateChipText: { fontSize: 12.5, fontWeight: '600', color: colors.charcoal },
  dateChipTextActive: { color: colors.white },
  selectedDateText: { fontSize: 12.5, color: colors.slate, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.sandLight },
  chipActive: { backgroundColor: colors.deepOcean },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  chipTextActive: { color: colors.white },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, alignSelf: 'flex-start' },
  stepperBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.sandLight, alignItems: 'center', justifyContent: 'center' },
  stepperBtnDisabled: { opacity: 0.5 },
  stepperValue: { fontSize: 16, fontWeight: '700', color: colors.charcoal, minWidth: 24, textAlign: 'center' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  resultsTitle: { fontSize: 13, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  roomRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  roomNumber: { fontSize: 15.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  roomMeta: { fontSize: 12, color: colors.slate, marginTop: 2, marginBottom: 6 },
  selectBtn: { backgroundColor: colors.deepOcean, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill },
  selectBtnText: { color: colors.white, fontSize: 12.5, fontWeight: '700' },
  summaryLine: { fontSize: 13.5, color: colors.charcoal, marginBottom: 6, lineHeight: 19 },
  summaryLabel: { fontWeight: '700' },
  successCard: { alignItems: 'center', padding: spacing.lg, marginTop: spacing.md },
  successIconWrap: { marginBottom: spacing.sm },
  successTitle: { ...typography.heading, color: colors.charcoal, textAlign: 'center' },
  successSubtitle: { fontSize: 13.5, color: colors.slate, textAlign: 'center', marginTop: 4 },
  successDivider: { height: 1, backgroundColor: colors.border, alignSelf: 'stretch', marginVertical: spacing.md },
  successLine: { fontSize: 13.5, color: colors.charcoal, alignSelf: 'flex-start', marginBottom: 6, lineHeight: 19 },
});
