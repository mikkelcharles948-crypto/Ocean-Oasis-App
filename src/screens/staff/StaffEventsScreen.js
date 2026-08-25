import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { Card, ScreenHeader, Badge, Field } from '../../components/UI';
import GlassSurface from '../../components/GlassSurface';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const STATUS_TONE = { DRAFT: 'neutral', PUBLISHED: 'success' };

export default function StaffEventsScreen({ navigation }) {
  const { t } = useTranslation();
  const { events, createEvent, publishEvent } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Entertainment', date: '2026-08-20', time: '7:00 PM', location: 'Main Terrace', capacity: '50', description: '' });

  const submit = () => {
    if (!form.title.trim()) return;
    createEvent({ ...form, capacity: Number(form.capacity) || 20 });
    setForm({ title: '', category: 'Entertainment', date: '2026-08-20', time: '7:00 PM', location: 'Main Terrace', capacity: '50', description: '' });
    setShowNew(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title={t('staff.events.title')} onBack={() => navigation.goBack()} right={
        <TouchableOpacity onPress={() => setShowNew(true)}><Ionicons name="add-circle" size={26} color={colors.deepOcean} /></TouchableOpacity>
      } />
      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl }}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={[styles.title, { flexShrink: 1, marginRight: spacing.sm }]} numberOfLines={1}>{item.title}</Text>
              <Badge label={item.status} tone={STATUS_TONE[item.status]} />
            </View>
            <Text style={styles.meta}>{item.date} · {item.time} · {item.location}</Text>
            {item.status === 'DRAFT' && (
              <Button label={t('staff.activities.publish')} variant="outline" onPress={() => publishEvent(item.id)} style={{ marginTop: spacing.sm }} />
            )}
          </Card>
        )}
      />

      <Modal visible={showNew} transparent animationType="slide" onRequestClose={() => setShowNew(false)}>
        <View style={styles.modalBackdrop}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <GlassSurface style={styles.modalPanel} borderRadius={0} intensity={38} tint="light">
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('staff.events.newEvent')}</Text>
                <TouchableOpacity onPress={() => setShowNew(false)}><Ionicons name="close" size={22} color={colors.slate} /></TouchableOpacity>
              </View>
              <Field label={t('staff.events.titleLabel')} value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
              <Field label={t('staff.events.descriptionLabel')} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
              <Field label={t('staff.events.dateLabel')} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} />
              <Field label={t('staff.events.timeLabel')} value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} />
              <Field label={t('staff.events.locationLabel')} value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} />
              <Field label={t('staff.events.capacityLabel')} value={form.capacity} onChangeText={(v) => setForm({ ...form, capacity: v })} keyboardType="number-pad" />
              <Button label={t('staff.events.saveAsDraft')} onPress={submit} style={{ marginTop: spacing.sm, marginBottom: spacing.lg }} />
            </ScrollView>
          </GlassSurface>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', color: colors.charcoal },
  meta: { fontSize: 12.5, color: colors.slate, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,46,55,0.5)', justifyContent: 'flex-end' },
  modalPanel: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
});
