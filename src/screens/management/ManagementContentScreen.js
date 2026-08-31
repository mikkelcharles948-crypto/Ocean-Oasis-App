import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, Badge, Field, EmptyState, timeAgo } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { CONTENT_STATUSES } from '../../data/mockData';

const STATUS_TONE = { DRAFT: 'neutral', SCHEDULED: 'warning', PUBLISHED: 'success', ARCHIVED: 'neutral' };

export default function ManagementContentScreen({ navigation }) {
  const { t } = useTranslation();
  const { contentItems, setContentStatus, createContentItem } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSetStatus = async (id, status) => {
    const result = await setContentStatus(id, status);
    if (!result?.ok) Alert.alert(t('common.somethingWrong'), result?.error || t('common.pleaseTryAgain'));
  };

  const resetForm = () => {
    setType('');
    setTitle('');
    setDescription('');
    setError('');
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!type.trim() || !title.trim()) {
      setError(t('management.content.form.required'));
      return;
    }
    setSaving(true);
    setError('');
    const result = await createContentItem(type.trim(), title.trim(), description.trim());
    setSaving(false);
    if (!result?.ok) {
      setError(result?.error || t('common.pleaseTryAgain'));
      return;
    }
    resetForm();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader
        title={t('management.content.title')}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setShowForm(true)} accessibilityRole="button" accessibilityLabel={t('management.content.newItem')}>
            <Ionicons name="add-circle" size={26} color={colors.deepOcean} />
          </TouchableOpacity>
        }
      />
      <FlatList
        data={contentItems}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title={t('management.content.empty')} subtitle={t('management.content.emptySub')} />}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Badge label={item.type} tone="neutral" />
              <Badge label={item.status} tone={STATUS_TONE[item.status]} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            <Text style={styles.meta}>{t('management.content.updatedLabel', { time: timeAgo(item.updatedAt) })}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
              {CONTENT_STATUSES.map((s) => (
                <TouchableOpacity key={s} onPress={() => handleSetStatus(item.id, s)} style={[styles.chip, item.status === s && styles.chipActive]}>
                  <Text style={[styles.chipText, item.status === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}
      />

      <Modal visible={showForm} animationType="slide" transparent onRequestClose={resetForm}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('management.content.newItem')}</Text>
              <TouchableOpacity onPress={resetForm} accessibilityRole="button" accessibilityLabel={t('common.close')}>
                <Ionicons name="close" size={24} color={colors.slate} />
              </TouchableOpacity>
            </View>
            <Field label={t('management.content.form.type')} value={type} onChangeText={setType} placeholder={t('management.content.form.typePlaceholder')} />
            <Field label={t('management.content.form.itemTitle')} value={title} onChangeText={setTitle} placeholder={t('management.content.form.itemTitlePlaceholder')} />
            <Field label={t('management.content.form.description')} value={description} onChangeText={setDescription} placeholder={t('management.content.form.descriptionPlaceholder')} multiline />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label={t('management.content.form.create')} onPress={handleCreate} loading={saving} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', color: colors.charcoal },
  description: { fontSize: 12.5, color: colors.slate, marginTop: 4, lineHeight: 18 },
  meta: { fontSize: 11.5, color: colors.slate, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.sandLight },
  chipActive: { backgroundColor: colors.deepOcean },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.charcoal },
  chipTextActive: { color: colors.white },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { backgroundColor: colors.ivory, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal },
  error: { color: colors.error, fontSize: 12.5, marginTop: 4 },
});
