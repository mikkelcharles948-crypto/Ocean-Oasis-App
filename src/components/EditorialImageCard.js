import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from './AnimatedPressable';
import { colors, radius, spacing, typography, shadow } from '../theme/theme';

const SIZES = {
  large: { height: 320, titleStyle: typography.display },
  medium: { height: 220, titleStyle: typography.heading },
  small: { height: 150, titleStyle: typography.subheading },
};

// The shared visual pattern behind ExperienceCard / EventCard / PromotionCard:
// full-bleed image, a bottom scrim for legibility, a small uppercase eyebrow,
// one headline, one line of minimal metadata, and a single trailing icon —
// never a database-record list of fields. Screens map their own data shape
// into these plain props; this component holds no knowledge of activities,
// events, or promotions specifically.
//
//   <EditorialImageCard
//     image={{ uri: activity.imageUrl }}
//     eyebrow={activity.category}
//     title={activity.name}
//     meta={`${activity.duration} · ${activity.location}`}
//     trailing={formatActivityPrice(activity, t)}
//     onPress={() => navigation.navigate('ActivityDetail', { id: activity.id })}
//   />
export default function EditorialImageCard({
  image,
  fallbackIcon = 'image-outline',
  eyebrow,
  title,
  meta,
  trailing,
  size = 'medium',
  onPress,
  style,
}) {
  const { height, titleStyle } = SIZES[size] || SIZES.medium;

  return (
    <AnimatedPressable onPress={onPress} style={[styles.wrap, { height }, style]} scaleTo={0.97}>
      {image ? (
        <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]}>
          <Ionicons name={fallbackIcon} size={36} color={colors.turquoiseDark} />
        </View>
      )}
      <LinearGradient
        colors={['rgba(9,46,55,0)', 'rgba(9,46,55,0.05)', 'rgba(9,46,55,0.72)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>
        {eyebrow ? <Text style={[typography.label, styles.eyebrow]} numberOfLines={1}>{eyebrow}</Text> : null}
        <View style={styles.titleRow}>
          <Text style={[titleStyle, styles.title]} numberOfLines={2}>{title}</Text>
        </View>
        <View style={styles.metaRow}>
          {meta ? <Text style={styles.meta} numberOfLines={1}>{meta}</Text> : <View />}
          {trailing ? <Text style={styles.trailing} numberOfLines={1}>{trailing}</Text> : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.sandLight,
    ...shadow.card,
  },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sandLight },
  content: { flex: 1, justifyContent: 'flex-end', padding: spacing.md },
  eyebrow: { color: colors.goldSoft, marginBottom: 6 },
  titleRow: { flexShrink: 1 },
  title: { color: colors.white },
  metaRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 8, gap: spacing.sm,
  },
  meta: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.82)' },
  trailing: { fontSize: 13, fontWeight: '700', color: colors.white },
});
