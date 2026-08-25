import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { PROPERTY_INFO } from '../../data/mockData';

const SECTION_KEYS = ['acceptance', 'reservations', 'serviceRequests', 'conduct', 'cancellations', 'liability', 'changes', 'contact'];

function sectionBody(t, key) {
  if (key === 'acceptance') return t('terms.sections.acceptance.body', { name: PROPERTY_INFO.fullName });
  if (key === 'liability') return t('terms.sections.liability.body', { name: PROPERTY_INFO.name });
  if (key === 'contact') return t('terms.sections.contact.body', { email: PROPERTY_INFO.email, phone: PROPERTY_INFO.phone });
  return t(`terms.sections.${key}.body`);
}

export default function TermsScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('terms.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.updated}>{t('terms.updated')}</Text>
        <Text style={styles.intro}>{t('terms.intro', { name: PROPERTY_INFO.fullName })}</Text>
        {SECTION_KEYS.map((key) => (
          <React.Fragment key={key}>
            <Text style={styles.sectionTitle}>{t(`terms.sections.${key}.title`)}</Text>
            <Text style={styles.body}>{sectionBody(t, key)}</Text>
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
