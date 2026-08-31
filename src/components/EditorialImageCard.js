import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './AppText';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadow } from '../theme/theme';
import { optimizeImageUrl } from '../utils/optimizeImageUrl';

const SIZES = {
  large: { height: 320, imageWidth: 900, titleStyle: typography.display },
  medium: { height: 220, imageWidth: 700, titleStyle: typography.heading },
  small: { height: 150, imageWidth: 500, titleStyle: typography.subheading },
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
  const { height, imageWidth, titleStyle } = SIZES[size] || SIZES.medium;
  const [failed, setFailed] = useState(false);
  const optimizedImage = image?.uri && !failed ? { ...image, uri: optimizeImageUrl(image.uri, imageWidth) } : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.wrap, { height }, style]}>
      {optimizedImage ? (
        <Image source={optimizedImage} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} onError={() => setFailed(true)} />
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
    </TouchableOpacity>
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
  // Absolutely positioned (not flex:1 in normal flow alongside the
  // absolute-filled image/gradient siblings above) — same overlay pattern
  // HeroMedia already uses successfully. Mixing an in-flow flex child with
  // absolute-positioned siblings under an Animated/Pressable parent is the
  // kind of thing that can render inconsistently on Android; this removes
  // the ambiguity entirely by making every layer here position:absolute.
  content: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: spacing.md },
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
