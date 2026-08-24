import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, Card } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';

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
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [shareStayHistory, setShareStayHistory] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Privacy" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.intro}>Control how your information is used within the app. These preferences apply to this device.</Text>

        <Card style={{ paddingVertical: 0 }}>
          <ToggleRow
            label="Personalized Recommendations"
            description="Use my interests and activity history to recommend experiences."
            value={personalization}
            onValueChange={setPersonalization}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Marketing Emails"
            description="Receive offers, promotions, and stay reminders by email."
            value={marketingEmails}
            onValueChange={setMarketingEmails}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Share Stay History with Loyalty Partners"
            description="Allow past-stay data to be shared with partner loyalty programs."
            value={shareStayHistory}
            onValueChange={setShareStayHistory}
          />
        </Card>

        <Text style={styles.footnote}>
          For details on what data we collect and how it's used, see our Privacy Policy in Profile → Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.slate, lineHeight: 19, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rowLabel: { fontSize: 14, fontWeight: '600', color: colors.charcoal, fontFamily: font.display },
  rowDesc: { fontSize: 11.5, color: colors.slate, marginTop: 2, lineHeight: 15 },
  divider: { height: 1, backgroundColor: colors.border },
  footnote: { fontSize: 11.5, color: colors.slate, marginTop: spacing.lg, lineHeight: 16 },
});
