import React, { forwardRef } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useAccessibilityPrefs, TEXT_SIZE_SCALE } from '../context/AccessibilityContext';

// Drop-in replacement for react-native's TextInput — same reasoning as
// AppText.js. No colour remap here (input fields don't use the muted
// secondary-text colour AppText remaps, and guessing at placeholder/text
// colour swaps per field risks making entered text unreadable against a
// field background this component can't see).
const AppTextInput = forwardRef(function AppTextInput({ style, ...props }, ref) {
  const { textSize, boldText } = useAccessibilityPrefs();
  const scale = TEXT_SIZE_SCALE[textSize] || 1;

  if (scale === 1 && !boldText) {
    return <TextInput ref={ref} style={style} {...props} />;
  }

  const flat = StyleSheet.flatten(style) || {};
  const patch = {};
  if (scale !== 1 && flat.fontSize) patch.fontSize = flat.fontSize * scale;
  if (boldText) {
    const currentWeight = parseInt(flat.fontWeight, 10);
    if (!currentWeight || currentWeight < 700) patch.fontWeight = '700';
  }

  return <TextInput ref={ref} style={[style, patch]} {...props} />;
});

export default AppTextInput;
export { AppTextInput as TextInput };
