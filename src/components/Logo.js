import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import GlassSurface from './GlassSurface';
import { colors } from '../theme/theme';
import { useApp } from '../context/AppContext';

// Official Ocean Oasis, Dominica logo, processed from the original source
// artwork (which shipped as an opaque cream-filled rectangle) into two
// real transparent-background crops so it can sit directly on any surface
// instead of always looking like a sticker in a box:
//   - logo-transparent.png: the full lockup (wave mark + "OCEAN OASIS
//     HOTEL DOMINICA" wordmark), tightly cropped to its real content.
//   - logo-mark.png: just the circular wave emblem, tightly cropped —
//     for tight spaces like the tab bar where the full wordmark doesn't fit.
// Regenerate both from assets/logo.png with a background-keying script if
// the brand ever issues an updated lockup — see git history for the
// exact crop/threshold values used.
const LOGO_FULL = require('../../assets/logo-transparent.png');
const LOGO_MARK = require('../../assets/logo-mark.png');
const FULL_ASPECT_RATIO = 204 / 142; // width / height of logo-transparent.png
const MARK_ASPECT_RATIO = 1; // logo-mark.png is square

// `variant`: 'full' (mark + wordmark, the default) or 'mark' (icon only,
// for tight chrome like tab bars).
// `light`: true when the logo sits on a dark/photo background rather than
// a flat surface. For 'full' this adds a translucent frosted (Liquid
// Glass) panel behind it, since the wordmark is a dark teal that needs
// contrast from something other than the photo itself. For 'mark', the
// logo-mark.png artwork is a mid-tone teal — legible on the tab bar's own
// light glass, but low-contrast and easy to lose against a photo (an ocean
// hero shot is very often teal-toned too) — so `light` here instead tints
// the mark white, the same fix already used successfully for the bell icon
// sitting right next to it in HomeScreen's hero.
export default function Logo({ size = 'md', light = false, variant = 'full' }) {
  const { hotelBranding } = useApp();
  const height = typeof size === 'number' ? size : { sm: 40, md: 60, lg: 96 }[size];
  // A hotel with its own logo configured (Platform Admin -> Hotels ->
  // theme.logoUrl) overrides the bundled Ocean Oasis artwork. No hotel
  // logo yet (including for the demo/single-hotel case today) falls back
  // to it exactly as before.
  const hotelName = hotelBranding?.name;
  const remoteLogoUrl = hotelBranding?.theme?.logoUrl;
  const accessibilityLabel = hotelName ? `${hotelName} logo` : 'Ocean Oasis Hotel, Dominica';

  if (variant === 'mark') {
    return (
      <Image
        source={remoteLogoUrl ? { uri: remoteLogoUrl } : LOGO_MARK}
        style={[{ width: height, height }, light && !remoteLogoUrl && { tintColor: colors.white }]}
        resizeMode="contain"
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  const width = height * FULL_ASPECT_RATIO;
  const image = (
    <Image
      source={remoteLogoUrl ? { uri: remoteLogoUrl } : LOGO_FULL}
      style={{ width, height }}
      resizeMode="contain"
      accessibilityLabel={accessibilityLabel}
    />
  );

  if (!light) return <View style={styles.plainWrap}>{image}</View>;

  return (
    <GlassSurface
      style={styles.glassWrap}
      contentStyle={[styles.glassContent, { paddingVertical: height * 0.14 }]}
      intensity={34}
      tint="light"
      borderRadius={999}
    >
      {image}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  plainWrap: { alignItems: 'center', justifyContent: 'center' },
  glassWrap: { alignSelf: 'center' },
  glassContent: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
});
