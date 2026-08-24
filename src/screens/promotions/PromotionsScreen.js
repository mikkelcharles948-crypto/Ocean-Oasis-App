import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card } from '../../components/UI';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import Button from '../../components/Button';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

export default function PromotionsScreen({ navigation }) {
  const { t } = useTranslation();
  const { promotions } = useApp();
  const published = promotions.filter((p) => p.status === 'PUBLISHED');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('promotions.title')} onBack={() => navigation.goBack()} />
      <FlatList
        data={published}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <ImagePlaceholder kind={item.image} uri={item.imageUrl} style={{ height: 130, borderRadius: 0 }} iconSize={32} />
            <View style={{ padding: spacing.md }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.validity}>{item.validity}</Text>
              <Text style={styles.terms}>{item.terms}</Text>
              <Button
                label={t('promotions.askConciergeAboutThis')}
                variant="outline"
                onPress={() => navigation.navigate('Concierge')}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  desc: { fontSize: 13.5, color: colors.slate, marginTop: 6, lineHeight: 19 },
  validity: { fontSize: 12, color: colors.turquoiseDark, fontWeight: '700', marginTop: 8 },
  terms: { fontSize: 11, color: colors.slate, marginTop: 4, fontStyle: 'italic' },
});
