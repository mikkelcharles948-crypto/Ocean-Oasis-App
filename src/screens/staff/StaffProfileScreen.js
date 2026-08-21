import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader, KpiCard } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { ROLE_LABELS } from '../../data/mockData';

export default function StaffProfileScreen({ navigation }) {
  const { opsSession, opsSignOut, serviceRequests } = useApp();
  const myRequests = serviceRequests.filter((r) => r.assignedStaffName === opsSession?.name);
  const completed = myRequests.filter((r) => r.status === 'Completed').length;

  const handleSwitch = () => {
    Alert.alert('Switch Experience', 'This will sign you out of the Staff Dashboard.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Switch', onPress: opsSignOut },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title="Profile" onBack={() => navigation.goBack()} />
      <View style={{ padding: spacing.lg }}>
        <Card style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{opsSession?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}</Text>
          </View>
          <Text style={styles.name}>{opsSession?.name}</Text>
          <Text style={styles.meta}>{ROLE_LABELS[opsSession?.role]} · {opsSession?.department}</Text>
        </Card>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: spacing.md }}>
          <KpiCard label="Assigned Tasks" value={myRequests.length} />
          <KpiCard label="Completed" value={completed} />
        </View>

        <TouchableOpacity style={styles.switchBtn} onPress={handleSwitch}>
          <Ionicons name="swap-horizontal" size={20} color={colors.deepOcean} />
          <Text style={styles.switchText}>Switch Experience</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.turquoise, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 20 },
  name: { fontSize: 17, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  meta: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  switchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  switchText: { fontSize: 13.5, fontWeight: '700', color: colors.deepOcean },
});
