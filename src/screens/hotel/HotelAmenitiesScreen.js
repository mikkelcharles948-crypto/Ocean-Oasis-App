import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Card, SectionHeader } from '../../components/UI';
import { colors, spacing, radius, font, shadow } from '../../theme/theme';

const AMENITIES = [
  { key: 'tideTable', icon: 'restaurant-outline' },
  { key: 'skyye', icon: 'wine-outline' },
  { key: 'vista', icon: 'sunny-outline' },
  { key: 'inRoomDining', icon: 'bed-outline' },
  { key: 'pool', icon: 'water-outline' },
  { key: 'diveShop', icon: 'boat-outline' },
  { key: 'pier', icon: 'navigate-outline' },
  { key: 'frontDesk', icon: 'call-outline' },
];

export default function HotelAmenitiesScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('hotelInfo.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.intro}>{t('hotelInfo.intro')}</Text>

        <View style={styles.wifiCard}>
          <View style={styles.wifiIconWrap}>
            <Ionicons name="wifi" size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.wifiTitle}>{t('hotelInfo.wifi.title')}</Text>
            <Text style={styles.wifiNetwork}>{t('hotelInfo.wifi.network')}: OceanOasis_Guest</Text>
            <Text style={styles.wifiSub}>{t('hotelInfo.wifi.passwordNote')}</Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SectionHeader title={t('hotelInfo.hoursTitle')} />
          {AMENITIES.map((a) => (
            <Card key={a.key} style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name={a.icon} size={20} color={colors.deepOcean} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{t(`hotelInfo.amenities.${a.key}.name`)}</Text>
                <Text style={styles.hours}>{t(`hotelInfo.amenities.${a.key}.hours`)}</Text>
                <Text style={styles.desc}>{t(`hotelInfo.amenities.${a.key}.desc`)}</Text>
              </View>
            </Card>
          ))}
        </View>

        <Text style={styles.footnote}>{t('hotelInfo.footnote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, color: colors.slate, lineHeight: 19 },
  wifiCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md,
    backgroundColor: colors.deepOcean, borderRadius: radius.lg, padding: spacing.md, ...shadow.soft,
  },
  wifiIconWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  wifiTitle: { color: colors.white, fontWeight: '700', fontSize: 14, fontFamily: font.display },
  wifiNetwork: { color: colors.sandLight, fontSize: 12.5, marginTop: 3, fontWeight: '600' },
  wifiSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 3 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.sandLight,
    alignItems: 'center', justifyContent: 'center', ...shadow.card,
  },
  name: { fontSize: 14, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  hours: { fontSize: 12, color: colors.turquoiseDark, fontWeight: '700', marginTop: 2 },
  desc: { fontSize: 12, color: colors.slate, marginTop: 3, lineHeight: 16 },
  footnote: { fontSize: 11.5, color: colors.slate, marginTop: spacing.md, lineHeight: 16 },
});
