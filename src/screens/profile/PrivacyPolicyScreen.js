import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { PROPERTY_INFO } from '../../data/mockData';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly — name, email, phone number, reservation details, service requests, activity bookings, and feedback — as well as basic device information needed to operate the app securely.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to manage your reservation, fulfil service and activity requests, respond to feedback, personalize recommendations (such as activities matching your interests), and communicate important updates about your stay.',
  },
  {
    title: '3. Who Can See Your Information',
    body: 'Reservation and request details are visible to authorized hotel staff and management involved in fulfilling them. We do not sell your personal information to third parties.',
  },
  {
    title: '4. Data Storage & Security',
    body: 'Your data is stored with industry-standard security controls, including role-based access so only staff with a legitimate need can view guest information.',
  },
  {
    title: '5. Your Choices',
    body: 'You can review and update your personal details at any time in Profile → Personal Details. You may also adjust marketing and personalization preferences in Profile → Privacy.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain reservation and stay history to provide loyalty benefits and past-stay records. You may request deletion of your account data by contacting us using the details below, subject to legal and accounting retention requirements.',
  },
  {
    title: '7. Contact',
    body: `Privacy questions or requests can be directed to ${PROPERTY_INFO.email} or ${PROPERTY_INFO.phone}, ${PROPERTY_INFO.address}.`,
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Privacy Policy" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.updated}>Last updated: August 2026</Text>
        <Text style={styles.intro}>
          This Privacy Policy explains how {PROPERTY_INFO.fullName} collects, uses, and protects your information when you use this app.
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
