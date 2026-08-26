import React, { useState, useMemo, useCallback } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Pill, EmptyState } from '../../components/UI';
import ExperienceCard from '../../components/ExperienceCard';
import { colors, spacing } from '../../theme/theme';
import { ACTIVITY_CATEGORIES } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { getLocalizedContent } from '../../i18n/content';
import activitiesContent from '../../i18n/content/activities';
import { formatActivityPrice } from '../../utils/formatActivityPrice';

export default function ActivitiesScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { activities } = useApp();
  const [category, setCategory] = useState('All');
  const filtered = useMemo(
    () => (category === 'All' ? activities : activities.filter((a) => a.category === category)),
    [category, activities]
  );

  const renderActivity = useCallback(
    ({ item }) => {
      const localized = getLocalizedContent(activitiesContent, item.id, i18n.language, item);
      const cardData = { ...localized, category: t(`common.category.${item.category}`) };
      return (
        // Uniform size deliberately — see ExploreScreen.js's renderItem for
        // why: mixing a "large" first row with "medium" rows after it in a
        // FlatList with no getItemLayout is what caused card titles to
        // render blank for any category with more than one item.
        <ExperienceCard
          activity={cardData}
          priceLabel={formatActivityPrice(item, t)}
          size="medium"
          onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
        />
      );
    },
    [i18n.language, t, navigation]
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
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.lg }}
        ListEmptyComponent={<EmptyState icon="sunny-outline" title={t('activities.noActivities')} />}
        renderItem={renderActivity}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
      />
    </SafeAreaView>
  );
}
