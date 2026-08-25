import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ScreenHeader, StarRating, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font, shadow, gradients } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const CATEGORIES = ['Room', 'Cleanliness', 'Service', 'Food', 'Activities', 'Overall Experience'];
const CATEGORY_KEY = {
  Room: 'room', Cleanliness: 'cleanliness', Service: 'service', Food: 'food',
  Activities: 'activities', 'Overall Experience': 'overallExperience',
};

export default function FeedbackScreen({ navigation }) {
  const { t } = useTranslation();
  const { submitFeedback } = useApp();
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const overall = ratings['Overall Experience'] || 0;

  const handleSubmit = async () => {
    if (overall < 1) {
      setError(t('feedback.overallRequired'));
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await submitFeedback({ ratings, comments });
    setSubmitting(false);
    if (!result) {
      setError(t('feedback.submitError'));
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title={t('feedback.title')} onBack={() => navigation.goBack()} />
        <View style={styles.successWrap}>
          <LinearGradient colors={gradients.gold} style={styles.successCircle}>
            <Ionicons name="heart" size={30} color={colors.white} />
          </LinearGradient>
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.heading}>{t('feedback.heading')}</Text>

        {CATEGORIES.map((cat) => (
          <View key={cat} style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>{t(`feedback.categories.${CATEGORY_KEY[cat]}`)}</Text>
            <StarRating value={ratings[cat] || 0} onChange={(v) => setRatings({ ...ratings, [cat]: v })} size={22} />
          </View>
        ))}

        <Text style={styles.heading2}>{t('feedback.heading2')}</Text>
        <Field value={comments} onChangeText={setComments} placeholder={t('feedback.commentsPlaceholder')} multiline />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button label={t('feedback.submitFeedback')} onPress={handleSubmit} loading={submitting} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: '700', color: colors.charcoal, fontFamily: font.display, marginBottom: spacing.md },
  heading2: { fontSize: 15, fontWeight: '700', color: colors.charcoal, marginTop: spacing.lg, marginBottom: spacing.sm },
  ratingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  ratingLabel: { fontSize: 13.5, fontWeight: '600', color: colors.charcoal },
  successWrap: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  successCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, ...shadow.soft },
  successTitle: { fontSize: 21, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  successSub: { fontSize: 13.5, color: colors.slate, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  followUp: { fontSize: 12, color: colors.slate, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },
  errorText: { color: colors.error, fontSize: 13, marginTop: spacing.sm },
});
