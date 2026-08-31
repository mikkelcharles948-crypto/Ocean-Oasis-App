import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { Text } from '../../components/AppText';
import { TextInput } from '../../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, Pill } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { DESTINATIONS, DINING_VENUES } from '../../data/mockData';
import { resolvePhotoUrl } from '../../utils/photoOverrides';

const CATEGORIES = ['All', 'Destinations', 'Dining', 'Activities', 'Events', 'Promotions'];

// Every photo slot in the app, from two different kinds of source:
// destinations/dining venues (bundled mockData, no DB row of their own —
// edits go to photo_overrides) and activities/events/promotions (real DB
// rows already carrying their own image_url — edits update that column
// directly). Presented as one flat, filterable list either way; only the
// save path differs, handled in handleSave below.
function useAllPhotoSlots() {
  const { photoOverrides, activities, events, promotions } = useApp();

  return useMemo(() => {
    const destinationSlots = DESTINATIONS.map((d) => ({
      slotKey: `destination:${d.id}`,
      kind: 'override',
      category: 'Destinations',
      label: d.title,
      imageUrl: resolvePhotoUrl(photoOverrides, `destination:${d.id}`, d.imageUrl),
    }));
    const diningSlots = DINING_VENUES.map((v) => ({
      slotKey: `dining:${v.id}`,
      kind: 'override',
      category: 'Dining',
      label: v.name,
      imageUrl: resolvePhotoUrl(photoOverrides, `dining:${v.id}`, v.imageUrl),
    }));
    const activitySlots = activities.map((a) => ({
      slotKey: `activity:${a.id}`,
      kind: 'activity',
      id: a.id,
      category: 'Activities',
      label: a.name,
      imageUrl: a.imageUrl,
    }));
    const eventSlots = events.map((e) => ({
      slotKey: `event:${e.id}`,
      kind: 'event',
      id: e.id,
      category: 'Events',
      label: e.title,
      imageUrl: e.imageUrl,
    }));
    const promotionSlots = promotions.map((p) => ({
      slotKey: `promotion:${p.id}`,
      kind: 'promotion',
      id: p.id,
      category: 'Promotions',
      label: p.title,
      imageUrl: p.imageUrl,
    }));
    return [...destinationSlots, ...diningSlots, ...activitySlots, ...eventSlots, ...promotionSlots];
  }, [photoOverrides, activities, events, promotions]);
}

export default function PhotoLibraryScreen({ navigation }) {
  const { t } = useTranslation();
  const { updateActivityImage, updateEventImage, updatePromotionImage, updatePhotoOverride } = useApp();
  const allSlots = useAllPhotoSlots();
  const [category, setCategory] = useState('All');
  const [editing, setEditing] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = category === 'All' ? allSlots : allSlots.filter((s) => s.category === category);

  const openEditor = (slot) => {
    setEditing(slot);
    setUrlInput(slot.imageUrl || '');
    setError('');
  };

  const handleSave = async () => {
    if (!urlInput.trim() || !/^https?:\/\//.test(urlInput.trim())) {
      setError(t('management.photoLibrary.invalidUrl'));
      return;
    }
    setSaving(true);
    setError('');
    const url = urlInput.trim();
    let result;
    if (editing.kind === 'activity') result = await updateActivityImage(editing.id, url);
    else if (editing.kind === 'event') result = await updateEventImage(editing.id, url);
    else if (editing.kind === 'promotion') result = await updatePromotionImage(editing.id, url);
    else result = await updatePhotoOverride(editing.slotKey, editing.category, editing.label, url);
    setSaving(false);
    if (!result?.ok) {
      setError(result?.error || t('common.pleaseTryAgain'));
      return;
    }
    setEditing(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('management.photoLibrary.title')} onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>{t('management.photoLibrary.subtitle')}</Text>
      <View style={styles.pillRow}>
        {CATEGORIES.map((c) => (
          <Pill key={c} label={c === 'All' ? t('explore.all') : t(`management.photoLibrary.categories.${c}`)} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(s) => s.slotKey}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openEditor(item)} activeOpacity={0.8}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbEmpty]}>
                <Ionicons name="image-outline" size={20} color={colors.turquoiseDark} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.meta}>{t(`management.photoLibrary.categories.${item.category}`)}</Text>
            </View>
            <Ionicons name="pencil-outline" size={18} color={colors.slate} />
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!editing} animationType="slide" transparent onRequestClose={() => setEditing(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{editing?.label}</Text>
              <TouchableOpacity onPress={() => setEditing(null)} accessibilityRole="button" accessibilityLabel={t('common.close')}>
                <Ionicons name="close" size={24} color={colors.slate} />
              </TouchableOpacity>
            </View>
            {editing?.imageUrl ? (
              <Image source={{ uri: editing.imageUrl }} style={styles.preview} contentFit="cover" />
            ) : (
              <View style={[styles.preview, styles.thumbEmpty]}>
                <Ionicons name="image-outline" size={32} color={colors.turquoiseDark} />
              </View>
            )}
            <Text style={styles.fieldLabel}>{t('management.photoLibrary.urlLabel')}</Text>
            <TextInput
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://…"
              placeholderTextColor={colors.slate}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={styles.input}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label={t('common.done')} onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 12.5, color: colors.slate, paddingHorizontal: spacing.lg, marginTop: 2 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  thumb: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.sandLight },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13.5, fontWeight: '700', color: colors.charcoal },
  meta: { fontSize: 11, color: colors.slate, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { backgroundColor: colors.ivory, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.charcoal },
  preview: { width: '100%', height: 160, borderRadius: radius.lg, backgroundColor: colors.sandLight, marginBottom: spacing.md },
  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: colors.charcoal, marginBottom: 6 },
  input: {
    backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 13.5, color: colors.charcoal,
  },
  error: { color: colors.error, fontSize: 12.5, marginTop: spacing.sm },
});
