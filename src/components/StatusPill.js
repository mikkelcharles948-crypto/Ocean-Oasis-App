import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, font } from '../theme/theme';

// The elegant status-ladder the brief asks for in place of a flat
// "In Progress" badge: a horizontal row of steps, each Received /
// In Progress / Completed, with everything up to and including the
// current step filled and everything after it left as a quiet outline.
// Not yet wired into StaffRequestsScreen/MyStayScreen — those still use
// UI.js's Badge — this is the new component for the Phase 5+ rework of
// the service-request status display.
//
//   <StatusPill steps={['Received', 'Assigned', 'In Progress', 'Completed']} activeIndex={1} />
export default function StatusPill({ steps, activeIndex, labels }) {
  return (
    <View style={styles.row}>
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        const label = labels?.[step] ?? step;
        return (
          <React.Fragment key={step}>
            {i > 0 ? <View style={[styles.connector, (done || current) && styles.connectorActive]} /> : null}
            <View style={styles.step}>
              <View style={[styles.dot, done && styles.dotDone, current && styles.dotCurrent]}>
                {done ? <Ionicons name="checkmark" size={11} color={colors.white} /> : null}
              </View>
              <Text
                style={[styles.label, (done || current) && styles.labelActive]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  step: { alignItems: 'center', width: 68 },
  connector: { height: 2, flex: 1, backgroundColor: colors.border, marginTop: 9, marginHorizontal: -8 },
  connectorActive: { backgroundColor: colors.turquoise },
  dot: {
    width: 20, height: 20, borderRadius: radius.pill,
    borderWidth: 2, borderColor: colors.border, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.turquoise, borderColor: colors.turquoise },
  dotCurrent: { borderColor: colors.deepOcean, backgroundColor: colors.deepOcean },
  label: { fontSize: 10.5, fontFamily: font.body, color: colors.slate, marginTop: 6, textAlign: 'center' },
  labelActive: { color: colors.deepOcean, fontWeight: '700' },
});
