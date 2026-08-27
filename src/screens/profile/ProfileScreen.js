import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '../../components/UI';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

function Row({ icon, label, onPress, danger }) {
  return (
    <AnimatedPressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={19} color={danger ? colors.error : colors.deepOcean} />
        <Text style={[styles.rowLabel, danger && { color: colors.error }]}>{label}</Text>
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color={colors.slate} />}
    </AnimatedPressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { guest, signOut, biometricSupported, biometricEnabled, enableBiometricLogin, disableBiometricLogin } = useApp();

  const currentLanguageName = t(`profile.languageNames.${i18n.language}`, { defaultValue: t('profile.languageNames.en') });

  const toggleBiometric = async (value) => {
    if (value) {
      const result = await enableBiometricLogin();
      if (!result.ok) Alert.alert(t('profile.biometric.title'), result.error);
    } else {
      await disableBiometricLogin();
    }
  };

  const confirmSignOut = () => {
    Alert.alert(t('profile.signOutTitle'), t('profile.signOutMsg'), [
      { text: t('profile.cancel'), style: 'cancel' },
      { text: t('profile.logOut'), style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{guest.avatarInitials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{guest.firstName} {guest.lastName}</Text>
            <Text style={styles.tier}>{guest.loyaltyTier}</Text>
          </View>
          <AnimatedPressable
            onPress={() => navigation.navigate('ProfileDetails')}
            accessibilityRole="button"
            accessibilityLabel={t('profile.personalDetails')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="create-outline" size={20} color={colors.deepOcean} />
          </AnimatedPressable>
        </Card>

        <SectionLabel text={t('profile.stayAndPreferences')} />
        <Card style={{ paddingVertical: 0 }}>
          <Row icon="person-outline" label={t('profile.personalDetails')} onPress={() => navigation.navigate('ProfileDetails')} />
          <Divider />
          <Row icon="options-outline" label={t('profile.preferencesInterests')} onPress={() => navigation.navigate('Preferences')} />
          <Divider />
          <Row icon="notifications-outline" label={t('profile.notificationSettings')} onPress={() => navigation.navigate('Notifications')} />
          <Divider />
          <Row icon="time-outline" label={t('profile.pastStays')} onPress={() => navigation.navigate('PastStays')} />
          <Divider />
          <Row icon="calendar-outline" label={t('itinerary.title')} onPress={() => navigation.navigate('Itinerary')} />
          <Divider />
          <Row icon="star-outline" label={t('profile.feedback')} onPress={() => navigation.navigate('Feedback')} />
        </Card>

        <SectionLabel text={t('profile.oasisAndBilling')} />
        <Card style={{ paddingVertical: 0 }}>
          <Row icon="trophy-outline" label={t('profile.loyaltyRow')} onPress={() => navigation.navigate('Loyalty')} />
          <Divider />
          <Row icon="receipt-outline" label={t('profile.billingRow')} onPress={() => navigation.navigate('Folio')} />
          <Divider />
          <Row icon="bed-outline" label={t('profile.roomPreferencesRow')} onPress={() => navigation.navigate('RoomPreferences')} />
          <Divider />
          <Row icon="information-circle-outline" label={t('profile.hotelAmenitiesRow')} onPress={() => navigation.navigate('HotelAmenities')} />
          <Divider />
          <Row icon="map-outline" label={t('profile.localGuideRow')} onPress={() => navigation.navigate('LocalGuide')} />
          <Divider />
          <Row icon="trail-sign-outline" label={t('profile.trailMapsRow')} onPress={() => navigation.navigate('TrailMaps')} />
        </Card>

        <SectionLabel text={t('profile.app')} />
        {biometricSupported && (
          <Card style={{ marginBottom: spacing.md }}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="finger-print-outline" size={19} color={colors.deepOcean} />
                <View>
                  <Text style={styles.rowLabel}>{t('profile.biometric.title')}</Text>
                  <Text style={styles.rowSub}>{t('profile.biometric.sub')}</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: colors.border, true: colors.turquoise }}
                thumbColor={colors.white}
              />
            </View>
          </Card>
        )}
        <Card style={{ paddingVertical: 0 }}>
          <Row icon="language-outline" label={t('profile.languageLabel', { language: currentLanguageName })} onPress={() => navigation.navigate('Language')} />
          <Divider />
          <Row icon="accessibility-outline" label={t('profile.accessibility')} onPress={() => navigation.navigate('Accessibility')} />
          <Divider />
          <Row icon="lock-closed-outline" label={t('profile.privacy')} onPress={() => navigation.navigate('PrivacySettings')} />
          <Divider />
          <Row icon="help-circle-outline" label={t('profile.help')} onPress={() => navigation.navigate('Concierge')} />
          <Divider />
          <Row icon="document-text-outline" label={t('profile.terms')} onPress={() => navigation.navigate('Terms')} />
          <Divider />
          <Row icon="shield-checkmark-outline" label={t('profile.privacyPolicy')} onPress={() => navigation.navigate('PrivacyPolicy')} />
        </Card>

        <Card style={{ marginTop: spacing.md, paddingVertical: 0 }}>
          <Row icon="log-out-outline" label={t('profile.logOut')} onPress={confirmSignOut} danger />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ text }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}
function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  headerTitle: { ...typography.display, color: colors.charcoal, marginBottom: spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  name: { fontSize: 17, fontWeight: '700', color: colors.charcoal },
  tier: { fontSize: 12, color: colors.goldDark, fontWeight: '600', marginTop: 2 },
  sectionLabel: { ...typography.label, color: colors.slate, marginTop: spacing.lg, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 14.5, color: colors.charcoal, fontWeight: '500' },
  rowSub: { fontSize: 11, color: colors.slate, marginTop: 2, maxWidth: 220 },
  divider: { height: 1, backgroundColor: colors.border },
});
