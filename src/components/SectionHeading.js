import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/theme';

// The editorial section heading used to open a Home/Explore-style content
// section: a small tracked-out eyebrow label above a real heading, with an
// optional "See all"-style action. More editorial than UI.js's compact
// SectionHeader (which stays as-is for dense list/dashboard screens).
//
//   <SectionHeading eyebrow="Today at the resort" title="What's happening" actionLabel="See all" onAction={...} />
export default function SectionHeading({ eyebrow, title, subtitle, actionLabel, onAction, light = false }) {
  const textColor = light ? colors.ivory : colors.deepOcean;
  const mutedColor = light ? 'rgba(251,248,242,0.72)' : colors.slate;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={[typography.label, styles.eyebrow, { color: light ? colors.goldSoft : colors.goldDark }]}>{eyebrow}</Text> : null}
        <Text style={[typography.heading, { color: textColor }]}>{title}</Text>
        {subtitle ? <Text style={[typography.body, styles.subtitle, { color: mutedColor }]}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <TouchableOpacity style={styles.action} onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.actionLabel, { color: light ? colors.ivory : colors.turquoiseDark }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={15} color={light ? colors.ivory : colors.turquoiseDark} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  eyebrow: { marginBottom: 6 },
  subtitle: { marginTop: 4 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 3, marginLeft: spacing.sm },
  actionLabel: { fontSize: 13, fontWeight: '700' },
});
