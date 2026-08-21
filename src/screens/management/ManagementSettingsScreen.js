import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { PROPERTY_INFO, ROLE_LABELS } from '../../data/mockData';

export default function ManagementSettingsScreen({ navigation }) {
  const { opsSession, opsSignOut } = useApp();

  const handleSwitch = () => {
    Alert.alert('Switch Experience', 'This will sign you out of the Management Dashboard.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Switch', onPress: opsSignOut },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Card>
          <Text style={styles.cardTitle}>Signed in as</Text>
          <Text style={styles.name}>{opsSession?.name}</Text>
          <Text style={styles.meta}>{ROLE_LABELS[opsSession?.role]} · {opsSession?.department}</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Property Details</Text>
          <Row label="Property" value={PROPERTY_INFO.fullName} />
          <Row label="Address" value={PROPERTY_INFO.address} />
          <Row label="Phone" value={PROPERTY_INFO.phone} />
          <Row label="Email" value={PROPERTY_INFO.email} />
          <Row label="Rooms" value={String(PROPERTY_INFO.roomCount)} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Multi-Property Architecture</Text>
          <Text style={styles.note}>
            Every record in this system carries a property identifier. Today the platform is configured for one
            property; onboarding a second hotel means adding another property_id and settings row — no changes to
            core logic.
          </Text>
        </Card>

        <TouchableOpacity style={styles.switchBtn} onPress={handleSwitch}>
          <Ionicons name="swap-horizontal" size={20} color={colors.deepOcean} />
          <Text style={styles.switchText}>Switch Experience</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.charcoal, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  meta: { fontSize: 12, color: colors.slate, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  rowLabel: { fontSize: 12.5, color: colors.slate },
  rowValue: { fontSize: 12.5, fontWeight: '600', color: colors.charcoal, flexShrink: 1, textAlign: 'right' },
  note: { fontSize: 12.5, color: colors.slate, lineHeight: 19 },
  switchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  switchText: { fontSize: 13.5, fontWeight: '700', color: colors.deepOcean },
});
