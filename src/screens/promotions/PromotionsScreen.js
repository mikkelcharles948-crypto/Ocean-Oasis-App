import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../components/UI';
import PromotionCard from '../../components/PromotionCard';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { getLocalizedContent } from '../../i18n/content';
import promotionsContent from '../../i18n/content/promotions';

export default function PromotionsScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { promotions } = useApp();
  const published = promotions.filter((p) => p.status === 'PUBLISHED');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('promotions.title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={published}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        renderItem={({ item: rawItem }) => {
          const item = getLocalizedContent(promotionsContent, rawItem.id, i18n.language, rawItem);
          return (
            <View>
              <PromotionCard
                promotion={item}
                eyebrowLabel={t('home.eyebrowOffer')}
                validityLabel={item.validity}
                size="large"
                onPress={() => navigation.navigate('Concierge')}
              />
              {item.terms ? <Text style={styles.terms}>{item.terms}</Text> : null}
              <Button
                label={t('promotions.askConciergeAboutThis')}
                variant="outline"
                onPress={() => navigation.navigate('Concierge')}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  terms: { ...typography.caption, color: colors.slate, fontStyle: 'italic', marginTop: spacing.sm, textTransform: 'none', letterSpacing: 0 },
});
