import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { Card, Badge } from '../../components/UI';
import AnimatedPressable from '../../components/AnimatedPressable';
import GlassSurface from '../../components/GlassSurface';
import { colors, spacing, radius, font, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { ROOM_STATUSES, ROOM_STATUS_LABELS } from '../../data/mockData';

const STATUS_TONE = {
  VACANT_CLEAN: 'success', VACANT_DIRTY: 'warning', OCCUPIED_CLEAN: 'info',
  OCCUPIED_SERVICE_REQUIRED: 'error', INSPECTION_REQUIRED: 'warning', OUT_OF_ORDER: 'neutral',
};

export default function StaffRoomsScreen({ navigation }) {
  const { t } = useTranslation();
  const { rooms, updateRoomStatus, allGuestsForStaff } = useApp();
  const [filter, setFilter] = useState('ALL');
  const [activeId, setActiveId] = useState(null);
  const roomStatusLabel = (s) => t(`staff.rooms.statusLabels.${s}`, { defaultValue: ROOM_STATUS_LABELS[s] });

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
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('staff.rooms.title')}</Text>
          <Text style={styles.headerSub}>{t('staff.rooms.subtitle', { count: rooms.length })}</Text>
        </View>
        <TouchableOpacity style={styles.newBookingBtn} onPress={() => navigation.navigate('StaffNewBooking')} activeOpacity={0.85}>
          <Ionicons name="add" size={16} color={colors.white} />
          <Text style={styles.newBookingBtnText}>{t('staff.newBooking.entryButton')}</Text>
        </TouchableOpacity>
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
                <Text style={[styles.summaryLabel, filter === s && { color: colors.white }]}>{roomStatusLabel(s)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        renderItem={({ item }) => {
          const dnd = guestInRoom(item.number)?.housekeepingPreference === 'DO_NOT_DISTURB';
          return (
            <AnimatedPressable style={{ flex: 1 / 3, marginBottom: spacing.sm }} onPress={() => setActiveId(item.id)}>
              <Card style={{ padding: spacing.sm, alignItems: 'center' }}>
                {dnd && <Ionicons name="moon" size={12} color={colors.gold} style={styles.dndBadge} />}
                <Text style={styles.roomNum}>{item.number}</Text>
                <View style={[styles.dot, { backgroundColor: dotColor(item.status) }]} />
              </Card>
            </AnimatedPressable>
          );
        }}
      />

      <Modal visible={!!active} transparent animationType="fade" onRequestClose={() => setActiveId(null)}>
        <View style={styles.modalBackdrop}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <GlassSurface style={styles.modalPanel} borderRadius={radius.lg} intensity={38} tint="light">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('staff.requests.modalRoomTitle', { number: active?.number })}</Text>
              <TouchableOpacity onPress={() => setActiveId(null)}><Ionicons name="close" size={22} color={colors.slate} /></TouchableOpacity>
            </View>
            {active && (
              <>
                <Text style={styles.modalMeta}>{t('staff.rooms.floorLabel', { type: active.type, floor: active.floor })}</Text>
                <Badge label={roomStatusLabel(active.status)} tone={STATUS_TONE[active.status]} />
                {guestInRoom(active.number) && (
                  <Text style={styles.guestLine}>{t('staff.rooms.guestLabel', { name: `${guestInRoom(active.number).firstName} ${guestInRoom(active.number).lastName}` })}</Text>
                )}
                {guestInRoom(active.number)?.housekeepingPreference === 'DO_NOT_DISTURB' && (
                  <View style={styles.dndNotice}>
                    <Ionicons name="moon" size={14} color={colors.gold} />
                    <Text style={styles.dndNoticeText}>{t('staff.rooms.doNotDisturb')}</Text>
                  </View>
                )}
                <Text style={styles.fieldLabel}>{t('staff.rooms.updateStatus')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {ROOM_STATUSES.map((s) => (
                    <TouchableOpacity key={s} onPress={() => updateRoomStatus(active.id, s)} style={[styles.chip, active.status === s && styles.chipActive]}>
                      <Text style={[styles.chipText, active.status === s && styles.chipTextActive]}>{roomStatusLabel(s)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </GlassSurface>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs, gap: spacing.sm },
  headerTitle: { ...typography.heading, color: colors.charcoal },
  headerSub: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  newBookingBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.deepOcean,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.pill,
  },
  newBookingBtnText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  summaryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  summaryChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, minWidth: '31%' },
  summaryChipActive: { backgroundColor: colors.deepOcean, borderColor: colors.deepOcean },
  summaryCount: { fontSize: 17, fontWeight: '700', color: colors.deepOcean, fontFamily: font.display },
  summaryLabel: { fontSize: 10, color: colors.slate, marginTop: 1 },
  roomNum: { fontSize: 16, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  dndBadge: { position: 'absolute', top: 6, right: 6 },
  dndNotice: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F5EBD3',
    borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6, marginTop: 8, alignSelf: 'flex-start',
  },
  dndNoticeText: { fontSize: 11.5, fontWeight: '700', color: '#8A6C25' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalPanel: { borderRadius: radius.lg, padding: spacing.lg },
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
