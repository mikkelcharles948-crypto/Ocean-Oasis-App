import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius } from '../theme/theme';

// A simple horizontal, paged image gallery with dot indicators — for a
// room, activity, or destination with more than one photo. Deliberately
// plain (ScrollView paging, not a carousel library): matches this app's
// existing "no extra native deps unless needed" posture.
//
//   <ImageCarousel images={[{ uri: '...' }, { uri: '...' }]} height={260} />
export default function ImageCarousel({ images = [], height = 260, width, borderRadius = radius.lg }) {
  const { width: windowWidth } = useWindowDimensions();
  const resolvedWidth = width || windowWidth;
  const [index, setIndex] = useState(0);

  if (!images.length) return null;

  const handleScroll = (e) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
    if (page !== index) setIndex(page);
  };

  return (
    <View style={{ height, width: resolvedWidth, borderRadius, overflow: 'hidden' }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((source, i) => (
          <Image key={i} source={source} style={{ width: resolvedWidth, height }} contentFit="cover" transition={200} />
        ))}
      </ScrollView>
      {images.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: colors.white, width: 16 },
});
