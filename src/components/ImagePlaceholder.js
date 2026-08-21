import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/theme';

// Stand-in for real hotel/destination photography. Swap for <Image source={{ uri }} />
// once real asset URLs or bundled photos are available.
const ICONS = {
  ocean: 'wave', volcano: 'volcano', waterfall: 'waterfall', rainforest: 'forest',
  pool: 'pool', whale: 'whale', market: 'store', springs: 'hot-tub', gorge: 'terrain',
  snorkel: 'snorkel', catamaran: 'sail-boat', yoga: 'yoga', cooking: 'chef-hat',
  finedining: 'silverware-fork-knife', terrace: 'table-chair', bar: 'glass-cocktail',
  roomservice: 'room-service', cocktail: 'glass-cocktail', privatedining: 'candle',
  adventure: 'hiking', room: 'bed-king', coffee: 'coffee', nature: 'leaf', wine: 'glass-wine',
  music: 'music-note', culture: 'drama-masks', wave: 'wave', hero: 'island',
};

const GRADIENTS = [
  [colors.deepOcean, colors.turquoiseDark],
  [colors.forest, colors.turquoise],
  [colors.deepOcean2, colors.deepOceanLight],
  [colors.turquoiseDark, colors.forest],
];

function hashStr(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function ImagePlaceholder({ kind = 'ocean', style, iconSize = 34, borderRadius = radius.lg }) {
  const gradient = GRADIENTS[hashStr(kind) % GRADIENTS.length];
  const iconName = ICONS[kind] || 'island';
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, { borderRadius }, style]}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={iconName} size={iconSize} color="rgba(255,255,255,0.9)" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
