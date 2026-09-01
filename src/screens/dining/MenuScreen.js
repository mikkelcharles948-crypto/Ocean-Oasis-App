import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, ErrorState, EmptyState } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { getLocalizedMenu } from '../../i18n/content';
import diningMenusContent from '../../i18n/content/diningMenus';
import { useApp } from '../../context/AppContext';

export default function MenuScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const { diningVenues } = useApp();
  const { venueId } = route.params || {};
  const venue = diningVenues.find((v) => v.id === venueId);
  const rawMenu = venue?.menuSections?.length ? { sections: venue.menuSections } : null;
  const menu = rawMenu ? getLocalizedMenu(diningMenusContent, venueId, i18n.language, rawMenu) : rawMenu;

  if (!venue) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ErrorState title={t('dining.venueNotFound')} onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('dining.menuTitle', { venue: venue.name })} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        {!menu ? (
          <EmptyState icon="restaurant-outline" title={t('dining.menuComingSoon')} subtitle={t('dining.menuComingSoonSub')} />
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
