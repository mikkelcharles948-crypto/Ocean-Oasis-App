import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card } from '../../components/UI';
import { colors, spacing, font, typography } from '../../theme/theme';

function ToggleRow({ label, description, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.turquoise }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function PrivacySettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [shareStayHistory, setShareStayHistory] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('profile.privacy')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.intro}>{t('privacySettings.intro')}</Text>

        <Card style={{ paddingVertical: 0 }}>
          <ToggleRow
            label={t('privacySettings.personalization.label')}
            description={t('privacySettings.personalization.desc')}
            value={personalization}
            onValueChange={setPersonalization}
          />
          <View style={styles.divider} />
          <ToggleRow
            label={t('privacySettings.marketingEmails.label')}
            description={t('privacySettings.marketingEmails.desc')}
            value={marketingEmails}
            onValueChange={setMarketingEmails}
          />
          <View style={styles.divider} />
          <ToggleRow
            label={t('privacySettings.shareStayHistory.label')}
            description={t('privacySettings.shareStayHistory.desc')}
            value={shareStayHistory}
            onValueChange={setShareStayHistory}
          />
        </Card>

        <Text style={styles.footnote}>{t('privacySettings.footnote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  intro: { ...typography.bodySmall, color: colors.slate, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rowLabel: { fontSize: 14, fontWeight: '600', color: colors.charcoal, fontFamily: font.display },
  rowDesc: { fontSize: 11.5, color: colors.slate, marginTop: 2, lineHeight: 15 },
  divider: { height: 1, backgroundColor: colors.border },
  footnote: { fontSize: 11.5, color: colors.slate, marginTop: spacing.lg, lineHeight: 16 },
});
