import React from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../components/UI';
import EditorialImageCard from '../../components/EditorialImageCard';
import { colors, spacing } from '../../theme/theme';
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
            <EditorialImageCard
              image={item.imageUrl ? { uri: item.imageUrl } : null}
              fallbackIcon="restaurant-outline"
              eyebrow={t(`dining.type.${TYPE_KEY[item.type] || 'roomService'}`)}
              title={item.name}
              meta={localized.description}
              trailing={item.hours}
              size="medium"
              onPress={() => navigation.navigate('DiningVenue', { venueId: item.id })}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}
