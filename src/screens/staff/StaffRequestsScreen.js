import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, Badge, EmptyState, timeAgo } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { STAFF_DIRECTORY } from '../../data/mockData';

const STATUS_TONE = { Received: 'info', Assigned: 'warning', 'In Progress': 'warning', Completed: 'success', Cancelled: 'neutral' };
const PRIORITY_TONE = { URGENT: 'error', HIGH: 'warning', NORMAL: 'neutral' };
const FILTERS = ['Open', 'Received', 'Assigned', 'In Progress', 'Completed', 'All'];

export default function StaffRequestsScreen() {
  const { serviceRequests, assignRequestToStaff, updateRequestStatus, addRequestNote } = useApp();
  const [filter, setFilter] = useState('Open');
  const [activeId, setActiveId] = useState(null);
  const [noteText, setNoteText] = useState('');

  const filtered = useMemo(() => {
    let list = serviceRequests;
    if (filter === 'Open') list = list.filter((r) => !['Completed', 'Cancelled'].includes(r.status));
    else if (filter !== 'All') list = list.filter((r) => r.status === filter);
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [serviceRequests, filter]);

  const active = activeId ? serviceRequests.find((r) => r.id === activeId) : null;

  const handleAddNote = () => {
    if (!noteText.trim() || !active) return;
    addRequestNote(active.id, noteText.trim());
    setNoteText('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Requests</Text>
        <Text style={styles.headerSub}>Guest requests sync here the instant they're submitted.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterPill, filter === f && styles.filterPillActive]}>
            <Text style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="checkmark-done-outline" title="Nothing here" subtitle="No requests match this filter." />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setActiveId(item.id)}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.roomTitle}>Room {item.roomNumber} — {item.category}</Text>
                <Badge label={item.priority} tone={PRIORITY_TONE[item.priority]} />
              </View>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
                <Text style={styles.meta}>{item.department} · {timeAgo(item.createdAt)}</Text>
                <Badge label={item.status} tone={STATUS_TONE[item.status]} />
              </View>
              {item.assignedStaffName && <Text style={styles.assigned}>Assigned to {item.assignedStaffName}</Text>}
            </Card>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!active} animationType="slide" transparent onRequestClose={() => setActiveId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Room {active?.roomNumber}</Text>
                <TouchableOpacity onPress={() => setActiveId(null)}><Ionicons name="close" size={24} color={colors.slate} /></TouchableOpacity>
              </View>
              {active && (
                <>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
                    <Badge label={active.priority} tone={PRIORITY_TONE[active.priority]} />
                    <Badge label={active.status} tone={STATUS_TONE[active.status]} />
                  </View>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Guest: </Text>{active.guestName}</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Category: </Text>{active.category} · {active.department}</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Description: </Text>{active.description}</Text>
                  {active.preferredTime && <Text style={styles.detailLine}><Text style={styles.detailLabel}>Preferred time: </Text>{active.preferredTime}</Text>}

                  <Text style={styles.fieldLabel}>Assign to staff</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                    {STAFF_DIRECTORY.filter((s) => s.department === active.department || s.role === 'GENERAL_MANAGER').map((s) => (
                      <TouchableOpacity key={s.id} onPress={() => assignRequestToStaff(active.id, s.name)} style={[styles.chip, active.assignedStaffName === s.name && styles.chipActive]}>
                        <Text style={[styles.chipText, active.assignedStaffName === s.name && styles.chipTextActive]}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.fieldLabel}>Update status</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
                    {['Received', 'Assigned', 'In Progress', 'Completed', 'Cancelled'].map((s) => (
                      <TouchableOpacity key={s} onPress={() => updateRequestStatus(active.id, s)} style={[styles.chip, active.status === s && styles.chipActive]}>
                        <Text style={[styles.chipText, active.status === s && styles.chipTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Internal notes</Text>
                  {(active.notes || []).map((n, i) => (
                    <View key={i} style={styles.noteBubble}>
                      <Text style={styles.noteText}><Text style={{ fontWeight: '700' }}>{n.by}: </Text>{n.text}</Text>
                    </View>
                  ))}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: spacing.lg }}>
                    <TextInput
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholder="Add an internal note…"
                      placeholderTextColor={colors.slate}
                      style={styles.noteInput}
                    />
                    <TouchableOpacity onPress={handleAddNote} style={styles.noteAddBtn}>
                      <Text style={styles.noteAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  headerSub: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  filterRow: { paddingHorizontal: spacing.lg, gap: 8, paddingVertical: spacing.sm },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
  filterPillText: { fontSize: 12.5, fontWeight: '600', color: colors.charcoal },
  filterPillTextActive: { color: colors.white },
  roomTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  desc: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  meta: { fontSize: 11.5, color: colors.slate },
  assigned: { fontSize: 11.5, color: colors.turquoiseDark, marginTop: 6, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 19, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  detailLine: { fontSize: 13.5, color: colors.charcoal, marginBottom: 6, lineHeight: 19 },
  detailLabel: { fontWeight: '700' },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginTop: spacing.sm, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.sandLight, marginRight: 8 },
  chipActive: { backgroundColor: colors.deepOcean },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  chipTextActive: { color: colors.white },
  noteBubble: { backgroundColor: colors.sandLight, borderRadius: radius.sm, padding: spacing.sm, marginBottom: 6 },
  noteText: { fontSize: 12.5, color: colors.charcoal },
  noteInput: { flex: 1, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, fontSize: 12.5, color: colors.charcoal },
  noteAddBtn: { paddingHorizontal: 14, justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.deepOcean },
  noteAddBtnText: { color: colors.white, fontWeight: '700', fontSize: 12.5 },
});
