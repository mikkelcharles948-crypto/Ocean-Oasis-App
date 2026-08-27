import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader } from '../../components/UI';
import AnimatedPressable from '../../components/AnimatedPressable';
import { colors, spacing, radius, font, typography } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { PROPERTY_INFO, ROLE_LABELS } from '../../data/mockData';

export default function ManagementSettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { opsSession, opsSignOut } = useApp();
  const roleLabel = t(`common.roleLabels.${opsSession?.role}`, { defaultValue: ROLE_LABELS[opsSession?.role] });

  const handleSwitch = () => {
    Alert.alert(t('staff.profile.switchConfirmTitle'), t('management.settings.switchConfirmMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('staff.profile.switchConfirmBtn'), onPress: opsSignOut },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('management.settings.title')} onBack={() => navigation.goBack()} />
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Card>
          <Text style={styles.cardTitle}>{t('management.settings.signedInAs')}</Text>
          <Text style={styles.name}>{opsSession?.name}</Text>
          <Text style={styles.meta}>{roleLabel} · {opsSession?.department}</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>{t('management.settings.propertyDetails')}</Text>
          <Row label={t('management.settings.property')} value={PROPERTY_INFO.fullName} />
          <Row label={t('management.settings.address')} value={PROPERTY_INFO.address} />
          <Row label={t('management.settings.phone')} value={PROPERTY_INFO.phone} />
          <Row label={t('management.settings.email')} value={PROPERTY_INFO.email} />
          <Row label={t('management.settings.rooms')} value={String(PROPERTY_INFO.roomCount)} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>{t('management.settings.multiPropertyTitle')}</Text>
          <Text style={styles.note}>
            {t('management.settings.multiPropertyNote')}
          </Text>
        </Card>

        <AnimatedPressable
          style={styles.switchBtn}
          onPress={handleSwitch}
          accessibilityRole="button"
          accessibilityLabel={t('staff.profile.switchExperience')}
        >
          <Ionicons name="swap-horizontal" size={20} color={colors.deepOcean} />
          <Text style={styles.switchText}>{t('staff.profile.switchExperience')}</Text>
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: { ...typography.label, color: colors.charcoal, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  meta: { fontSize: 12, color: colors.slate, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  rowLabel: { fontSize: 12.5, color: colors.slate },
  rowValue: { fontSize: 12.5, fontWeight: '600', color: colors.charcoal, flexShrink: 1, textAlign: 'right' },
  note: { fontSize: 12.5, color: colors.slate, lineHeight: 19 },
  switchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  switchText: { fontSize: 13.5, fontWeight: '700', color: colors.deepOcean },
});
