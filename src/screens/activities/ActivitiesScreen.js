import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, Badge, Pill, EmptyState } from '../../components/UI';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { colors, spacing, font } from '../../theme/theme';
import { ACTIVITY_CATEGORIES } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const AVAILABILITY_KEY = { Available: 'available', 'Limited spots': 'limitedSpots' };

export default function ActivitiesScreen({ navigation }) {
  const { t } = useTranslation();
  const { activities } = useApp();
  const [category, setCategory] = useState('All');
  const filtered = useMemo(
    () => (category === 'All' ? activities : activities.filter((a) => a.category === category)),
    [category, activities]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('activities.title')} onBack={() => navigation.goBack()} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['All', ...ACTIVITY_CATEGORIES]}
        keyExtractor={(c) => c}
        style={{ flexGrow: 0, marginVertical: spacing.sm }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        renderItem={({ item }) => <Pill label={item === 'All' ? t('explore.all') : t(`common.category.${item}`)} selected={category === item} onPress={() => setCategory(item)} />}
      />
      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md }}
        ListEmptyComponent={<EmptyState icon="sunny-outline" title={t('activities.noActivities')} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <ImagePlaceholder kind={item.image} uri={item.imageUrl} style={{ height: 130, borderRadius: 0 }} iconSize={32} />
              <View style={{ padding: spacing.md }}>
                <View style={styles.rowBetween}>
                  <Badge label={t(`common.category.${item.category}`)} tone="info" />
                  <Badge label={t(`common.availability.${AVAILABILITY_KEY[item.availability] || 'available'}`)} tone={item.availability === 'Available' ? 'success' : 'warning'} />
                </View>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.desc} numberOfLines={2}>{item.shortDescription}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.slate} />
                  <Text style={styles.metaText}>{item.time} · {item.duration}</Text>
                </View>
                <View style={styles.footerRow}>
                  <Text style={styles.price}>{item.price}</Text>
                  <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16.5, fontWeight: '700', color: colors.charcoal, marginTop: 8, fontFamily: font.display },
  desc: { fontSize: 12.5, color: colors.slate, marginTop: 3, lineHeight: 17 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  metaText: { fontSize: 11.5, color: colors.slate },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  price: { fontSize: 13.5, fontWeight: '700', color: colors.charcoal },
  location: { fontSize: 11.5, color: colors.slate, flex: 1, textAlign: 'right', marginLeft: spacing.sm },
});
