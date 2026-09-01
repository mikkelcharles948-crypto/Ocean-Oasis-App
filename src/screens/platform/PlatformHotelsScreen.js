import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader, Badge, Field, EmptyState } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const STATUSES = ['ACTIVE', 'TRIAL', 'SUSPENDED'];
const STATUS_TONE = { ACTIVE: 'success', TRIAL: 'warning', SUSPENDED: 'neutral' };
const EMPTY_FORM = { name: '', slug: '', legalName: '', address: '', phone: '', email: '', timezone: 'UTC', currency: 'USD' };

// The one screen MCX Technologies (the owner's own company, above every
// hotel) uses to onboard and manage properties in Phase 1 of the platform
// pivot. Reachable only via the hidden long-press on ExperienceSelectScreen
// -> a PLATFORM_ADMIN sign-in -> this navigator; RLS (hotels_platform_admin_
// all) is the real gate, this screen assumes that's already true.
export default function PlatformHotelsScreen() {
  const { hotels, refreshPlatformData, createHotel, updateHotel, opsSession, opsSignOut } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshPlatformData();
  }, [refreshPlatformData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (hotel) => {
    setEditingId(hotel.id);
    setForm({
      name: hotel.name, slug: hotel.slug, legalName: hotel.legalName, address: hotel.address,
      phone: hotel.phone, email: hotel.email, timezone: hotel.timezone, currency: hotel.currency,
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || (!editingId && !form.slug.trim())) {
      setError('Name (and slug, for a new hotel) are required.');
      return;
    }
    setSaving(true);
    setError('');
    const result = editingId ? await updateHotel(editingId, form) : await createHotel(form);
    setSaving(false);
    if (!result?.ok) {
      setError(result?.error || 'Something went wrong. Please try again.');
      return;
    }
    setShowForm(false);
  };

  const handleStatusChange = async (hotel, status) => {
    const result = await updateHotel(hotel.id, { status });
    if (!result?.ok) Alert.alert('Something went wrong', result?.error || 'Please try again.');
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', `Signed in as ${opsSession?.name || 'Platform Admin'}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: opsSignOut },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader
        title="MCX Technologies"
        right={
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity onPress={openCreate} accessibilityRole="button" accessibilityLabel="Add hotel">
              <Ionicons name="add-circle" size={26} color={colors.deepOcean} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut} accessibilityRole="button" accessibilityLabel="Sign out">
              <Ionicons name="log-out-outline" size={24} color={colors.slate} />
            </TouchableOpacity>
          </View>
        }
      />
      <Text style={styles.subtitle}>{hotels.length} {hotels.length === 1 ? 'property' : 'properties'} on the platform</Text>
      <FlatList
        data={hotels}
        keyExtractor={(h) => h.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="business-outline" title="No hotels yet" subtitle="Add the first property to get started." />}
        renderItem={({ item }) => (
          <Card>
            <TouchableOpacity onPress={() => openEdit(item)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Badge label={item.status} tone={STATUS_TONE[item.status]} />
              </View>
              {item.address ? <Text style={styles.meta}>{item.address}</Text> : null}
              <Text style={styles.meta}>{item.slug} · {item.timezone} · {item.currency}</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
              {STATUSES.map((s) => (
                <TouchableOpacity key={s} onPress={() => handleStatusChange(item, s)} style={[styles.chip, item.status === s && styles.chipActive]}>
                  <Text style={[styles.chipText, item.status === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}
      />

      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalPanel} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit hotel' : 'Add hotel'}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={24} color={colors.slate} />
              </TouchableOpacity>
            </View>
            <Field label="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Ocean Oasis" />
            {!editingId && (
              <Field label="Slug" value={form.slug} onChangeText={(v) => setForm({ ...form, slug: v })} placeholder="ocean-oasis-dm" />
            )}
            <Field label="Legal name" value={form.legalName} onChangeText={(v) => setForm({ ...form, legalName: v })} placeholder="Ocean Oasis Hotel Dominica" />
            <Field label="Address" value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} placeholder="Castle Comfort, Roseau, Dominica" />
            <Field label="Phone" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="+1 (767) 255-8500" />
            <Field label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="stay@example.com" keyboardType="email-address" />
            <Field label="Timezone" value={form.timezone} onChangeText={(v) => setForm({ ...form, timezone: v })} placeholder="America/Dominica" />
            <Field label="Currency" value={form.currency} onChangeText={(v) => setForm({ ...form, currency: v })} placeholder="USD" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label={editingId ? 'Save changes' : 'Create hotel'} onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm, marginBottom: spacing.xl }} />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 12.5, color: colors.slate, paddingHorizontal: spacing.lg },
  name: { fontSize: 15.5, fontWeight: '700', color: colors.charcoal },
  meta: { fontSize: 12, color: colors.slate, marginTop: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.sandLight },
  chipActive: { backgroundColor: colors.deepOcean },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.charcoal },
  chipTextActive: { color: colors.white },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { backgroundColor: colors.ivory, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal },
  error: { color: colors.error, fontSize: 12.5, marginTop: 4 },
});
