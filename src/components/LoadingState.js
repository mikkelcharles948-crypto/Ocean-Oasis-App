import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors, radius, spacing } from '../theme/theme';
import { useReducedMotion } from '../theme/motion';

// A single pulsing placeholder block. Static (no animation) under Reduce
// Motion so it reads as a plain neutral panel rather than a moving one.
export function SkeletonBlock({ style }) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 0.5;
      return;
    }
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.5, { duration: 700 })),
      -1,
      true
    );
  }, [reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.block, animatedStyle, style]} />;
}

// Replaces a bare ActivityIndicator spinner with a shape that hints at the
// content about to load, so the premium visual language doesn't drop out
// during a fetch. `variant="cards"` approximates a couple of editorial
// image cards; `variant="list"` approximates a few list rows.
//
//   {loading ? <LoadingState variant="cards" /> : <ActualContent />}
export default function LoadingState({ variant = 'cards', count = 2 }) {
  if (variant === 'list') {
    return (
      <View style={styles.wrap}>
        {Array.from({ length: count }).map((_, i) => (
          <View key={i} style={styles.listRow}>
            <SkeletonBlock style={styles.listThumb} />
            <View style={{ flex: 1, gap: 8 }}>
              <SkeletonBlock style={styles.listLineWide} />
              <SkeletonBlock style={styles.listLineNarrow} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ gap: 10 }}>
          <SkeletonBlock style={styles.cardImage} />
          <SkeletonBlock style={styles.cardLineWide} />
          <SkeletonBlock style={styles.cardLineNarrow} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.sandLight, borderRadius: radius.sm },
  wrap: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  cardImage: { height: 200, borderRadius: radius.lg },
  cardLineWide: { height: 16, width: '70%', borderRadius: radius.sm },
  cardLineNarrow: { height: 12, width: '45%', borderRadius: radius.sm },
  listRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  listThumb: { width: 64, height: 64, borderRadius: radius.md },
  listLineWide: { height: 14, width: '80%', borderRadius: radius.sm },
  listLineNarrow: { height: 12, width: '50%', borderRadius: radius.sm },
});
