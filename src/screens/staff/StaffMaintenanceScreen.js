import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, Badge, EmptyState, Field, timeAgo } from '../../components/UI';
import GlassSurface from '../../components/GlassSurface';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { MAINTENANCE_CATEGORIES, MAINTENANCE_SEVERITIES } from '../../data/mockData';

const SEVERITY_TONE = { LOW: 'neutral', MEDIUM: 'warning', HIGH: 'error', CRITICAL: 'error' };
const STATUS_TONE = { OPEN: 'error', IN_PROGRESS: 'warning', RESOLVED: 'success' };

export default function StaffMaintenanceScreen({ navigation }) {
  const { t } = useTranslation();
  const { maintenanceIssues, createMaintenanceIssue, updateMaintenanceStatus } = useApp();
  const [filter, setFilter] = useState('OPEN');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ roomNumber: '', category: 'AC', severity: 'MEDIUM', description: '' });

  const filtered = maintenanceIssues.filter((m) => (filter === 'ALL' ? true : filter === 'OPEN' ? m.status !== 'RESOLVED' : m.status === filter));

  const submit = () => {
    if (!form.roomNumber || !form.description) return;
    createMaintenanceIssue(form);
    setForm({ roomNumber: '', category: 'AC', severity: 'MEDIUM', description: '' });
    setShowNew(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('staff.maintenance.title')} onBack={() => navigation.goBack()} right={
        <TouchableOpacity onPress={() => setShowNew(true)}><Ionicons name="add-circle" size={26} color={colors.deepOcean} /></TouchableOpacity>
      } />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ALL'].map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterPill, filter === f && styles.filterPillActive]}>
            <Text style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}>{f.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="build-outline" title={t('staff.maintenance.emptyTitle')} subtitle={t('staff.maintenance.emptySubtitle')} />}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={styles.roomTitle}>Room {item.roomNumber} — {item.category}</Text>
              <Badge label={item.severity} tone={SEVERITY_TONE[item.severity]} />
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
              <Text style={styles.meta}>{timeAgo(item.createdAt)}</Text>
              <Badge label={item.status.replace('_', ' ')} tone={STATUS_TONE[item.status]} />
            </View>
            {item.status !== 'RESOLVED' && (
              <Button
                label={item.status === 'OPEN' ? t('staff.maintenance.startWork') : t('staff.maintenance.markResolved')}
                variant="outline"
                onPress={() => updateMaintenanceStatus(item.id, item.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED')}
                style={{ marginTop: spacing.sm }}
              />
            )}
          </Card>
        )}
      />

      <Modal visible={showNew} transparent animationType="slide" onRequestClose={() => setShowNew(false)}>
        <View style={styles.modalBackdrop}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <GlassSurface style={styles.modalPanel} borderRadius={0} intensity={38} tint="light">
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('staff.maintenance.newIssueTitle')}</Text>
                <TouchableOpacity onPress={() => setShowNew(false)}><Ionicons name="close" size={22} color={colors.slate} /></TouchableOpacity>
              </View>
              <Field label={t('staff.maintenance.roomNumberLabel')} value={form.roomNumber} onChangeText={(v) => setForm({ ...form, roomNumber: v })} placeholder={t('staff.maintenance.roomNumberPlaceholder')} />
              <Text style={styles.fieldLabel}>{t('staff.maintenance.categoryLabel')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
                {MAINTENANCE_CATEGORIES.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setForm({ ...form, category: c })} style={[styles.chip, form.category === c && styles.chipActive]}>
                    <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>{t('staff.maintenance.severityLabel')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
                {MAINTENANCE_SEVERITIES.map((s) => (
                  <TouchableOpacity key={s} onPress={() => setForm({ ...form, severity: s })} style={[styles.chip, form.severity === s && styles.chipActive]}>
                    <Text style={[styles.chipText, form.severity === s && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Field label={t('staff.maintenance.descriptionLabel')} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
              <Button label={t('staff.maintenance.logIssue')} onPress={submit} style={{ marginTop: spacing.sm, marginBottom: spacing.lg }} />
            </ScrollView>
          </GlassSurface>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: spacing.lg, gap: 8, paddingVertical: spacing.sm },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
  filterPillText: { fontSize: 12.5, fontWeight: '600', color: colors.charcoal },
  filterPillTextActive: { color: colors.white },
  roomTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  desc: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  meta: { fontSize: 11.5, color: colors.slate },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.sandLight },
  chipActive: { backgroundColor: colors.deepOcean },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  chipTextActive: { color: colors.white },
});
