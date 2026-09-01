import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Text } from '../../components/AppText';
import { TextInput } from '../../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { Card, Badge, EmptyState, timeAgo } from '../../components/UI';
import StatusPill from '../../components/StatusPill';
import AnimatedPressable from '../../components/AnimatedPressable';
import GlassSurface from '../../components/GlassSurface';
import { colors, spacing, radius, font, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { REQUEST_STATUS_STEPS } from '../../data/mockData';

const STATUS_TONE = { Received: 'info', Assigned: 'warning', 'In Progress': 'warning', Completed: 'success', Cancelled: 'neutral' };
const PRIORITY_TONE = { URGENT: 'error', HIGH: 'warning', NORMAL: 'neutral' };
const FILTERS = ['Open', 'Received', 'Assigned', 'In Progress', 'Completed', 'All'];
const REQUEST_STATUS_KEY = { Received: 'received', Assigned: 'assigned', 'In Progress': 'inProgress', Completed: 'completed' };
const STATUSES = ['Received', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

export default function StaffRequestsScreen() {
  const { t } = useTranslation();
  const { serviceRequests, assignRequestToStaff, updateRequestStatus, completeRoomUpgrade, addRequestNote, staffDirectory, rooms } = useApp();
  const [filter, setFilter] = useState('Open');
  const [activeId, setActiveId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [roomPickerRequestId, setRoomPickerRequestId] = useState(null);
  const [completingUpgrade, setCompletingUpgrade] = useState(false);
  const availableRooms = useMemo(() => rooms.filter((r) => r.status === 'VACANT_CLEAN'), [rooms]);
  const statusLabel = (s) => (REQUEST_STATUS_KEY[s] ? t(`requests.status.${REQUEST_STATUS_KEY[s]}`) : s === 'Cancelled' ? t('staff.requests.statusCancelled') : s);
  const filterLabel = (f) => (f === 'Open' ? t('staff.requests.filters.open') : f === 'All' ? t('staff.requests.filters.all') : statusLabel(f));

  const filtered = useMemo(() => {
    let list = serviceRequests;
    if (filter === 'Open') list = list.filter((r) => !['Completed', 'Cancelled'].includes(r.status));
    else if (filter !== 'All') list = list.filter((r) => r.status === filter);
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [serviceRequests, filter]);

  const active = activeId ? serviceRequests.find((r) => r.id === activeId) : null;

  const handleAddNote = async () => {
    if (!noteText.trim() || !active) return;
    const result = await addRequestNote(active.id, noteText.trim());
    if (result.ok) {
      setNoteText('');
    } else {
      Alert.alert(t('common.somethingWrong'), result.error);
    }
  };

  const handleAssign = async (requestId, staffId) => {
    const result = await assignRequestToStaff(requestId, staffId);
    if (!result.ok) Alert.alert(t('common.somethingWrong'), result.error);
  };

  const handleStatusChange = async (requestId, status) => {
    // Assignment and status are separate calls (a request can be picked
    // up by whoever's free, not necessarily the person who set the
    // status), but the two need to happen together in practice: leaving
    // status free to advance with no assignee produced live rows sitting
    // at "Completed" with assigned_staff_id still null — which is why
    // Staff Performance's per-person completed count/avg never moved,
    // since nothing was ever actually attributed to anyone.
    if (status !== 'Received' && status !== 'Cancelled' && !active?.assignedStaffId) {
      Alert.alert(t('staff.requests.assignFirstTitle'), t('staff.requests.assignFirstBody'));
      return;
    }
    // Completing a Room Upgrade needs a specific new room picked — that's
    // the whole point of the request — so it branches into its own picker
    // instead of just flipping status like every other category.
    if (status === 'Completed' && active?.category === 'Room Upgrade') {
      setRoomPickerRequestId(requestId);
      return;
    }
    const result = await updateRequestStatus(requestId, status);
    if (!result.ok) Alert.alert(t('common.somethingWrong'), result.error);
  };

  const handleConfirmRoomUpgrade = async (newRoomId) => {
    setCompletingUpgrade(true);
    const result = await completeRoomUpgrade(roomPickerRequestId, newRoomId);
    setCompletingUpgrade(false);
    if (!result.ok) {
      Alert.alert(t('common.somethingWrong'), result.error);
      return;
    }
    setRoomPickerRequestId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('staff.requests.title')}</Text>
        <Text style={styles.headerSub}>{t('staff.requests.subtitle')}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterPill, filter === f && styles.filterPillActive]}>
            <Text style={[styles.filterPillText, filter === f && styles.filterPillTextActive]}>{filterLabel(f)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="checkmark-done-outline" title={t('staff.requests.empty.title')} subtitle={t('staff.requests.empty.subtitle')} />}
        renderItem={({ item }) => (
          <AnimatedPressable onPress={() => setActiveId(item.id)}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={[styles.roomTitle, { flexShrink: 1, marginRight: spacing.sm }]} numberOfLines={1}>{t('staff.requests.cardTitle', { number: item.roomNumber, category: item.category })}</Text>
                <Badge label={item.priority} tone={PRIORITY_TONE[item.priority]} />
              </View>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm }}>
                <Text style={[styles.meta, { flexShrink: 1, marginRight: spacing.sm }]} numberOfLines={1}>{item.department} · {timeAgo(item.createdAt)}</Text>
                <Badge label={statusLabel(item.status)} tone={STATUS_TONE[item.status]} />
              </View>
              {item.assignedStaffId && <Text style={styles.assigned}>{t('staff.requests.assignedTo', { name: staffDirectory.find((s) => s.id === item.assignedStaffId)?.name })}</Text>}
            </Card>
          </AnimatedPressable>
        )}
      />

      <Modal visible={!!active} animationType="slide" transparent onRequestClose={() => setActiveId(null)}>
        <View style={styles.modalBackdrop}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <GlassSurface style={styles.modalPanel} borderRadius={0} intensity={38} tint="light">
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('staff.requests.modalRoomTitle', { number: active?.roomNumber })}</Text>
                <TouchableOpacity onPress={() => setActiveId(null)}><Ionicons name="close" size={24} color={colors.slate} /></TouchableOpacity>
              </View>
              {active && (
                <>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
                    <Badge label={active.priority} tone={PRIORITY_TONE[active.priority]} />
                    {active.status === 'Cancelled' && <Badge label={statusLabel(active.status)} tone={STATUS_TONE[active.status]} />}
                  </View>
                  {active.status !== 'Cancelled' && (
                    <View style={styles.statusWrap}>
                      <StatusPill
                        steps={REQUEST_STATUS_STEPS}
                        activeIndex={REQUEST_STATUS_STEPS.indexOf(active.status)}
                        labels={{
                          Received: statusLabel('Received'),
                          Assigned: statusLabel('Assigned'),
                          'In Progress': statusLabel('In Progress'),
                          Completed: statusLabel('Completed'),
                        }}
                      />
                    </View>
                  )}
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>{t('staff.requests.guestLabel')}</Text>{active.guestName}</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>{t('staff.requests.categoryLabel')}</Text>{active.category} · {active.department}</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>{t('staff.requests.descriptionLabel')}</Text>{active.description}</Text>
                  {active.preferredTime && <Text style={styles.detailLine}><Text style={styles.detailLabel}>{t('staff.requests.preferredTimeLabel')}</Text>{active.preferredTime}</Text>}

                  <Text style={styles.fieldLabel}>{t('staff.requests.assignToStaff')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                    {staffDirectory.filter((s) => s.department === active.department || s.role === 'GENERAL_MANAGER').map((s) => (
                      <TouchableOpacity key={s.id} onPress={() => handleAssign(active.id, s.id)} style={[styles.chip, active.assignedStaffId === s.id && styles.chipActive]}>
                        <Text style={[styles.chipText, active.assignedStaffId === s.id && styles.chipTextActive]}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.fieldLabel}>{t('staff.requests.updateStatus')}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
                    {STATUSES.map((s) => (
                      <TouchableOpacity key={s} onPress={() => handleStatusChange(active.id, s)} style={[styles.chip, active.status === s && styles.chipActive]}>
                        <Text style={[styles.chipText, active.status === s && styles.chipTextActive]}>{statusLabel(s)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>{t('staff.requests.internalNotes')}</Text>
                  {(active.notes || []).map((n, i) => (
                    <View key={i} style={styles.noteBubble}>
                      <Text style={styles.noteText}><Text style={{ fontWeight: '700' }}>{n.by}: </Text>{n.text}</Text>
                    </View>
                  ))}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: spacing.lg }}>
                    <TextInput
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholder={t('staff.requests.notePlaceholder')}
                      placeholderTextColor={colors.slate}
                      style={styles.noteInput}
                    />
                    <TouchableOpacity onPress={handleAddNote} style={styles.noteAddBtn}>
                      <Text style={styles.noteAddBtnText}>{t('staff.requests.addNote')}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </GlassSurface>
        </View>
      </Modal>

      <Modal visible={!!roomPickerRequestId} animationType="slide" transparent onRequestClose={() => setRoomPickerRequestId(null)}>
        <View style={styles.modalBackdrop}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <GlassSurface style={styles.modalPanel} borderRadius={0} intensity={38} tint="light">
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('staff.requests.roomUpgrade.pickRoomTitle')}</Text>
                <TouchableOpacity onPress={() => setRoomPickerRequestId(null)}><Ionicons name="close" size={24} color={colors.slate} /></TouchableOpacity>
              </View>
              <Text style={styles.desc}>{t('staff.requests.roomUpgrade.pickRoomSub')}</Text>
              {availableRooms.length === 0 ? (
                <EmptyState icon="bed-outline" title={t('staff.requests.roomUpgrade.noRoomsAvailable')} />
              ) : (
                <View style={{ marginTop: spacing.md, gap: 8 }}>
                  {availableRooms.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={styles.roomOption}
                      disabled={completingUpgrade}
                      onPress={() => handleConfirmRoomUpgrade(r.id)}
                    >
                      <Text style={styles.roomOptionText}>{t('staff.requests.roomUpgrade.roomOption', { number: r.number, type: r.type })}</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.turquoiseDark} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </GlassSurface>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  headerTitle: { ...typography.heading, color: colors.charcoal },
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
  modalPanel: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 19, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  statusWrap: { marginBottom: spacing.md },
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
  roomOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  roomOptionText: { fontSize: 13.5, fontWeight: '600', color: colors.charcoal },
});
