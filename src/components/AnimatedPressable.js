import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { duration, easing, useReducedMotion } from '../theme/motion';

const AnimatedTouchable = Animated.createAnimatedComponent(Pressable);

// The one micro-interaction wrapper the brief asks for: a restrained
// scale+opacity dip on press, used anywhere a card, image, or icon button
// needs to feel touchable without a ripple or a bounce. Not for text
// buttons — Button.js already has its own activeOpacity feedback.
//
//   <AnimatedPressable onPress={...}><ExperienceCard ... /></AnimatedPressable>
export default function AnimatedPressable({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  opacityTo = 0.9,
  disabled,
  ...rest
}) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - progress.value * (1 - scaleTo) }],
    opacity: 1 - progress.value * (1 - opacityTo),
  }));

  const animateTo = (value) => {
    if (reducedMotion) {
      progress.value = value;
      return;
    }
    progress.value = withTiming(value, { duration: duration.fast, easing: easing.standard });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      disabled={disabled}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedTouchable>
  );
}
