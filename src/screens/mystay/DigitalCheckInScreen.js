import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader, Field, Pill } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const STEPS = [
  'Reservation', 'Guest Details', 'Identification', 'Arrival Info',
  'Transportation', 'Preferences', 'Special Requests', 'Terms', 'Confirmation',
];

export default function DigitalCheckInScreen({ navigation }) {
  const { guest, reservation, room, completeDigitalCheckIn } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    idNumber: '', arrivalTime: reservation.arrivalTime, transport: 'Hotel Transfer',
    preferences: [], specialRequests: reservation.specialRequests, agreed: false,
  });

  const isLast = step === STEPS.length - 1;
  const isConfirmation = step === STEPS.length - 1;

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
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

  const handleFinish = () => {
    completeDigitalCheckIn();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Digital Check-In" onBack={back} />
      {!isConfirmation && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>Confirm your reservation</Text>
            <View style={styles.summaryBox}>
              <SummaryRow label="Guest" value={`${guest.firstName} ${guest.lastName}`} />
              <SummaryRow label="Reservation No." value={reservation.reservationNumber} />
              <SummaryRow label="Room" value={`${room.number} · ${room.type}`} />
              <SummaryRow label="Check-in" value={reservation.checkIn} />
              <SummaryRow label="Check-out" value={reservation.checkOut} />
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Guest details</Text>
            <Field label="First Name" value={guest.firstName} onChangeText={() => {}} />
            <Field label="Last Name" value={guest.lastName} onChangeText={() => {}} />
            <Field label="Email" value={guest.email} onChangeText={() => {}} />
            <Field label="Phone" value={guest.phone} onChangeText={() => {}} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Identification</Text>
            <Text style={styles.stepSub}>For local registry requirements, please provide your passport or national ID number.</Text>
            <Field label="ID / Passport Number" value={form.idNumber} onChangeText={(v) => setForm({ ...form, idNumber: v })} placeholder="e.g. P1234567" />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Arrival information</Text>
            <Field label="Estimated Arrival Time" value={form.arrivalTime} onChangeText={(v) => setForm({ ...form, arrivalTime: v })} />
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Transportation</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['Hotel Transfer', 'Rental Car', 'Own Transportation', 'Taxi'].map((t) => (
                <Pill key={t} label={t} selected={form.transport === t} onPress={() => setForm({ ...form, transport: t })} />
              ))}
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={styles.stepTitle}>Preferences</Text>
            <Text style={styles.stepSub}>Help us prepare your room and experience.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['Extra pillows', 'High floor', 'Quiet room', 'Late checkout', 'Celebration setup'].map((p) => (
                <Pill key={p} label={p} selected={form.preferences.includes(p)} onPress={() => togglePref(p)} />
              ))}
            </View>
          </View>
        )}

        {step === 6 && (
          <View>
            <Text style={styles.stepTitle}>Special requests</Text>
            <Field
              label="Anything else we should know?"
              value={form.specialRequests}
              onChangeText={(v) => setForm({ ...form, specialRequests: v })}
              multiline
            />
          </View>
        )}

        {step === 7 && (
          <View>
            <Text style={styles.stepTitle}>Terms & consent</Text>
            <View style={styles.termsBox}>
              <Text style={styles.termsText}>
                By continuing, you confirm the information provided is accurate and agree to Ocean Oasis's stay
                policies, including check-in/check-out times and applicable charges.
              </Text>
            </View>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setForm({ ...form, agreed: !form.agreed })}>
              <Ionicons name={form.agreed ? 'checkbox' : 'square-outline'} size={22} color={colors.deepOcean} />
              <Text style={styles.checkboxLabel}>I agree to the terms and conditions</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 8 && (
          <View style={{ alignItems: 'center', paddingTop: spacing.lg }}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={34} color={colors.white} />
            </View>
            <Text style={styles.confirmTitle}>You're all set.</Text>
            <Text style={styles.confirmSub}>Welcome to Ocean Oasis.</Text>
            <View style={styles.summaryBox}>
              <SummaryRow label="Room" value={`${room.number} · ${room.type}`} />
              <SummaryRow label="Arrival" value={form.arrivalTime} />
              <SummaryRow label="Transportation" value={form.transport} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!isConfirmation ? (
          <Button
            label={step === STEPS.length - 2 ? 'Review & Confirm' : 'Continue'}
            onPress={next}
            disabled={step === 7 && !form.agreed}
          />
        ) : (
          <Button label="Go to My Stay" onPress={handleFinish} />
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
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm, fontFamily: font.display },
  stepSub: { fontSize: 13, color: colors.slate, marginBottom: spacing.md, lineHeight: 19 },
  summaryBox: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 12.5, color: colors.slate },
  summaryValue: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal },
  termsBox: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  termsText: { fontSize: 12.5, color: colors.slate, lineHeight: 19 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.md },
  checkboxLabel: { fontSize: 13.5, color: colors.charcoal, fontWeight: '600' },
  successCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  confirmTitle: { fontSize: 22, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  confirmSub: { fontSize: 14, color: colors.slate, marginTop: 4 },
  footer: { padding: spacing.lg },
});
