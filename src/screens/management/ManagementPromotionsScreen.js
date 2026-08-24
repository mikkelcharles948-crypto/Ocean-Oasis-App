import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { Card, ScreenHeader, Badge, Field } from '../../components/UI';
import GlassSurface from '../../components/GlassSurface';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { TARGET_AUDIENCES } from '../../data/mockData';

const STATUS_TONE = { DRAFT: 'neutral', SCHEDULED: 'warning', PUBLISHED: 'success', ARCHIVED: 'neutral' };

export default function ManagementPromotionsScreen({ navigation }) {
  const { promotions, createPromotion, publishPromotion, archivePromotion } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discount: '10%', startDate: '2026-08-20', endDate: '2026-09-20', targetAudience: 'All guests' });

  const submit = () => {
    if (!form.title.trim()) return;
    createPromotion({ ...form, validity: `${form.startDate} – ${form.endDate}`, terms: 'See front desk for full terms.', image: 'gift' });
    setForm({ title: '', description: '', discount: '10%', startDate: '2026-08-20', endDate: '2026-09-20', targetAudience: 'All guests' });
    setShowNew(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }} edges={['top']}>
      <ScreenHeader title="Promotions" onBack={() => navigation.goBack()} right={
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
                <MiniStat label="Impressions" value={item.impressions} />
                <MiniStat label="Clicks" value={item.clicks} />
                <MiniStat label="Bookings" value={item.bookings} />
                <MiniStat label="Revenue" value={`$${item.revenue}`} />
              </View>
              <Text style={styles.conversion}>Conversion: {conversion}% · Redemptions: {item.redemptions}</Text>
              {(item.status === 'DRAFT' || item.status === 'SCHEDULED') && (
                <Button label="Publish to Guest App" onPress={() => publishPromotion(item.id)} style={{ marginTop: spacing.sm }} />
              )}
              {item.status === 'PUBLISHED' && (
                <Button label="Archive" variant="outline" onPress={() => archivePromotion(item.id)} style={{ marginTop: spacing.sm }} />
              )}
            </Card>
          );
        }}
      />

      <Modal visible={showNew} transparent animationType="slide" onRequestClose={() => setShowNew(false)}>
        <View style={styles.modalBackdrop}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <GlassSurface style={styles.modalPanel} borderRadius={0} intensity={38} tint="light">
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Promotion</Text>
                <TouchableOpacity onPress={() => setShowNew(false)}><Ionicons name="close" size={22} color={colors.slate} /></TouchableOpacity>
              </View>
              <Field label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
              <Field label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
              <Field label="Discount" value={form.discount} onChangeText={(v) => setForm({ ...form, discount: v })} />
              <Text style={styles.fieldLabel}>Target Audience</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
                {TARGET_AUDIENCES.map((a) => (
                  <TouchableOpacity key={a} onPress={() => setForm({ ...form, targetAudience: a })} style={[styles.chip, form.targetAudience === a && styles.chipActive]}>
                    <Text style={[styles.chipText, form.targetAudience === a && styles.chipTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Field label="Start Date (YYYY-MM-DD)" value={form.startDate} onChangeText={(v) => setForm({ ...form, startDate: v })} />
              <Field label="End Date (YYYY-MM-DD)" value={form.endDate} onChangeText={(v) => setForm({ ...form, endDate: v })} />
              <Button label="Save as Draft" onPress={submit} style={{ marginTop: spacing.sm, marginBottom: spacing.lg }} />
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
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: colors.sandLight },
  chipActive: { backgroundColor: colors.deepOcean },
  chipText: { fontSize: 11.5, fontWeight: '600', color: colors.charcoal },
  chipTextActive: { color: colors.white },
});
