import React, { forwardRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useAccessibilityPrefs, TEXT_SIZE_SCALE } from '../context/AccessibilityContext';
import { colors } from '../theme/theme';

// A colour is only remapped here if it's one of the app's known
// low-contrast secondary/muted tones and is used on light backgrounds
// throughout the app (verified — never over a dark photo overlay, which
// use explicit white/rgba values instead, not this token) — swapping it
// for the app's existing near-black text colour is a safe, real contrast
// boost that doesn't risk making text invisible against a dark background
// somewhere this component can't see.
const HIGH_CONTRAST_REMAP = {
  [colors.slate]: colors.charcoal,
  [colors.gold]: colors.goldDark,
};

// Drop-in replacement for react-native's Text — every screen's own style
// (StyleSheet.create objects, inline styles, arrays) is preserved and
// applied first; this only adjusts fontSize/lineHeight/fontWeight/color on
// top when the guest has an accessibility preference on. See
// AccessibilityContext.js for why this has to happen here rather than in
// each screen's own styles.
const AppText = forwardRef(function AppText({ style, ...props }, ref) {
  const { textSize, boldText, highContrast } = useAccessibilityPrefs();
  const scale = TEXT_SIZE_SCALE[textSize] || 1;

  if (scale === 1 && !boldText && !highContrast) {
    return <Text ref={ref} style={style} {...props} />;
  }

  const flat = StyleSheet.flatten(style) || {};
  const patch = {};
  if (scale !== 1) {
    if (flat.fontSize) patch.fontSize = flat.fontSize * scale;
    if (flat.lineHeight) patch.lineHeight = flat.lineHeight * scale;
  }
  if (boldText) {
    const currentWeight = parseInt(flat.fontWeight, 10);
    if (!currentWeight || currentWeight < 700) patch.fontWeight = '700';
  }
  if (highContrast && flat.color && HIGH_CONTRAST_REMAP[flat.color]) {
    patch.color = HIGH_CONTRAST_REMAP[flat.color];
  }

  return <Text ref={ref} style={[style, patch]} {...props} />;
});

export default AppText;
export { AppText as Text };
