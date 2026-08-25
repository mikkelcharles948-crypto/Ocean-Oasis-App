import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Field, Pill } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, typography, shadow, gradients } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const STEP_KEYS = [
  'reservation', 'guestDetails', 'identification', 'arrivalInfo',
  'transportation', 'preferences', 'specialRequests', 'terms', 'confirmation',
];

const TRANSPORT_OPTIONS = ['hotelTransfer', 'rentalCar', 'ownTransportation', 'taxi'];
const PREF_OPTIONS = ['extraPillows', 'highFloor', 'quietRoom', 'lateCheckout', 'celebrationSetup'];

export default function DigitalCheckInScreen({ navigation }) {
  const { t } = useTranslation();
  const { guest, reservation, room, completeDigitalCheckIn } = useApp();
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');
  const [form, setForm] = useState({
    idNumber: '', arrivalTime: reservation.arrivalTime, transport: 'hotelTransfer',
    preferences: [], specialRequests: reservation.specialRequests, agreed: false,
  });

  const isConfirmation = step === STEP_KEYS.length - 1;

  const next = () => {
    if (step < STEP_KEYS.length - 1) setStep(step + 1);
  };
  const back = () => {
    if (step === 0) navigation.goBack();
    else setStep(step - 1);
  };

  const togglePref = (p) => {
    setForm((f) => ({
      ...f,
      preferences: f.preferences.includes(p) ? f.preferences.filter((x) => x !== p) : [...f.preferences, p],
    }));
  };

  const handleFinish = async () => {
    setFinishing(true);
    setFinishError('');
    const result = await completeDigitalCheckIn();
    setFinishing(false);
    if (!result?.ok) {
      setFinishError(result?.error || t('mystay.checkinFlow.finishError'));
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('mystay.checkinFlow.title')} onBack={back} />
      {!isConfirmation && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((step + 1) / STEP_KEYS.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {t('mystay.checkinFlow.stepProgress', {
              current: step + 1,
              total: STEP_KEYS.length,
              stepName: t(`mystay.checkinFlow.steps.${STEP_KEYS[step]}`),
            })}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>{t('mystay.checkinFlow.confirmReservationTitle')}</Text>
            <View style={styles.summaryBox}>
              <SummaryRow label={t('mystay.checkinFlow.guest')} value={`${guest.firstName} ${guest.lastName}`} />
              <SummaryRow label={t('mystay.checkinFlow.reservationNo')} value={reservation.reservationNumber} />
              <SummaryRow label={t('mystay.checkinFlow.room')} value={`${room.number} · ${room.type}`} />
              <SummaryRow label={t('mystay.checkinFlow.checkIn')} value={reservation.checkIn} />
              <SummaryRow label={t('mystay.checkinFlow.checkOut')} value={reservation.checkOut} />
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>{t('mystay.checkinFlow.guestDetailsTitle')}</Text>
            <Field label={t('mystay.checkinFlow.firstName')} value={guest.firstName} onChangeText={() => {}} />
            <Field label={t('mystay.checkinFlow.lastName')} value={guest.lastName} onChangeText={() => {}} />
            <Field label={t('mystay.checkinFlow.email')} value={guest.email} onChangeText={() => {}} />
            <Field label={t('mystay.checkinFlow.phone')} value={guest.phone} onChangeText={() => {}} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>{t('mystay.checkinFlow.identificationTitle')}</Text>
            <Text style={styles.stepSub}>{t('mystay.checkinFlow.identificationSub')}</Text>
            <Field
              label={t('mystay.checkinFlow.idNumber')}
              value={form.idNumber}
              onChangeText={(v) => setForm({ ...form, idNumber: v })}
              placeholder={t('mystay.checkinFlow.idNumberPlaceholder')}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>{t('mystay.checkinFlow.arrivalInfoTitle')}</Text>
            <Field label={t('mystay.checkinFlow.estimatedArrivalTime')} value={form.arrivalTime} onChangeText={(v) => setForm({ ...form, arrivalTime: v })} />
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>{t('mystay.checkinFlow.transportationTitle')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {TRANSPORT_OPTIONS.map((id) => (
                <Pill
                  key={id}
                  label={t(`mystay.checkinFlow.transportOptions.${id}`)}
                  selected={form.transport === id}
                  onPress={() => setForm({ ...form, transport: id })}
                />
              ))}
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={styles.stepTitle}>{t('mystay.checkinFlow.preferencesTitle')}</Text>
            <Text style={styles.stepSub}>{t('mystay.checkinFlow.preferencesSub')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {PREF_OPTIONS.map((id) => (
                <Pill
                  key={id}
                  label={t(`mystay.checkinFlow.prefOptions.${id}`)}
                  selected={form.preferences.includes(id)}
                  onPress={() => togglePref(id)}
                />
              ))}
            </View>
          </View>
        )}

        {step === 6 && (
          <View>
            <Text style={styles.stepTitle}>{t('mystay.checkinFlow.specialRequestsTitle')}</Text>
            <Field
              label={t('mystay.checkinFlow.specialRequestsLabel')}
              value={form.specialRequests}
              onChangeText={(v) => setForm({ ...form, specialRequests: v })}
              multiline
            />
          </View>
        )}

        {step === 7 && (
          <View>
            <Text style={styles.stepTitle}>{t('mystay.checkinFlow.termsTitle')}</Text>
            <View style={styles.termsBox}>
              <Text style={styles.termsText}>{t('mystay.checkinFlow.termsText')}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setForm({ ...form, agreed: !form.agreed })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: form.agreed }}
              accessibilityLabel={t('mystay.checkinFlow.agreeTerms')}
            >
              <Ionicons name={form.agreed ? 'checkbox' : 'square-outline'} size={22} color={colors.deepOcean} />
              <Text style={styles.checkboxLabel}>{t('mystay.checkinFlow.agreeTerms')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 8 && (
          <View style={{ alignItems: 'center', paddingTop: spacing.lg }}>
            <LinearGradient colors={gradients.success} style={styles.successCircle}>
              <Ionicons name="checkmark" size={34} color={colors.white} />
            </LinearGradient>
            <Text style={styles.confirmTitle}>{t('mystay.checkinFlow.allSet')}</Text>
            <Text style={styles.confirmSub}>{t('mystay.checkinFlow.welcomeToOceanOasis')}</Text>
            <View style={styles.summaryBox}>
              <SummaryRow label={t('mystay.checkinFlow.room')} value={`${room.number} · ${room.type}`} />
              <SummaryRow label={t('mystay.checkinFlow.arrival')} value={form.arrivalTime} />
              <SummaryRow label={t('mystay.checkinFlow.transportation')} value={t(`mystay.checkinFlow.transportOptions.${form.transport}`)} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!isConfirmation ? (
          <Button
            label={step === STEP_KEYS.length - 2 ? t('mystay.checkinFlow.reviewAndConfirm') : t('mystay.checkinFlow.continue')}
            onPress={next}
            disabled={step === 7 && !form.agreed}
          />
        ) : (
          <>
            {finishError ? <Text style={styles.finishError}>{finishError}</Text> : null}
            <Button label={t('mystay.checkinFlow.goToMyStay')} onPress={handleFinish} loading={finishing} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  progressTrack: { height: 5, backgroundColor: colors.border, borderRadius: 3 },
  progressFill: { height: 5, backgroundColor: colors.turquoise, borderRadius: 3 },
  progressLabel: { fontSize: 11.5, color: colors.slate, marginTop: 6 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  stepTitle: { ...typography.heading, color: colors.charcoal, marginBottom: spacing.sm },
  stepSub: { fontSize: 13, color: colors.slate, marginBottom: spacing.md, lineHeight: 19 },
  summaryBox: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 12.5, color: colors.slate },
  summaryValue: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal },
  termsBox: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  termsText: { fontSize: 12.5, color: colors.slate, lineHeight: 19 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.md },
  checkboxLabel: { fontSize: 13.5, color: colors.charcoal, fontWeight: '600' },
  successCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadow.soft },
  confirmTitle: { ...typography.heading, color: colors.charcoal },
  confirmSub: { fontSize: 14, color: colors.slate, marginTop: 4 },
  footer: { padding: spacing.lg },
  finishError: { color: colors.error, fontSize: 13, marginBottom: spacing.sm, textAlign: 'center' },
});
