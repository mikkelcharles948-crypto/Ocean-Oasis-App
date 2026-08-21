import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader, Card, ErrorState } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';
import { REQUEST_STATUS_STEPS } from '../../data/mockData';

export default function RequestDetailScreen({ route, navigation }) {
  const { serviceRequests } = useApp();
  const request = serviceRequests.find((r) => r.id === route.params?.requestId);

  if (!request) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title="Request" onBack={() => navigation.goBack()} />
        <ErrorState title="Request not found" onRetry={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const currentIndex = REQUEST_STATUS_STEPS.indexOf(request.status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Request Details" onBack={() => navigation.goBack()} />
      <View style={{ padding: spacing.lg }}>
        <Card>
          <Text style={styles.category}>{request.category}</Text>
          <Text style={styles.desc}>{request.description}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={colors.slate} />
            <Text style={styles.metaText}>Preferred: {request.preferredTime}</Text>
          </View>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionTitle}>Status</Text>
          {REQUEST_STATUS_STEPS.map((step, i) => (
            <View key={step} style={styles.statusRow}>
              <View style={[styles.statusDot, i <= currentIndex && styles.statusDotActive]}>
                {i <= currentIndex && <Ionicons name="checkmark" size={12} color={colors.white} />}
              </View>
              <Text style={[styles.statusLabel, i <= currentIndex && styles.statusLabelActive]}>{step}</Text>
            </View>
          ))}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  category: { fontSize: 18, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  desc: { fontSize: 14, color: colors.slate, marginTop: 6, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  metaText: { fontSize: 12, color: colors.slate },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginBottom: spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  statusDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  statusDotActive: { backgroundColor: colors.success },
  statusLabel: { fontSize: 13.5, color: colors.slate },
  statusLabelActive: { color: colors.charcoal, fontWeight: '700' },
});
