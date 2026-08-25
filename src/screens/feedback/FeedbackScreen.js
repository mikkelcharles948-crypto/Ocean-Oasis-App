import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { ScreenHeader, StarRating, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, shadow, gradients, typography } from '../../theme/theme';
import { duration, easing, useReducedMotion } from '../../theme/motion';
import { useApp } from '../../context/AppContext';

// The one rating that gates submission and drives the whole moment — kept
// as its own named constant (matches the literal key AppContext.submitFeedback
// reads off `data.ratings['Overall Experience']`) rather than folded into
// the list below, since it's rendered as the centerpiece, not a list row.
const OVERALL_CATEGORY = 'Overall Experience';
const SECONDARY_CATEGORIES = ['Room', 'Cleanliness', 'Service', 'Food', 'Activities'];
const CATEGORY_KEY = {
  Room: 'room', Cleanliness: 'cleanliness', Service: 'service', Food: 'food',
  Activities: 'activities', 'Overall Experience': 'overallExperience',
};

function responseKeyForRating(value) {
  if (value <= 2) return 'low';
  if (value === 3) return 'mid';
  return 'high';
}

// StarRating (UI.js) is a controlled, presentation-only row of touchables —
// it doesn't expose per-star accessibility labels and, per the redesign
// brief, isn't ours to change here. Rather than leave it unlabeled for
// screen readers, this wraps it as a single adjustable control (the
// standard pattern for star-rating widgets): one spoken label describing
// the current value, with increment/decrement actions mirroring what a tap
// on the next/previous star would do. Sighted users still tap the stars
// directly — this only changes how the same control is exposed to
// assistive tech.
function RateableStars({ label, value, onChange, size }) {
  const { t } = useTranslation();
  const clamped = Math.max(0, Math.min(5, value || 0));
  const accessibilityLabel = clamped > 0
    ? t('feedback.starRatingLabel', { label, value: clamped })
    : label;

  const handleAccessibilityAction = (event) => {
    const { actionName } = event.nativeEvent;
    if (actionName === 'increment') {
      onChange(Math.min(5, clamped + 1));
    } else if (actionName === 'decrement' && clamped > 1) {
      onChange(clamped - 1);
    }
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 5, now: clamped }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={handleAccessibilityAction}
      hitSlop={{ top: 4, bottom: 4 }}
    >
      <StarRating value={value} onChange={onChange} size={size} />
    </View>
  );
}

// Restrained fade + scale-up entrance for the thank-you moment's icon.
// Skips straight to the settled state when the OS "Reduce Motion" setting
// is on, per src/theme/motion.js.
function ThankYouIcon() {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withTiming(1, { duration: duration.slow, easing: easing.decelerate });
  }, [reducedMotion, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.7 + progress.value * 0.3 }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient colors={gradients.gold} style={styles.successCircle}>
        <Ionicons name="heart" size={30} color={colors.white} />
      </LinearGradient>
    </Animated.View>
  );
}

export default function FeedbackScreen({ navigation }) {
  const { t } = useTranslation();
  const { submitFeedback } = useApp();
  const reducedMotion = useReducedMotion();
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const overall = ratings[OVERALL_CATEGORY] || 0;

  // Everything below the headline star sits behind this — a quiet
  // fade + rise once the guest has actually rated something, so the screen
  // reveals itself as a continuation of that one moment rather than
  // presenting a full form up front.
  const reveal = useSharedValue(overall > 0 ? 1 : 0);
  useEffect(() => {
    const target = overall > 0 ? 1 : 0;
    if (reducedMotion) {
      reveal.value = target;
      return;
    }
    reveal.value = withTiming(target, { duration: duration.base, easing: easing.standard });
  }, [overall, reducedMotion, reveal]);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: (1 - reveal.value) * 14 }],
  }));

  const setCategoryRating = (category, value) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (overall < 1) {
      setError(t('feedback.overallRequired'));
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await submitFeedback({ ratings, comments });
    setSubmitting(false);
    if (!result || result.error) {
      setError(result?.error || t('feedback.submitError'));
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title={t('feedback.title')} onBack={() => navigation.goBack()} />
        <View style={styles.successWrap}>
          <ThankYouIcon />
          <Text style={styles.successTitle}>{t('feedback.thankYou')}</Text>
          <Text style={styles.successSub}>{t('feedback.thankYouSub')}</Text>
          {overall > 0 && overall <= 3 && (
            <Text style={styles.followUp}>{t('feedback.followUp')}</Text>
          )}
          <Button label={t('feedback.done')} onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title={t('feedback.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* The moment: one large, centered rating with warm, editorial
            copy — this is the screen, not a header above a form. */}
        <View style={styles.momentBlock}>
          <Text style={styles.heading}>{t('feedback.heading')}</Text>
          <View style={styles.starsWrap}>
            <RateableStars
              label={t(`feedback.categories.${CATEGORY_KEY[OVERALL_CATEGORY]}`)}
              value={overall}
              onChange={(v) => setCategoryRating(OVERALL_CATEGORY, v)}
              size={44}
            />
          </View>
          {overall > 0 && (
            <Text style={styles.responseLine}>
              {t(`feedback.response.${responseKeyForRating(overall)}`)}
            </Text>
          )}
        </View>

        {/* Revealed once the guest has rated — a natural continuation of
            the same moment, not a second form. */}
        <Animated.View
          style={[styles.revealBlock, revealStyle]}
          pointerEvents={overall > 0 ? 'auto' : 'none'}
        >
          <Text style={styles.heading2}>{t('feedback.heading2')}</Text>

          <View style={styles.categoryCard}>
            {SECONDARY_CATEGORIES.map((cat, index) => (
              <View
                key={cat}
                style={[
                  styles.ratingRow,
                  index === SECONDARY_CATEGORIES.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.ratingLabel}>{t(`feedback.categories.${CATEGORY_KEY[cat]}`)}</Text>
                <RateableStars
                  label={t(`feedback.categories.${CATEGORY_KEY[cat]}`)}
                  value={ratings[cat] || 0}
                  onChange={(v) => setCategoryRating(cat, v)}
                  size={20}
                />
              </View>
            ))}
          </View>

          <Field value={comments} onChangeText={setComments} placeholder={t('feedback.commentsPlaceholder')} multiline />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button label={t('feedback.submitFeedback')} onPress={handleSubmit} loading={submitting} style={{ marginTop: spacing.sm }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxl },
  momentBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heading: {
    ...typography.display,
    color: colors.charcoal,
    textAlign: 'center',
  },
  starsWrap: { marginTop: spacing.lg },
  responseLine: {
    ...typography.body,
    color: colors.slate,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  revealBlock: { paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  heading2: {
    ...typography.subheading,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ratingLabel: { ...typography.bodySmall, fontWeight: '600', color: colors.charcoal },
  successWrap: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  successCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadow.soft },
  successTitle: { ...typography.heading, color: colors.charcoal },
  successSub: { ...typography.bodySmall, color: colors.slate, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  followUp: { fontSize: 12, color: colors.slate, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },
  errorText: { color: colors.error, fontSize: 13, marginTop: spacing.sm },
});
