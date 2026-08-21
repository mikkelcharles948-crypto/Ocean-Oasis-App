import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader, StarRating, Field } from '../../components/UI';
import Button from '../../components/Button';
import { colors, spacing, radius, font } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

const CATEGORIES = ['Room', 'Cleanliness', 'Service', 'Food', 'Activities', 'Overall Experience'];

export default function FeedbackScreen({ navigation }) {
  const { submitFeedback } = useApp();
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const overall = ratings['Overall Experience'] || 0;

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      submitFeedback({ ratings, comments });
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  if (submitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
        <ScreenHeader title="Feedback" onBack={() => navigation.goBack()} />
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Ionicons name="heart" size={30} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Thank you.</Text>
          <Text style={styles.successSub}>Your feedback helps us make your stay better.</Text>
          {overall > 0 && overall <= 3 && (
            <Text style={styles.followUp}>Our guest relations team has been notified and may follow up with you shortly.</Text>
          )}
          <Button label="Done" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Feedback" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={styles.heading}>How is your stay going?</Text>

        {CATEGORIES.map((cat) => (
          <View key={cat} style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>{cat}</Text>
            <StarRating value={ratings[cat] || 0} onChange={(v) => setRatings({ ...ratings, [cat]: v })} size={22} />
          </View>
        ))}

        <Text style={styles.heading2}>Is there anything we could improve?</Text>
        <Field value={comments} onChangeText={setComments} placeholder="Tell us more…" multiline />

        <Button label="Submit Feedback" onPress={handleSubmit} loading={submitting} style={{ marginTop: spacing.sm }} />
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
  successCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  successTitle: { fontSize: 21, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  successSub: { fontSize: 13.5, color: colors.slate, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  followUp: { fontSize: 12, color: colors.slate, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },
});
