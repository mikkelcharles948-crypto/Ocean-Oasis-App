import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader, ErrorState, EmptyState } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { DINING_VENUES, DINING_MENUS } from '../../data/mockData';

export default function MenuScreen({ route, navigation }) {
  const { venueId } = route.params || {};
  const venue = DINING_VENUES.find((v) => v.id === venueId);
  const menu = DINING_MENUS[venueId];

  if (!venue) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title="Venue not found" onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={`${venue.name} Menu`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        {!menu ? (
          <EmptyState icon="restaurant-outline" title="Menu coming soon" subtitle="Ask our concierge for today's offerings." />
        ) : (
          menu.sections.map((section) => (
            <View key={section.title} style={{ marginBottom: spacing.lg }}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <View key={item.name} style={styles.itemRow}>
                  <View style={{ flex: 1, paddingRight: spacing.md }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginBottom: spacing.sm },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  itemName: { fontSize: 14, fontWeight: '700', color: colors.charcoal },
  itemDesc: { fontSize: 12, color: colors.slate, marginTop: 2, lineHeight: 16 },
  itemPrice: { fontSize: 13, fontWeight: '700', color: colors.turquoiseDark },
});
