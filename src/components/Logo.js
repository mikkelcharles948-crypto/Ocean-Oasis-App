import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import GlassSurface from './GlassSurface';

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
// `light`: true when the full-lockup logo sits on a dark/photo background
// — since the wordmark itself is a dark teal, it needs a translucent
// frosted (Liquid Glass) panel behind it for contrast, not a flat white
// box. The mark-only variant never gets a background treatment — it's
// meant to sit directly on the tab bar's own glass, fully zoomed in.
export default function Logo({ size = 'md', light = false, variant = 'full' }) {
  const height = typeof size === 'number' ? size : { sm: 40, md: 60, lg: 96 }[size];

  if (variant === 'mark') {
    return (
      <Image
        source={LOGO_MARK}
        style={{ width: height, height }}
        resizeMode="contain"
        accessibilityLabel="Ocean Oasis Hotel, Dominica"
      />
    );
  }

  const width = height * FULL_ASPECT_RATIO;
  const image = (
    <Image
      source={LOGO_FULL}
      style={{ width, height }}
      resizeMode="contain"
      accessibilityLabel="Ocean Oasis Hotel, Dominica"
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
