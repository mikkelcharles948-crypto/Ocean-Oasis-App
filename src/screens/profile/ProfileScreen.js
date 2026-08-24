import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

function Row({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={19} color={danger ? colors.error : colors.deepOcean} />
        <Text style={[styles.rowLabel, danger && { color: colors.error }]}>{label}</Text>
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color={colors.slate} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { guest, signOut } = useApp();

  const currentLanguageName = t(`profile.languageNames.${i18n.language}`, { defaultValue: t('profile.languageNames.en') });

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
          <TouchableOpacity onPress={() => navigation.navigate('ProfileDetails')}>
            <Ionicons name="create-outline" size={20} color={colors.deepOcean} />
          </TouchableOpacity>
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

        <SectionLabel text={t('profile.app')} />
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
  headerTitle: { fontSize: 26, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginBottom: spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  name: { fontSize: 17, fontWeight: '700', color: colors.charcoal },
  tier: { fontSize: 12, color: colors.gold, fontWeight: '600', marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.slate, marginTop: spacing.lg, marginBottom: spacing.sm, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 14.5, color: colors.charcoal, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border },
});
