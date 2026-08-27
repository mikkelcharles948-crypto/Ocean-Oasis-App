import React from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../components/UI';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, font } from '../../theme/theme';
import { PROPERTY_INFO } from '../../data/mockData';

function Option({ icon, title, subtitle, onPress, tone = 'normal' }) {
  return (
    <AnimatedPressable
      style={[styles.option, tone === 'emergency' && styles.optionEmergency]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.optionIcon, tone === 'emergency' && styles.optionIconEmergency]}>
        <Ionicons name={icon} size={20} color={colors.white} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, tone === 'emergency' && { color: colors.error }]}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.slate} />
    </AnimatedPressable>
  );
}

export default function ContactReceptionScreen({ navigation }) {
  const { t } = useTranslation();
  const call = () => Linking.openURL(`tel:${PROPERTY_INFO.phone.replace(/[^\d+]/g, '')}`).catch(() => Alert.alert(t('contact.unableToCall')));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('contact.title')} onBack={() => navigation.goBack()} />
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={styles.intro}>{t('contact.intro')}</Text>

        <Option icon="call" title={t('contact.callReception')} subtitle={t('contact.callReceptionSub')} onPress={call} />
        <Option icon="chatbubble-ellipses" title={t('contact.messageReception')} subtitle={t('contact.messageReceptionSub')} onPress={() => navigation.navigate('NewRequest', { category: 'Concierge' })} />
        <Option icon="sparkles" title={t('contact.requestConcierge')} subtitle={t('contact.requestConciergeSub')} onPress={() => navigation.navigate('Concierge')} />

        <Text style={styles.sectionLabel}>{t('contact.urgent')}</Text>
        <Option
          icon="alert-circle"
          title={t('contact.emergencyTitle')}
          subtitle={t('contact.emergencySub')}
          onPress={() =>
            Alert.alert(t('contact.emergencyAlertTitle'), t('contact.emergencyAlertMsg'), [
              { text: t('contact.cancel'), style: 'cancel' },
              { text: t('contact.callNow'), onPress: call },
            ])
          }
          tone="emergency"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13.5, color: colors.slate, marginBottom: spacing.sm, lineHeight: 19 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.slate, marginTop: spacing.md, letterSpacing: 0.5 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  optionEmergency: { borderColor: '#EAC3B8', backgroundColor: '#FBF0EC' },
  optionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
  optionIconEmergency: { backgroundColor: colors.error },
  optionTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  optionSubtitle: { fontSize: 12, color: colors.slate, marginTop: 2 },
});
