import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, Badge } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { ROOM_STATUSES, ROOM_STATUS_LABELS } from '../../data/mockData';

const STATUS_TONE = {
  VACANT_CLEAN: 'success', VACANT_DIRTY: 'warning', OCCUPIED_CLEAN: 'info',
  OCCUPIED_SERVICE_REQUIRED: 'error', INSPECTION_REQUIRED: 'warning', OUT_OF_ORDER: 'neutral',
};

export default function StaffRoomsScreen() {
  const { rooms, updateRoomStatus, allGuestsForStaff } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [activeId, setActiveId] = useState(null);

  const counts = useMemo(() => {
    const c = {};
    ROOM_STATUSES.forEach((s) => { c[s] = rooms.filter((r) => r.status === s).length; });
    return c;
  }, [rooms]);

  const filtered = filter === 'ALL' ? rooms : rooms.filter((r) => r.status === filter);
  const sorted = [...filtered].sort((a, b) => a.number.localeCompare(b.number));
  const active = activeId ? rooms.find((r) => r.id === activeId) : null;
  const guestInRoom = (num) => allGuestsForStaff.find((g) => g.roomNumber === num);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rooms & Housekeeping</Text>
        <Text style={styles.headerSub}>{rooms.length} rooms · live status shared with the guest and management views.</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(r) => r.id}
        numColumns={3}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl }}
        columnWrapperStyle={{ gap: spacing.sm }}
        ListHeaderComponent={
          <View style={styles.summaryWrap}>
            {ROOM_STATUSES.map((s) => (
              <TouchableOpacity key={s} onPress={() => setFilter(filter === s ? 'ALL' : s)} style={[styles.summaryChip, filter === s && styles.summaryChipActive]}>
                <Text style={[styles.summaryCount, filter === s && { color: colors.white }]}>{counts[s]}</Text>
                <Text style={[styles.summaryLabel, filter === s && { color: colors.white }]}>{ROOM_STATUS_LABELS[s]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={{ flex: 1 / 3, marginBottom: spacing.sm }} onPress={() => setActiveId(item.id)}>
            <Card style={{ padding: spacing.sm, alignItems: 'center' }}>
              <Text style={styles.roomNum}>{item.number}</Text>
              <View style={[styles.dot, { backgroundColor: dotColor(item.status) }]} />
            </Card>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!active} transparent animationType="fade" onRequestClose={() => setActiveId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Room {active?.number}</Text>
              <TouchableOpacity onPress={() => setActiveId(null)}><Ionicons name="close" size={22} color={colors.slate} /></TouchableOpacity>
            </View>
            {active && (
              <>
                <Text style={styles.modalMeta}>{active.type} · Floor {active.floor}</Text>
                <Badge label={ROOM_STATUS_LABELS[active.status]} tone={STATUS_TONE[active.status]} />
                {guestInRoom(active.number) && (
                  <Text style={styles.guestLine}>Guest: {guestInRoom(active.number).firstName} {guestInRoom(active.number).lastName}</Text>
                )}
                <Text style={styles.fieldLabel}>Update status</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {ROOM_STATUSES.map((s) => (
                    <TouchableOpacity key={s} onPress={() => updateRoomStatus(active.id, s)} style={[styles.chip, active.status === s && styles.chipActive]}>
                      <Text style={[styles.chipText, active.status === s && styles.chipTextActive]}>{ROOM_STATUS_LABELS[s]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function dotColor(status) {
  return {
    VACANT_CLEAN: colors.success, VACANT_DIRTY: '#9A5B26', OCCUPIED_CLEAN: colors.turquoiseDark,
    OCCUPIED_SERVICE_REQUIRED: colors.error, INSPECTION_REQUIRED: '#9A5B26', OUT_OF_ORDER: colors.slate,
  }[status];
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  headerSub: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  summaryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  summaryChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, minWidth: '31%' },
  summaryChipActive: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
  summaryCount: { fontSize: 17, fontWeight: '700', color: colors.deepOcean, fontFamily: font.display },
  summaryLabel: { fontSize: 10, color: colors.slate, marginTop: 1 },
  roomNum: { fontSize: 16, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalPanel: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  modalMeta: { fontSize: 12.5, color: colors.slate, marginBottom: 8 },
  guestLine: { fontSize: 12.5, color: colors.charcoal, marginTop: 8 },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginTop: spacing.md, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.sandLight },
  chipActive: { backgroundColor: colors.deepOcean },
  chipText: { fontSize: 11.5, fontWeight: '600', color: colors.charcoal },
  chipTextActive: { color: colors.white },
});
