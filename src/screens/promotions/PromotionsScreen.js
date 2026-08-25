import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Card } from '../../components/UI';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import Button from '../../components/Button';
import { colors, spacing, font, shadow } from '../../theme/theme';
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
          <Card style={{ padding: 0, overflow: 'hidden', ...shadow.float }}>
            <View>
              <ImagePlaceholder kind={item.image} uri={item.imageUrl} style={{ height: 140, borderRadius: 0 }} iconSize={32} />
              <View style={styles.goldChip}>
                <Ionicons name="pricetag" size={13} color={colors.deepOcean} />
              </View>
            </View>
            <View style={{ padding: spacing.md }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <View style={styles.validityRow}>
                <Ionicons name="time-outline" size={13} color={colors.gold} />
                <Text style={styles.validity}>{item.validity}</Text>
              </View>
              <Text style={styles.terms}>{item.terms}</Text>
              <Button
                label={t('promotions.askConciergeAboutThis')}
                variant="outline"
                onPress={() => navigation.navigate('Concierge')}
                style={{ marginTop: spacing.md }}
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
  validityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  validity: { fontSize: 12, color: '#8A6C25', fontWeight: '700', flexShrink: 1 },
  terms: { fontSize: 11, color: colors.slate, marginTop: 6, fontStyle: 'italic' },
  goldChip: {
    position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', ...shadow.card,
  },
});
