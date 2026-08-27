import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, Badge, Field, Pill } from '../../components/UI';
import GlassSurface from '../../components/GlassSurface';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { TARGET_AUDIENCES } from '../../data/mockData';

const STATUS_TONE = { DRAFT: 'neutral', SCHEDULED: 'warning', PUBLISHED: 'success', ARCHIVED: 'neutral' };

export default function ManagementPromotionsScreen({ navigation }) {
  const { t } = useTranslation();
  const { promotions, createPromotion, publishPromotion, archivePromotion } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discount: '10%', startDate: '2026-08-20', endDate: '2026-09-20', targetAudience: 'All guests' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const closeModal = () => {
    setFormError('');
    setShowNew(false);
  };

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setFormError('');
    const result = await createPromotion({ ...form, validity: `${form.startDate} – ${form.endDate}`, terms: 'See front desk for full terms.', image: 'gift' });
    setSaving(false);
    if (!result?.ok) {
      setFormError(result?.error || t('management.promotions.createError'));
      return;
    }
    setForm({ title: '', description: '', discount: '10%', startDate: '2026-08-20', endDate: '2026-09-20', targetAudience: 'All guests' });
    setShowNew(false);
  };

  const handlePublish = async (id) => {
    const result = await publishPromotion(id);
    if (!result?.ok) Alert.alert(t('common.somethingWrong'), result?.error || t('common.pleaseTryAgain'));
  };

  const handleArchive = async (id) => {
    const result = await archivePromotion(id);
    if (!result?.ok) Alert.alert(t('common.somethingWrong'), result?.error || t('common.pleaseTryAgain'));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('management.promotions.title')} onBack={() => navigation.goBack()} right={
        <TouchableOpacity onPress={() => setShowNew(true)}><Ionicons name="add-circle" size={26} color={colors.deepOcean} /></TouchableOpacity>
      } />
      <FlatList
        data={promotions}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => {
          const conversion = item.clicks ? Math.round((item.bookings / item.clicks) * 100) : 0;
          return (
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Badge label={item.status} tone={STATUS_TONE[item.status]} />
              </View>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.meta}>{item.validity} · {item.targetAudience}</Text>
              <View style={styles.statsRow}>
                <MiniStat label={t('management.promotions.stats.impressions')} value={item.impressions} />
                <MiniStat label={t('management.promotions.stats.clicks')} value={item.clicks} />
                <MiniStat label={t('management.promotions.stats.bookings')} value={item.bookings} />
                <MiniStat label={t('management.promotions.stats.revenue')} value={`$${item.revenue}`} />
              </View>
              <Text style={styles.conversion}>{t('management.promotions.conversionLine', { conversion, redemptions: item.redemptions })}</Text>
              {(item.status === 'DRAFT' || item.status === 'SCHEDULED') && (
                <Button label={t('staff.activities.publish')} onPress={() => handlePublish(item.id)} style={{ marginTop: spacing.sm }} />
              )}
              {item.status === 'PUBLISHED' && (
                <Button label={t('management.promotions.archive')} variant="outline" onPress={() => handleArchive(item.id)} style={{ marginTop: spacing.sm }} />
              )}
            </Card>
          );
        }}
      />

      <Modal visible={showNew} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <GlassSurface style={styles.modalPanel} borderRadius={0} intensity={38} tint="light">
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('management.promotions.newPromotion')}</Text>
                <TouchableOpacity onPress={closeModal}><Ionicons name="close" size={22} color={colors.slate} /></TouchableOpacity>
              </View>
              <Field label={t('management.promotions.titleLabel')} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
              <Field label={t('management.promotions.descriptionLabel')} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
              <Field label={t('management.promotions.discountLabel')} value={form.discount} onChangeText={(v) => setForm({ ...form, discount: v })} />
              <Text style={styles.fieldLabel}>{t('management.promotions.targetAudienceLabel')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md }}>
                {TARGET_AUDIENCES.map((a) => (
                  <Pill key={a} label={a} selected={form.targetAudience === a} onPress={() => setForm({ ...form, targetAudience: a })} />
                ))}
              </View>
              <Field label={t('management.promotions.startDateLabel')} value={form.startDate} onChangeText={(v) => setForm({ ...form, startDate: v })} />
              <Field label={t('management.promotions.endDateLabel')} value={form.endDate} onChangeText={(v) => setForm({ ...form, endDate: v })} />
              {formError ? <Text style={styles.formError}>{formError}</Text> : null}
              <Button label={t('staff.events.saveAsDraft')} onPress={submit} loading={saving} style={{ marginTop: spacing.sm, marginBottom: spacing.lg }} />
            </ScrollView>
          </GlassSurface>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MiniStat({ label, value }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', color: colors.charcoal, flex: 1 },
  desc: { fontSize: 12.5, color: colors.slate, marginTop: 4 },
  meta: { fontSize: 11, color: colors.slate, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  miniStat: { flex: 1, backgroundColor: colors.sandLight, borderRadius: radius.sm, padding: 6, alignItems: 'center' },
  miniStatLabel: { fontSize: 9, fontWeight: '700', color: colors.slate, textTransform: 'uppercase' },
  miniStatValue: { fontSize: 13, fontWeight: '700', color: colors.deepOcean, marginTop: 2 },
  conversion: { fontSize: 11.5, color: colors.slate, marginTop: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginBottom: 8 },
  formError: { color: colors.error, fontSize: 12.5, marginBottom: spacing.sm },
});
