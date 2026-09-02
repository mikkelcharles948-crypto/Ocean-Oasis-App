import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader, Badge, EmptyState } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { ROLES, ROLE_LABELS } from '../../data/mockData';

const HOTEL_ROLES = ROLES.filter((r) => r !== 'PLATFORM_ADMIN');

// The second Platform Admin screen: assigning every staff/management
// account to a hotel and role. Onboarding a new hotel's staff was
// previously manual SQL (fine for one hotel, not once there's a second
// real property) -- this is that missing piece.
export default function PlatformStaffScreen() {
  const { staffProfiles, hotels, refreshPlatformData, assignStaff } = useApp();
  const [editing, setEditing] = useState(null);
  const [role, setRole] = useState('');
  const [hotelId, setHotelId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshPlatformData();
  }, [refreshPlatformData]);

  const hotelName = (id) => hotels.find((h) => h.id === id)?.name || '—';

  const openEdit = (profile) => {
    setEditing(profile);
    setRole(profile.role === 'PLATFORM_ADMIN' ? HOTEL_ROLES[0] : profile.role);
    setHotelId(profile.hotelId || hotels[0]?.id || null);
    setError('');
  };

  const handleSave = async () => {
    if (!hotelId) {
      setError('A hotel is required.');
      return;
    }
    setSaving(true);
    setError('');
    const result = await assignStaff(editing.id, role, hotelId, editing.department);
    setSaving(false);
    if (!result?.ok) {
      setError(result?.error || 'Something went wrong. Please try again.');
      return;
    }
    setEditing(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title="Staff Assignment" />
      <Text style={styles.subtitle}>{staffProfiles.length} accounts across the platform</Text>
      <FlatList
        data={staffProfiles}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No staff accounts yet" subtitle="Staff appear here once they sign up." />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openEdit(item)}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Badge label={ROLE_LABELS[item.role] || item.role} tone={item.role === 'PLATFORM_ADMIN' ? 'warning' : 'info'} />
              </View>
              <Text style={styles.meta}>{item.role === 'PLATFORM_ADMIN' ? 'MCX Technologies' : hotelName(item.hotelId)}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!editing} animationType="slide" transparent onRequestClose={() => setEditing(null)}>
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalPanel} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing?.name}</Text>
              <TouchableOpacity onPress={() => setEditing(null)} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={colors.slate} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Hotel</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
              {hotels.map((h) => (
                <TouchableOpacity key={h.id} onPress={() => setHotelId(h.id)} style={[styles.chip, hotelId === h.id && styles.chipActive]}>
                  <Text style={[styles.chipText, hotelId === h.id && styles.chipTextActive]}>{h.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Role</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {HOTEL_ROLES.map((r) => (
                <TouchableOpacity key={r} onPress={() => setRole(r)} style={[styles.chip, role === r && styles.chipActive]}>
                  <Text style={[styles.chipText, role === r && styles.chipTextActive]}>{ROLE_LABELS[r]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Save assignment" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg, marginBottom: spacing.xl }} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 12.5, color: colors.slate, paddingHorizontal: spacing.lg },
  name: { fontSize: 15, fontWeight: '700', color: colors.charcoal },
  meta: { fontSize: 12, color: colors.slate },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.sandLight },
  chipActive: { backgroundColor: colors.deepOcean },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  chipTextActive: { color: colors.white },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { backgroundColor: colors.ivory, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginBottom: 8 },
  error: { color: colors.error, fontSize: 12.5, marginTop: spacing.sm },
});
