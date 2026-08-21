import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, Badge, Pill } from '../../components/UI';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { colors, spacing, radius, font } from '../../theme/theme';
import { DESTINATIONS, DESTINATION_CATEGORIES } from '../../data/mockData';

export default function ExploreScreen({ navigation }) {
  const [category, setCategory] = useState('All');

  const filtered = useMemo(
    () => (category === 'All' ? DESTINATIONS : DESTINATIONS.filter((d) => d.category === category)),
    [category]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Dominica</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MapScreen')} style={styles.mapBtn}>
          <Ionicons name="map-outline" size={20} color={colors.deepOcean} />
        </TouchableOpacity>
      </View>
      <Text style={styles.headerSub}>The Nature Island — waterfalls, reefs, and rainforest, curated for you.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
        <Pill label="All" selected={category === 'All'} onPress={() => setCategory('All')} />
        {DESTINATION_CATEGORIES.map((c) => (
          <Pill key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.md, gap: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('DestinationDetail', { destinationId: item.id })}>
            <Card style={{ padding: 0, overflow: 'hidden', flexDirection: 'row' }}>
              <ImagePlaceholder kind={item.image} style={{ width: 110, height: 130, borderRadius: 0 }} iconSize={28} />
              <View style={{ flex: 1, padding: spacing.sm }}>
                <Badge label={item.category} tone="info" />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={12} color={colors.slate} />
                  <Text style={styles.metaText}>{item.travelTime}</Text>
                  <Ionicons name="trending-up-outline" size={12} color={colors.slate} style={{ marginLeft: 8 }} />
                  <Text style={styles.metaText}>{item.difficulty}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  mapBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  headerSub: { fontSize: 13, color: colors.slate, paddingHorizontal: spacing.lg, marginTop: 4 },
  pillScroll: { marginTop: spacing.md, flexGrow: 0 },
  cardTitle: { fontSize: 15.5, fontWeight: '700', color: colors.charcoal, marginTop: 6 },
  cardDesc: { fontSize: 12, color: colors.slate, marginTop: 3, lineHeight: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { fontSize: 11, color: colors.slate, marginLeft: 3 },
});
