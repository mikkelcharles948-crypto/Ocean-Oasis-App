import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Easing } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const REDUCE_MOTION_OVERRIDE_KEY = 'oo_reduce_motion_override';
const reducedMotionListeners = new Set();

// AccessibilityScreen's in-app "Reduce Motion" toggle calls this — it's a
// separate, explicit in-app preference layered on top of (never replacing)
// the OS-level setting useReducedMotion() already reads below, since a
// guest may want animations off in this app without changing their whole
// device's system setting.
export async function setReducedMotionOverride(value) {
  await AsyncStorage.setItem(REDUCE_MOTION_OVERRIDE_KEY, value ? 'true' : 'false');
  reducedMotionListeners.forEach((listener) => listener(value));
}

// Duration/easing tokens for the redesign's restrained motion language —
// quick, physical, never bouncy. Pair with AnimatedPressable / Reanimated
// directly (`withTiming(1, { duration: motion.duration.fast, easing: motion.easing.standard })`).
export const duration = {
  instant: 100,
  fast: 180,
  base: 260,
  slow: 420,
  reveal: 600,
};

export const easing = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
};

// The Home entrance sequence the brief calls for: hero -> logo/title ->
// headline -> CTA, each offset a little later than the last. Expressed as
// delays (ms) so a screen can do `delay(motion.entrance.title, withTiming(...))`.
export const entrance = {
  hero: 0,
  title: 200,
  headline: 400,
  cta: 650,
};

// Respects the OS "Reduce Motion" setting. Screens/components that build
// bespoke Reanimated sequences (rather than using AnimatedPressable, which
// already checks this itself) should read this and skip straight to the
// end state instead of animating.
export function useReducedMotion() {
  const [osReduced, setOsReduced] = useState(false);
  const [appOverride, setAppOverride] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setOsReduced(!!value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => setOsReduced(!!value));

    AsyncStorage.getItem(REDUCE_MOTION_OVERRIDE_KEY).then((value) => {
      if (mounted) setAppOverride(value === 'true');
    });
    const listener = (value) => mounted && setAppOverride(!!value);
    reducedMotionListeners.add(listener);

    return () => {
      mounted = false;
      sub?.remove?.();
      reducedMotionListeners.delete(listener);
    };
  }, []);

  return osReduced || appOverride;
}
