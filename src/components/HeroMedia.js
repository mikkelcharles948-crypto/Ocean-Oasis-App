import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme/theme';
import { useReducedMotion } from '../theme/motion';
import { optimizeImageUrl } from '../utils/optimizeImageUrl';

// The one centralized hero-media component the brief asks for, so no
// screen hardcodes a video URL or hand-rolls its own fallback logic.
// Always renders `fallbackImage` first/underneath; a muted, looping video
// only plays on top of it once it has actually started, and is skipped
// entirely when the OS Reduce Motion setting is on or the player errors.
//
//   <HeroMedia
//     video={{ uri: 'https://.../hero.mp4' }}
//     fallbackImage={require('../../assets/images/hero/lobby.jpg')}
//     scrim
//   >
//     <Text style={typography.hero}>Ocean Oasis</Text>
//   </HeroMedia>
export default function HeroMedia({ video, fallbackImage, imageWidth = 1200, scrim = false, scrimColors, scrimLocations, style, contentStyle, children }) {
  const reducedMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const showVideo = !!video && !reducedMotion && !videoFailed;
  const optimizedFallback = fallbackImage?.uri
    ? { ...fallbackImage, uri: optimizeImageUrl(fallbackImage.uri, imageWidth) }
    : fallbackImage;

  const player = useVideoPlayer(showVideo ? video : null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (!player) return;
    const readySub = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'readyToPlay') {
        setVideoReady(true);
        player.play();
      } else if (status === 'error') {
        setVideoFailed(true);
      }
    });
    return () => readySub?.remove?.();
  }, [player]);

  return (
    <View style={[styles.wrap, style]}>
      <Image source={optimizedFallback} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      {showVideo ? (
        <VideoView
          player={player}
          style={[StyleSheet.absoluteFill, { opacity: videoReady ? 1 : 0 }]}
          contentFit="cover"
          nativeControls={false}
          pointerEvents="none"
        />
      ) : null}
      {scrim ? (
        <LinearGradient
          colors={scrimColors || gradients.scrim}
          locations={scrimLocations}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {children ? <View style={[styles.content, contentStyle]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  content: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
});
