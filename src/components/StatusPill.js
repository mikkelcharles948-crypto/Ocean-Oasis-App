import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, font } from '../theme/theme';

// The elegant status-ladder: a horizontal row of steps, each with
// everything up to and including the current step filled and everything
// after it left as a quiet outline.
//
//   <StatusPill steps={['Received', 'Assigned', 'In Progress', 'Completed']} activeIndex={1} />
//
// Rebuilt after the connector line (previously flex:1 with a negative
// horizontal margin, between fixed-width steps) was found to visibly bleed
// into a neighboring dot/label on narrower screens or longer labels — this
// component is shared across 4 screens with very different step counts and
// label lengths (a 2-3 word request status vs. a loyalty tier name), so a
// fixed per-step width was never going to fit all of them. Every step is
// now an equal flexible column (always exactly fills the row, never
// overflows or compresses unpredictably), and the connector is a single
// absolutely-positioned line drawn once behind the dots, spanning exactly
// from the first dot's center to the last — not a real per-segment element
// with margins that can escape its bounds.
export default function StatusPill({ steps, activeIndex, labels }) {
  const stepCount = steps.length;
  const halfStepPercent = 50 / stepCount;
  const progressFraction = stepCount > 1 ? Math.max(0, Math.min(1, activeIndex / (stepCount - 1))) : 0;

  return (
    <View style={styles.row}>
      <View style={[styles.connectorTrack, { left: `${halfStepPercent}%`, right: `${halfStepPercent}%` }]} pointerEvents="none">
        <View style={[styles.connectorFill, { width: `${progressFraction * 100}%` }]} />
      </View>
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        const label = labels?.[step] ?? step;
        return (
          <View key={step} style={styles.step}>
            <View style={[styles.dot, done && styles.dotDone, current && styles.dotCurrent]}>
              {done ? <Ionicons name="checkmark" size={11} color={colors.white} /> : null}
            </View>
            <Text style={[styles.label, (done || current) && styles.labelActive]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', position: 'relative' },
  step: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  connectorTrack: { position: 'absolute', top: 9, height: 2, backgroundColor: colors.border },
  connectorFill: { height: 2, backgroundColor: colors.turquoise },
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
