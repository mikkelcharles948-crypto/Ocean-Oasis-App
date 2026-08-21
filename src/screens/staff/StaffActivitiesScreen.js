import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, Badge, ProgressBar, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function StaffActivitiesScreen() {
  const { activities, activityBookings, createActivity } = useApp();
  const [activeId, setActiveId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Ocean', date: '2026-08-20', time: '10:00 AM', duration: '2 hrs', price: '$65 per person', priceValue: 65, capacity: '15', meetingPoint: 'Hotel Lobby', description: '', shortDescription: '', location: 'Ocean Oasis' });

  const bookingsFor = (id) => activityBookings.filter((b) => b.activityId === id);
  const active = activeId ? activities.find((a) => a.id === activeId) : null;

  const submit = () => {
    if (!form.name.trim()) return;
    createActivity({ ...form, capacity: Number(form.capacity) || 10, availability: 'Available', image: 'nature' });
    setShowNew(false);
    setForm({ name: '', category: 'Ocean', date: '2026-08-20', time: '10:00 AM', duration: '2 hrs', price: '$65 per person', priceValue: 65, capacity: '15', meetingPoint: 'Hotel Lobby', description: '', shortDescription: '', location: 'Ocean Oasis' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Activities</Text>
          <Text style={styles.headerSub}>Publish activities guests can book from the Guest App.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowNew(true)}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => {
          const bookings = bookingsFor(item.id);
          const bookedGuests = bookings.reduce((s, b) => s + b.guests, 0);
          const util = item.capacity ? Math.min(100, Math.round((bookedGuests / item.capacity) * 100)) : 0;
          return (
            <TouchableOpacity onPress={() => setActiveId(item.id)}>
              <Card>
                <Badge label={item.category} tone="info" />
                <Text style={styles.actName}>{item.name}</Text>
                <Text style={styles.actMeta}>{item.date} · {item.time} · {item.duration}</Text>
                <View style={{ marginTop: spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.utilLabel}>{bookedGuests}/{item.capacity} booked</Text>
                    <Text style={[styles.utilLabel, { fontWeight: '700', color: util > 85 ? colors.error : colors.turquoiseDark }]}>{util}%</Text>
                  </View>
                  <ProgressBar percent={util} tone={util > 85 ? 'error' : 'info'} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!active} transparent animationType="slide" onRequestClose={() => setActiveId(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{active?.name}</Text>
                <TouchableOpacity onPress={() => setActiveId(null)}><Ionicons name="close" size={22} color={colors.slate} /></TouchableOpacity>
              </View>
              {active && (
                <>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>When: </Text>{active.date} at {active.time} ({active.duration})</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Price: </Text>{active.price}</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Meeting point: </Text>{active.meetingPoint}</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Capacity: </Text>{active.capacity}</Text>
                  <Text style={styles.fieldLabel}>Guest List ({bookingsFor(active.id).length})</Text>
                  {bookingsFor(active.id).length === 0 ? (
                    <Text style={styles.emptyText}>No bookings yet.</Text>
                  ) : bookingsFor(active.id).map((b) => (
                    <Text key={b.id} style={styles.bookingLine}>{b.guestName} — {b.guests} guest(s)</Text>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showNew} transparent animationType="slide" onRequestClose={() => setShowNew(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Activity</Text>
                <TouchableOpacity onPress={() => setShowNew(false)}><Ionicons name="close" size={22} color={colors.slate} /></TouchableOpacity>
              </View>
              <Field label="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="e.g. Turtle Reef Kayaking" />
              <Field label="Short Description" value={form.shortDescription} onChangeText={(v) => setForm({ ...form, shortDescription: v })} />
              <Field label="Full Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
              <Field label="Date (YYYY-MM-DD)" value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} />
              <Field label="Time" value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} />
              <Field label="Duration" value={form.duration} onChangeText={(v) => setForm({ ...form, duration: v })} />
              <Field label="Capacity" value={form.capacity} onChangeText={(v) => setForm({ ...form, capacity: v })} keyboardType="number-pad" />
              <Field label="Price (display)" value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} />
              <Field label="Meeting Point" value={form.meetingPoint} onChangeText={(v) => setForm({ ...form, meetingPoint: v })} />
              <Button label="Publish to Guest App" onPress={submit} style={{ marginTop: spacing.md, marginBottom: spacing.lg }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs, gap: spacing.sm },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  headerSub: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
  actName: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginTop: 6 },
  actMeta: { fontSize: 12, color: colors.slate, marginTop: 2 },
  utilLabel: { fontSize: 11.5, color: colors.slate },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, flex: 1 },
  detailLine: { fontSize: 13.5, color: colors.charcoal, marginBottom: 6, lineHeight: 19 },
  detailLabel: { fontWeight: '700' },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginTop: spacing.sm, marginBottom: 8 },
  emptyText: { fontSize: 12.5, color: colors.slate },
  bookingLine: { fontSize: 13, color: colors.charcoal, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
});
