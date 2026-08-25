import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Easing } from 'react-native-reanimated';

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
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(!!value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => setReduced(!!value));
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  return reduced;
}
