import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/Button';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { STAFF_DIRECTORY, ROLE_LABELS } from '../../data/mockData';

export default function OpsLoginScreen({ route, navigation }) {
  const surface = route?.params?.surface || 'staff';
  const { opsSignIn, canAccessSurface, chooseExperience } = useApp();

  const eligibleStaff = STAFF_DIRECTORY.filter((s) => canAccessSurface(s.role, surface));
  const [selected, setSelected] = useState(eligibleStaff[0]);

  const handleSignIn = () => {
    if (!selected) return;
    opsSignIn(selected.name, selected.role);
    chooseExperience(surface);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.lg }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
          <Ionicons name="chevron-back" size={24} color={colors.deepOcean} />
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Ionicons name={surface === 'staff' ? 'headset' : 'stats-chart'} size={26} color={colors.white} />
        </View>
        <Text style={styles.title}>{surface === 'staff' ? 'Staff Sign In' : 'Management Sign In'}</Text>
        <Text style={styles.subtitle}>
          {surface === 'staff'
            ? 'Choose a demo team member to open the operations dashboard.'
            : 'Choose a demo manager to open the analytics dashboard.'}
        </Text>

        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          {eligibleStaff.map((s) => {
            const isSelected = selected?.id === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.staffRow, isSelected && styles.staffRowSelected]}
                onPress={() => setSelected(s)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.staffName}>{s.name}</Text>
                  <Text style={styles.staffMeta}>{ROLE_LABELS[s.role]} · {s.department}</Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={22} color={colors.turquoise} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Button label={`Enter ${surface === 'staff' ? 'Staff Dashboard' : 'Management Dashboard'}`} onPress={handleSignIn} style={{ marginTop: spacing.xl }} disabled={!selected} />

        <Text style={styles.note}>Demo authentication — selecting a team member simulates sign-in. Production would use real credentials.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { fontSize: 22, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  subtitle: { fontSize: 13.5, color: colors.slate, marginTop: 6, lineHeight: 19 },
  staffRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white,
    borderRadius: radius.md, padding: spacing.sm, borderWidth: 1.5, borderColor: 'transparent', ...shadow.card,
  },
  staffRowSelected: { borderColor: colors.turquoise, backgroundColor: '#EFFAF9' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.turquoiseDark, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 12.5 },
  staffName: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  staffMeta: { fontSize: 11.5, color: colors.slate, marginTop: 1 },
  note: { fontSize: 11, color: colors.slate, textAlign: 'center', marginTop: spacing.lg, lineHeight: 15 },
});
