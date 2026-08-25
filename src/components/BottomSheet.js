import React, { useEffect } from 'react';
import { Modal, View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { colors, radius, spacing, shadow } from '../theme/theme';
import { duration, easing, useReducedMotion } from '../theme/motion';

// A slide-up sheet for the "seamless" flows the brief asks for (a room's
// full photo set, a filter panel, a confirmation step) — an alternative to
// pushing a whole new screen for something transient. No drag-to-dismiss
// gesture (this app has no react-native-gesture-handler dependency yet);
// dismiss is tap-backdrop or the caller's own close control.
//
//   <BottomSheet visible={open} onClose={() => setOpen(false)}>{content}</BottomSheet>
export default function BottomSheet({ visible, onClose, children, style }) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(400);
  const backdropOpacity = useSharedValue(0);
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      const timingCfg = reducedMotion ? { duration: 0 } : { duration: duration.base, easing: easing.decelerate };
      translateY.value = withTiming(0, timingCfg);
      backdropOpacity.value = withTiming(1, timingCfg);
    } else if (mounted) {
      const timingCfg = reducedMotion ? { duration: 0 } : { duration: duration.fast, easing: easing.accelerate };
      translateY.value = withTiming(400, timingCfg, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
      backdropOpacity.value = withTiming(0, timingCfg);
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }, sheetStyle, style]}>
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(9,46,55,0.55)' },
  sheet: {
    backgroundColor: colors.ivory,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...shadow.float,
  },
  handle: {
    alignSelf: 'center', width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, marginBottom: spacing.md,
  },
});
