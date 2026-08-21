import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, SectionHeader, Badge, KpiCard, timeAgo } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const PRIORITY_TONE = { URGENT: 'error', HIGH: 'warning', NORMAL: 'neutral' };

export default function StaffHomeScreen({ navigation }) {
  const { opsSession, serviceRequests, rooms, maintenanceIssues, feedback, propertySettings, events, activities, activityBookings } = useApp();

  const openRequests = useMemo(
    () => serviceRequests.filter((r) => !['Completed', 'Cancelled'].includes(r.status))
      .sort((a, b) => {
        const order = { URGENT: 0, HIGH: 1, NORMAL: 2 };
        if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
        return new Date(b.createdAt) - new Date(a.createdAt);
      }),
    [serviceRequests]
  );
  const urgent = openRequests.filter((r) => r.priority === 'URGENT');
  const openMaintenance = maintenanceIssues.filter((m) => m.status !== 'RESOLVED');
  const inHouseCount = rooms.filter((r) => r.status.startsWith('OCCUPIED')).length;
  const occupancy = rooms.length ? Math.round((inHouseCount / rooms.length) * 100) : 0;
  const unresolvedFeedback = feedback.filter((f) => f.overall <= (propertySettings.lowRatingThreshold || 3) && !f.resolved);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.eyebrow}>OCEAN OASIS · STAFF OPS</Text>
        <Text style={styles.greeting}>{greeting}, {opsSession?.name?.split(' ')[0] || 'Team'}</Text>
        <Text style={styles.dateLine}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

        <View style={styles.kpiRow}>
          <KpiCard label="Occupancy" value={`${occupancy}%`} sub={`${inHouseCount}/${rooms.length} rooms`} />
          <KpiCard label="Open Requests" value={openRequests.length} sub={`${urgent.length} urgent`} />
          <KpiCard label="Maintenance" value={openMaintenance.length} sub="open issues" />
          <KpiCard label="Feedback Alerts" value={unresolvedFeedback.length} sub="need follow-up" />
        </View>

        {(urgent.length > 0 || unresolvedFeedback.length > 0) && (
          <Card style={{ backgroundColor: '#FBF0EC', borderWidth: 1, borderColor: '#EAC3B8', marginTop: spacing.sm }}>
            <Text style={styles.alertTitle}>⚠ Needs immediate attention</Text>
            {urgent.map((r) => (
              <Text key={r.id} style={styles.alertLine}>Room {r.roomNumber} — {r.category}: {r.description}</Text>
            ))}
            {unresolvedFeedback.map((f) => (
              <Text key={f.id} style={styles.alertLine}>Room {f.roomNumber} — Guest experience alert, rated {f.overall}/5</Text>
            ))}
          </Card>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Priority Queue" actionLabel="View all" onAction={() => navigation.navigate('Requests')} />
          <Card style={{ padding: 0 }}>
            {openRequests.length === 0 ? (
              <Text style={styles.emptyText}>No open requests right now.</Text>
            ) : openRequests.slice(0, 5).map((r, i) => (
              <TouchableOpacity key={r.id} style={[styles.row, i > 0 && styles.rowBorder]} onPress={() => navigation.navigate('Requests')}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>Room {r.roomNumber} — {r.category}</Text>
                  <Text style={styles.rowSub}>{r.department} · {timeAgo(r.createdAt)}</Text>
                </View>
                <Badge label={r.priority} tone={PRIORITY_TONE[r.priority]} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Maintenance Watchlist" actionLabel="View all" onAction={() => navigation.navigate('More', { screen: 'StaffMaintenance' })} />
          <Card style={{ padding: 0 }}>
            {openMaintenance.length === 0 ? (
              <Text style={styles.emptyText}>No open maintenance issues.</Text>
            ) : openMaintenance.slice(0, 4).map((m, i) => (
              <View key={m.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>Room {m.roomNumber} — {m.category}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{m.description}</Text>
                </View>
                <Badge label={m.status.replace('_', ' ')} tone={m.status === 'OPEN' ? 'error' : 'warning'} />
              </View>
            ))}
          </Card>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title="Today at Ocean Oasis" />
          <Card style={{ padding: 0 }}>
            {[...events.filter((e) => e.date === '2026-08-15'), ...activities.filter((a) => a.date === '2026-08-15')].map((item, i) => (
              <View key={item.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.time} — {item.title || item.name}</Text>
                  <Text style={styles.rowSub}>{item.location || item.meetingPoint}{item.name ? ` · ${activityBookings.filter((b) => b.activityId === item.id).reduce((s, b) => s + b.guests, 0)} booked` : ''}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: colors.gold },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginTop: 4 },
  dateLine: { fontSize: 13, color: colors.slate, marginTop: 2, marginBottom: spacing.md },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  alertTitle: { fontWeight: '800', color: colors.error, fontSize: 13, marginBottom: 6 },
  alertLine: { fontSize: 12.5, color: colors.charcoal, marginBottom: 4 },
  emptyText: { fontSize: 13, color: colors.slate, padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowTitle: { fontSize: 13.5, fontWeight: '700', color: colors.charcoal },
  rowSub: { fontSize: 12, color: colors.slate, marginTop: 2 },
});
