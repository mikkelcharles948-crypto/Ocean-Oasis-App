import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { PROPERTY_INFO } from '../../data/mockData';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By creating an account or using the ${PROPERTY_INFO.fullName} app, you agree to these Terms of Service. If you do not agree, please do not use the app.`,
  },
  {
    title: '2. Reservations & Check-In',
    body: 'Reservations made through this app are subject to availability and the rate policies communicated at the time of booking. Digital check-in is offered as a convenience and does not replace identity verification at the front desk where required by law.',
  },
  {
    title: '3. Service Requests & Activities',
    body: 'Service requests, activity bookings, and dining reservations submitted through the app are fulfilled on a best-effort basis and may be subject to capacity, weather, or operational constraints. We will notify you as soon as possible of any changes.',
  },
  {
    title: '4. Guest Conduct',
    body: 'You agree to use the app only for lawful purposes connected with your stay, and not to submit false, abusive, or harassing content through service requests, feedback, or concierge messaging.',
  },
  {
    title: '5. Cancellations',
    body: 'Cancellation terms for reservations, activities, and dining follow the policy stated at the time of booking. Where no policy is stated, standard hotel cancellation terms apply — ask our front desk or concierge for details.',
  },
  {
    title: '6. Limitation of Liability',
    body: `${PROPERTY_INFO.name} is not liable for indirect or consequential loss arising from use of this app, including service interruptions, third-party excursion providers, or inaccuracies in third-party information (such as local event listings) presented for your convenience.`,
  },
  {
    title: '7. Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of the app after changes take effect constitutes acceptance of the revised Terms.',
  },
  {
    title: '8. Contact',
    body: `Questions about these Terms can be directed to ${PROPERTY_INFO.email} or ${PROPERTY_INFO.phone}.`,
  },
];

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Terms of Service" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.updated}>Last updated: August 2026</Text>
        <Text style={styles.intro}>
          These Terms of Service govern your use of the {PROPERTY_INFO.fullName} guest app. Please read them carefully.
        </Text>
        {SECTIONS.map((s) => (
          <React.Fragment key={s.title}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </React.Fragment>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  updated: { fontSize: 11.5, color: colors.slate, marginBottom: spacing.sm },
  intro: { fontSize: 13.5, color: colors.charcoal, lineHeight: 20, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginTop: spacing.md, marginBottom: 6 },
  body: { fontSize: 13, color: colors.slate, lineHeight: 19 },
});
