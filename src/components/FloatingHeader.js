import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassSurface from './GlassSurface';
import { colors, radius, spacing, typography } from '../theme/theme';

// A genuinely floating header for hero-style screens (Home, Activity
// Detail, Explore destination) — sits absolutely over the content rather
// than pushing it down like UI.js's ScreenHeader. Two things the screen
// controls:
//
//  - `tone`: 'light' | 'dark' — which icon/text color reads over what's
//    currently behind the header (a dark ocean-hero photo wants 'light';
//    once the user has scrolled onto the plain ivory body, switch to
//    'dark'). Compute this from scroll position in the screen and pass it
//    down; this component has no opinion on scroll.
//  - `elevated`: when true, a frosted GlassSurface fades in behind the
//    controls (e.g. once scrolled past the hero) so back/actions stay
//    legible over arbitrary content instead of floating on nothing.
//
//   <FloatingHeader tone={scrollY > 200 ? 'dark' : 'light'} elevated={scrollY > 40}
//     onBack={() => navigation.goBack()} title={scrollY > 200 ? activity.name : undefined} />
export default function FloatingHeader({ tone = 'light', elevated = false, title, onBack, right }) {
  const insets = useSafeAreaInsets();
  const iconColor = tone === 'light' ? colors.white : colors.deepOcean;

  const controls = (
    <View style={[styles.row, { paddingTop: insets.top + 8 }]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.circleBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={22} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.circleBtn} />
      )}
      {title ? (
        <Text style={[typography.subheading, styles.title, { color: iconColor }]} numberOfLines={1}>{title}</Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      <View style={styles.circleBtn}>{right}</View>
    </View>
  );

  if (!elevated) {
    return <View style={styles.absolute}>{controls}</View>;
  }

  return (
    <View style={styles.absolute}>
      <GlassSurface borderRadius={0} intensity={36} tint={tone === 'light' ? 'dark' : 'light'} bordered={false}>
        {controls}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingBottom: 8, gap: spacing.sm,
  },
  circleBtn: {
    width: 38, height: 38, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, textAlign: 'center' },
});
