import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList } from 'react-native';
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
      {/* A plain wrapping row, not a horizontal FlatList/ScrollView: on-device
          testing found filter-pill labels rendering blank specifically
          inside a horizontal scroll container on Android — see
          ExploreScreen.js's identical fix for the full explanation. */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginVertical: spacing.sm }}>
        {['All', ...ACTIVITY_CATEGORIES].map((item) => (
          <Pill key={item} label={item === 'All' ? t('explore.all') : t(`common.category.${item}`)} selected={category === item} onPress={() => setCategory(item)} />
        ))}
      </View>
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
