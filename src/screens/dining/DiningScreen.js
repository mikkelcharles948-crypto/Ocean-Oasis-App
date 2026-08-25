import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, Badge } from '../../components/UI';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { colors, spacing, font, shadow } from '../../theme/theme';
import { DINING_VENUES } from '../../data/mockData';
import { getLocalizedContent } from '../../i18n/content';
import diningVenuesContent from '../../i18n/content/diningVenues';

const TYPE_KEY = {
  'Signature Restaurant': 'signatureRestaurant',
  'All-Day Dining': 'allDayDining',
  'Bar & Lounge': 'barLounge',
  'Room Service': 'roomService',
};

export default function DiningScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('dining.title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={DINING_VENUES}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => {
          const localized = getLocalizedContent(diningVenuesContent, item.id, i18n.language, item);
          return (
          <TouchableOpacity onPress={() => navigation.navigate('DiningVenue', { venueId: item.id })} activeOpacity={0.92}>
            <Card style={{ padding: 0, overflow: 'hidden', ...shadow.float }}>
              <ImagePlaceholder kind={item.image} uri={item.imageUrl} style={{ height: 140, borderRadius: 0 }} iconSize={32} />
              <View style={{ padding: spacing.md }}>
                <Badge label={t(`dining.type.${TYPE_KEY[item.type] || 'roomService'}`)} tone="info" />
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc} numberOfLines={2}>{localized.description}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={13} color={colors.slate} />
                  <Text style={styles.metaText} numberOfLines={1}>{item.hours}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 17, fontWeight: '700', color: colors.charcoal, marginTop: 8, fontFamily: font.display },
  desc: { fontSize: 12.5, color: colors.slate, marginTop: 3, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  metaText: { fontSize: 11.5, color: colors.slate, flex: 1 },
});
