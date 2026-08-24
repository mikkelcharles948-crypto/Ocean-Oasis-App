import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius } from '../theme/theme';

// -----------------------------------------------------------------------
// GlassSurface — the app's "Liquid Glass" building block.
//
// Wraps expo-blur's BlurView with defaults tuned to Ocean Oasis's ivory /
// deep-ocean / turquoise / gold palette: a frosted, translucent panel with
// a soft highlight edge, meant for chrome (tab bars, headers, modal
// sheets, small floating controls) — never for large scrollable content
// areas.
//
// Usage:
//   <GlassSurface style={{ borderRadius: radius.lg }}>{children}</GlassSurface>
//   <GlassSurface tint="dark" intensity={60} />  // for use over imagery/dark scrims
// -----------------------------------------------------------------------

// Overlay + edge colors derived from this app's own palette (colors.ivory /
// colors.white), not generic gray — keeps the glass reading as "Ocean
// Oasis's glass" rather than a stock Apple demo.
const GLASS_OVERLAY_LIGHT = 'rgba(251,248,242,0.55)'; // colors.ivory tinted
const GLASS_OVERLAY_DARK = 'rgba(9,46,55,0.45)'; // colors.deepOcean2 tinted
const GLASS_BORDER_LIGHT = 'rgba(255,255,255,0.5)';
const GLASS_BORDER_DARK = 'rgba(255,255,255,0.18)';

export default function GlassSurface({
  children,
  style,
  contentStyle,
  intensity = 42,
  tint = 'light',
  borderRadius = radius.lg,
  bordered = true,
  overlayColor,
  borderColor,
  pointerEvents,
}) {
  const isDark = tint === 'dark';
  const resolvedOverlay = overlayColor ?? (isDark ? GLASS_OVERLAY_DARK : GLASS_OVERLAY_LIGHT);
  const resolvedBorder = borderColor ?? (isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT);

  return (
    <View
      pointerEvents={pointerEvents}
      style={[
        styles.wrap,
        { borderRadius },
        bordered && { borderWidth: 1, borderColor: resolvedBorder },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: resolvedOverlay }]} pointerEvents="none" />
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});
