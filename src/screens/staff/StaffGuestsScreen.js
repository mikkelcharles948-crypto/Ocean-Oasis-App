import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { Card, ScreenHeader, Badge, timeAgo } from '../../components/UI';
import GlassSurface from '../../components/GlassSurface';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function StaffGuestsScreen({ navigation }) {
  const { allGuestsForStaff, serviceRequests, activityBookings, feedback } = useApp();
  const [activeId, setActiveId] = useState(null);
  const active = activeId ? allGuestsForStaff.find((g) => g.id === activeId) : null;

  const requestsFor = (guestId) => serviceRequests.filter((r) => r.guest_id === guestId);
  const bookingsFor = (guestId) => activityBookings.filter((b) => b.guest_id === guestId);
  const feedbackFor = (guestId) => feedback.filter((f) => f.guest_id === guestId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title="Guests" onBack={() => navigation.goBack()} />
      <FlatList
        data={allGuestsForStaff}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setActiveId(item.id)}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.firstName} {item.lastName}{item.isAppUser ? ' (You)' : ''}</Text>
                <Text style={styles.meta}>Room {item.roomNumber} · {item.reservationNumber}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.slate} />
            </Card>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!active} transparent animationType="slide" onRequestClose={() => setActiveId(null)}>
        <View style={styles.modalBackdrop}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <GlassSurface style={styles.modalPanel} borderRadius={0} intensity={38} tint="light">
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{active?.firstName} {active?.lastName}</Text>
                <TouchableOpacity onPress={() => setActiveId(null)}><Ionicons name="close" size={22} color={colors.slate} /></TouchableOpacity>
              </View>
              {active && (
                <>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Room: </Text>{active.roomNumber}</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Reservation: </Text>{active.reservationNumber}</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Check-in: </Text>{active.checkIn}</Text>
                  <Text style={styles.detailLine}><Text style={styles.detailLabel}>Check-out: </Text>{active.checkOut}</Text>

                  <Text style={styles.fieldLabel}>Service Requests</Text>
                  {requestsFor(active.id).length === 0 ? (
                    <Text style={styles.emptyText}>None on file.</Text>
                  ) : requestsFor(active.id).map((r) => (
                    <View key={r.id} style={styles.rowLine}>
                      <Text style={styles.rowText}>{r.category} — {timeAgo(r.createdAt)}</Text>
                      <Badge label={r.status} tone="info" />
                    </View>
                  ))}

                  <Text style={styles.fieldLabel}>Activities Booked</Text>
                  {bookingsFor(active.id).length === 0 ? (
                    <Text style={styles.emptyText}>None on file.</Text>
                  ) : bookingsFor(active.id).map((b) => (
                    <Text key={b.id} style={styles.rowText}>{b.guests} guest(s) booked</Text>
                  ))}

                  <Text style={styles.fieldLabel}>Feedback</Text>
                  {feedbackFor(active.id).length === 0 ? (
                    <Text style={styles.emptyText}>None submitted.</Text>
                  ) : feedbackFor(active.id).map((f) => (
                    <Text key={f.id} style={styles.rowText}>{f.overall}/5 — "{f.comments}"</Text>
                  ))}
                </>
              )}
            </ScrollView>
          </GlassSurface>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.turquoiseDark, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  name: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal },
  meta: { fontSize: 12, color: colors.slate, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  detailLine: { fontSize: 13.5, color: colors.charcoal, marginBottom: 6, lineHeight: 19 },
  detailLabel: { fontWeight: '700' },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginTop: spacing.md, marginBottom: 6 },
  emptyText: { fontSize: 12.5, color: colors.slate },
  rowLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { fontSize: 13, color: colors.charcoal, paddingVertical: 4 },
});
