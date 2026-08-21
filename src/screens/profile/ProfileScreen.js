import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
  const { guest, signOut } = useApp();

  const confirmSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.headerTitle}>Profile</Text>

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

        <SectionLabel text="Stay & Preferences" />
        <Card style={{ paddingVertical: 0 }}>
          <Row icon="person-outline" label="Personal Details" onPress={() => navigation.navigate('ProfileDetails')} />
          <Divider />
          <Row icon="options-outline" label="Preferences & Interests" onPress={() => navigation.navigate('Preferences')} />
          <Divider />
          <Row icon="notifications-outline" label="Notification Settings" onPress={() => navigation.navigate('Notifications')} />
          <Divider />
          <Row icon="time-outline" label="Past Stays" onPress={() => {}} />
          <Divider />
          <Row icon="star-outline" label="Feedback" onPress={() => navigation.navigate('Feedback')} />
        </Card>

        <SectionLabel text="App" />
        <Card style={{ paddingVertical: 0 }}>
          <Row icon="language-outline" label="Language: English" onPress={() => {}} />
          <Divider />
          <Row icon="accessibility-outline" label="Accessibility" onPress={() => {}} />
          <Divider />
          <Row icon="lock-closed-outline" label="Privacy" onPress={() => {}} />
          <Divider />
          <Row icon="help-circle-outline" label="Help" onPress={() => navigation.navigate('Concierge')} />
          <Divider />
          <Row icon="document-text-outline" label="Terms" onPress={() => {}} />
          <Divider />
          <Row icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
        </Card>

        <Card style={{ marginTop: spacing.md, paddingVertical: 0 }}>
          <Row icon="log-out-outline" label="Log Out" onPress={confirmSignOut} danger />
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
