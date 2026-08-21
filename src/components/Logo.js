import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../theme/theme';

// Official Ocean Oasis, Dominica logo (circular wave emblem + wordmark).
// Source file lives at /assets/logo.png — swap it there if the brand ever
// issues an updated lockup; nothing else in this component needs to change.
const LOGO = require('../../assets/logo.png');
const ASPECT_RATIO = 204 / 270; // width / height of the source artwork

// `light`: true when the logo sits on a dark/hero background. Since the
// artwork itself is rendered on an ivory card, we wrap it in a soft white
// pill so it stays legible over photos/gradients instead of looking cropped.
export default function Logo({ size = 'md', light = false }) {
  const height = { sm: 40, md: 60, lg: 96 }[size];
  const width = height * ASPECT_RATIO;

  const image = (
    <Image
      source={LOGO}
      style={{ width, height }}
      resizeMode="contain"
      accessibilityLabel="Ocean Oasis Hotel, Dominica"
    />
  );

  if (!light) return <View style={styles.plainWrap}>{image}</View>;

  return (
    <View style={[styles.card, shadow.soft, { paddingVertical: height * 0.12 }]}>
      {image}
    </View>
  );
}

const styles = StyleSheet.create({
  plainWrap: { alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.ivory,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
