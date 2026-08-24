import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../i18n';

function Row({ label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowLabel}>{label}</Text>
      {active && <Ionicons name="checkmark-circle" size={20} color={colors.turquoiseDark} />}
    </TouchableOpacity>
  );
}
function Divider() {
  return <View style={styles.divider} />;
}

export default function LanguageScreen({ navigation }) {
  const { t, i18n } = useTranslation();

  const handleSelect = async (code) => {
    await changeLanguage(code);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('profile.languageScreenTitle')} onBack={() => navigation.goBack()} />
      <View style={{ padding: spacing.lg }}>
        <Card style={{ paddingVertical: 0 }}>
          {SUPPORTED_LANGUAGES.map((code, index) => (
            <React.Fragment key={code}>
              <Row
                label={t(`profile.languageNames.${code}`)}
                active={i18n.language === code}
                onPress={() => handleSelect(code)}
              />
              {index < SUPPORTED_LANGUAGES.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  rowLabel: { fontSize: 14.5, color: colors.charcoal, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border },
});
