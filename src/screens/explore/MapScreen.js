import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Pill } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { DESTINATIONS, DINING_VENUES } from '../../data/mockData';

// Mock coordinate map. Structured so this screen can later be swapped for a
// real MapView (react-native-maps) or WebView-based Google Maps / Mapbox embed.
const MAP_PINS = [
  { id: 'hotel', label: 'Ocean Oasis', type: 'Hotel', x: '50%', y: '52%', icon: 'home' },
  ...DESTINATIONS.slice(0, 5).map((d, i) => ({
    id: d.id, label: d.title, type: 'Attraction',
    x: `${20 + i * 15}%`, y: `${20 + (i % 3) * 22}%`, icon: 'map-marker',
  })),
  ...DINING_VENUES.slice(0, 2).map((v, i) => ({
    id: v.id, label: v.name, type: 'Dining',
    x: `${60 + i * 10}%`, y: `${65 + i * 8}%`, icon: 'silverware-fork-knife',
  })),
];

const FILTERS = ['All', 'Hotel', 'Attraction', 'Dining'];
const FILTER_KEY = { All: 'all', Hotel: 'hotel', Attraction: 'attraction', Dining: 'dining' };

export default function MapScreen({ navigation }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const pins = filter === 'All' ? MAP_PINS : MAP_PINS.filter((p) => p.type === filter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('explore.map')} onBack={() => navigation.goBack()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: spacing.sm }} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
        {FILTERS.map((f) => (
          <Pill key={f} label={t(`explore.mapFilter.${FILTER_KEY[f]}`)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      <View style={styles.mapArea}>
        <View style={styles.grid} pointerEvents="none">
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLineH, { top: `${i * 18}%` }]} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 20}%` }]} />
          ))}
        </View>
        {pins.map((pin) => (
          <TouchableOpacity
            key={pin.id}
            style={[styles.pin, { left: pin.x, top: pin.y }]}
            onPress={() => setSelected(pin)}
          >
            <View style={[styles.pinDot, pin.id === 'hotel' && styles.pinDotHotel]}>
              <MaterialCommunityIcons name={pin.icon} size={14} color={colors.white} />
            </View>
          </TouchableOpacity>
        ))}
        <Text style={styles.mapNotice}>{t('explore.mapNotice')}</Text>
      </View>

      {selected && (
        <View style={styles.calloutCard}>
          <View>
            <Text style={styles.calloutTitle}>{selected.label}</Text>
            <Text style={styles.calloutType}>{t(`explore.mapFilter.${FILTER_KEY[selected.type]}`)}</Text>
          </View>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Ionicons name="close" size={20} color={colors.slate} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mapArea: { flex: 1, backgroundColor: '#DCEEEA', margin: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
  grid: { ...StyleSheet.absoluteFillObject },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(11,59,69,0.08)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(11,59,69,0.08)' },
  pin: { position: 'absolute', transform: [{ translateX: -14 }, { translateY: -14 }] },
  pinDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.turquoiseDark,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white,
  },
  pinDotHotel: { backgroundColor: colors.deepOcean, width: 34, height: 34, borderRadius: 17 },
  mapNotice: {
    position: 'absolute', bottom: 10, alignSelf: 'center', fontSize: 10.5, color: colors.slate,
    backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill,
  },
  calloutCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  calloutTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal },
  calloutType: { fontSize: 12, color: colors.slate, marginTop: 2 },
});
