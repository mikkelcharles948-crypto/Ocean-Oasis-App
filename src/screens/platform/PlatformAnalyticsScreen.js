import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, ScreenHeader, Badge, EmptyState } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const PLAN_LABELS = { trial: 'Trial', starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' };
const PLAN_TONE = { trial: 'neutral', starter: 'info', growth: 'success', enterprise: 'warning' };
const STATUS_TONE = { ACTIVE: 'success', TRIAL: 'warning', SUSPENDED: 'neutral' };

function money(n) {
  return `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function StatTile({ icon, label, value }) {
  return (
    <View style={styles.statTile}>
      <Ionicons name={icon} size={16} color={colors.turquoiseDark} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// The platform admin's cross-hotel rollup — total MRR/guests/occupancy
// across every hotel, then a per-hotel breakdown. Every figure here is a
// real read (guests/rooms/reservations/profiles, aggregated client-side in
// loadPlatformAnalytics) except mrr/plan, which are stored figures MCX
// enters manually per customer, same as the rest of the app's billing.
export default function PlatformAnalyticsScreen() {
  const { hotels, platformAnalytics, refreshPlatformData } = useApp();

  useEffect(() => {
    refreshPlatformData();
  }, [refreshPlatformData]);

  const totals = useMemo(() => {
    const t = { hotels: hotels.length, active: 0, mrr: 0, guests: 0, rooms: 0, occupiedRooms: 0, staff: 0 };
    hotels.forEach((h) => {
      if (h.status === 'ACTIVE') t.active += 1;
      t.mrr += h.mrr || 0;
      const a = platformAnalytics[h.id];
      if (a) {
        t.guests += a.guests;
        t.rooms += a.rooms;
        t.occupiedRooms += a.occupiedRooms;
        t.staff += a.staff;
      }
    });
    return t;
  }, [hotels, platformAnalytics]);

  const occupancyPct = totals.rooms > 0 ? Math.round((totals.occupiedRooms / totals.rooms) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title="Analytics" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <View style={styles.statGrid}>
          <StatTile icon="business" label="Hotels" value={`${totals.active}/${totals.hotels}`} />
          <StatTile icon="cash" label="MRR" value={money(totals.mrr)} />
          <StatTile icon="people" label="Guests" value={totals.guests} />
          <StatTile icon="bed" label="Occupancy" value={`${occupancyPct}%`} />
        </View>

        <Text style={styles.sectionTitle}>By property</Text>
        {hotels.length === 0 ? (
          <EmptyState icon="business-outline" title="No hotels yet" subtitle="Add a property in the Hotels tab first." />
        ) : (
          hotels.map((h) => {
            const a = platformAnalytics[h.id] || { guests: 0, rooms: 0, occupiedRooms: 0, activeReservations: 0, staff: 0 };
            const hotelOccupancy = a.rooms > 0 ? Math.round((a.occupiedRooms / a.rooms) * 100) : 0;
            return (
              <Card key={h.id} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={styles.hotelName}>{h.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Badge label={PLAN_LABELS[h.plan] || h.plan} tone={PLAN_TONE[h.plan]} />
                    <Badge label={h.status} tone={STATUS_TONE[h.status]} />
                  </View>
                </View>
                <Text style={styles.hotelMeta}>{money(h.mrr)}/mo · {a.staff} staff · {a.guests} guests on file</Text>
                <View style={styles.hotelStatsRow}>
                  <Text style={styles.hotelStat}>{a.occupiedRooms}/{a.rooms} rooms occupied ({hotelOccupancy}%)</Text>
                  <Text style={styles.hotelStat}>{a.activeReservations} active reservations</Text>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  statTile: {
    flexBasis: '47%', flexGrow: 1, backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  statLabel: { fontSize: 11.5, color: colors.slate },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  hotelName: { fontSize: 15.5, fontWeight: '700', color: colors.charcoal },
  hotelMeta: { fontSize: 12, color: colors.slate, marginTop: 2 },
  hotelStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  hotelStat: { fontSize: 11.5, color: colors.turquoiseDark, fontWeight: '600' },
});
