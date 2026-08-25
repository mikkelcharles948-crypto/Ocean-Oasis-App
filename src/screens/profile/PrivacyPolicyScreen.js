import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../components/UI';
import { colors, spacing, font, typography } from '../../theme/theme';
import { PROPERTY_INFO } from '../../data/mockData';

const SECTION_KEYS = ['collect', 'use', 'visibility', 'security', 'choices', 'retention', 'contact'];

export default function PrivacyPolicyScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('profile.privacyPolicy')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.updated}>{t('privacyPolicy.updated')}</Text>
        <Text style={styles.intro}>{t('privacyPolicy.intro', { name: PROPERTY_INFO.fullName })}</Text>
        {SECTION_KEYS.map((key) => (
          <React.Fragment key={key}>
            <Text style={styles.sectionTitle}>{t(`privacyPolicy.sections.${key}.title`)}</Text>
            <Text style={styles.body}>
              {key === 'contact'
                ? t('privacyPolicy.sections.contact.body', { email: PROPERTY_INFO.email, phone: PROPERTY_INFO.phone, address: PROPERTY_INFO.address })
                : t(`privacyPolicy.sections.${key}.body`)}
            </Text>
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
  body: { ...typography.bodySmall, color: colors.slate },
});
