import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { PROPERTY_INFO } from '../../data/mockData';

function Option({ icon, title, subtitle, onPress, tone = 'normal' }) {
  return (
    <TouchableOpacity style={[styles.option, tone === 'emergency' && styles.optionEmergency]} onPress={onPress}>
      <View style={[styles.optionIcon, tone === 'emergency' && styles.optionIconEmergency]}>
        <Ionicons name={icon} size={20} color={colors.white} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, tone === 'emergency' && { color: colors.error }]}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.slate} />
    </TouchableOpacity>
  );
}

export default function ContactReceptionScreen({ navigation }) {
  const call = () => Linking.openURL(`tel:${PROPERTY_INFO.phone.replace(/[^\d+]/g, '')}`).catch(() => Alert.alert('Unable to place call in this preview.'));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Contact Reception" onBack={() => navigation.goBack()} />
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={styles.intro}>Reach our team directly for anything you need during your stay.</Text>

        <Option icon="call" title="Call Reception" subtitle="Speak with our front desk now" onPress={call} />
        <Option icon="chatbubble-ellipses" title="Message Reception" subtitle="Send a message, we'll reply shortly" onPress={() => navigation.navigate('NewRequest', { category: 'Concierge' })} />
        <Option icon="sparkles" title="Request Concierge" subtitle="Recommendations, reservations & more" onPress={() => navigation.navigate('Concierge')} />

        <Text style={styles.sectionLabel}>Urgent</Text>
        <Option
          icon="alert-circle"
          title="Emergency / Important Assistance"
          subtitle="For urgent safety or medical concerns"
          onPress={() =>
            Alert.alert('Emergency Assistance', 'This will connect you directly to hotel security and front desk staff.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call Now', onPress: call },
            ])
          }
          tone="emergency"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13.5, color: colors.slate, marginBottom: spacing.sm, lineHeight: 19 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.slate, marginTop: spacing.md, letterSpacing: 0.5 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  optionEmergency: { borderColor: '#EAC3B8', backgroundColor: '#FBF0EC' },
  optionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
  optionIconEmergency: { backgroundColor: colors.error },
  optionTitle: { fontSize: 14.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  optionSubtitle: { fontSize: 12, color: colors.slate, marginTop: 2 },
});
