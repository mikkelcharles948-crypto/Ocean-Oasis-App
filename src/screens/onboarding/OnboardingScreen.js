import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { Pill } from '../../components/UI';
import { colors, spacing, font } from '../../theme/theme';
import { INTERESTS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  { key: 's1', kind: 'welcome' },
  { key: 's2', kind: 'discover' },
  { key: 's3', kind: 'everything' },
  { key: 's4', kind: 'interests' },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [index, setIndex] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const listRef = useRef(null);

  const goTo = (i) => {
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const finish = () => completeOnboarding(selectedInterests);

  const renderSlide = ({ item }) => {
    if (item.kind === 'welcome') {
      return (
        <LinearGradient colors={[colors.deepOcean, colors.turquoiseDark]} style={styles.slide}>
          <SafeAreaView style={styles.centerFill}>
            <Logo size="lg" light />
            <Text style={styles.welcomeTitle}>Welcome to Ocean Oasis</Text>
            <Text style={styles.welcomeSubtitle}>Your island experience starts here.</Text>
          </SafeAreaView>
        </LinearGradient>
      );
    }
    if (item.kind === 'discover') {
      return (
        <LinearGradient colors={[colors.forest, colors.turquoise]} style={styles.slide}>
          <SafeAreaView style={styles.centerFill}>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons name="forest" size={40} color={colors.white} />
              <MaterialCommunityIcons name="wave" size={40} color={colors.white} />
              <MaterialCommunityIcons name="drama-masks" size={40} color={colors.white} />
            </View>
            <Text style={styles.title}>Discover Dominica</Text>
            <Text style={styles.subtitle}>
              Rainforest peaks, volcanic reefs, and Creole culture — the Nature Island, right outside your door.
            </Text>
          </SafeAreaView>
        </LinearGradient>
      );
    }
    if (item.kind === 'everything') {
      const items = [
        ['room-service', 'Hotel Services'],
        ['hiking', 'Activities'],
        ['silverware-fork-knife', 'Dining'],
        ['calendar-star', 'Events'],
        ['tag-heart', 'Promotions'],
        ['face-agent', 'Concierge'],
        ['star-outline', 'Feedback'],
      ];
      return (
        <LinearGradient colors={[colors.deepOcean2, colors.deepOceanLight]} style={styles.slide}>
          <SafeAreaView style={styles.centerFill}>
            <Text style={styles.title}>Everything you need,{'\n'}right at your fingertips.</Text>
            <View style={styles.grid}>
              {items.map(([icon, label]) => (
                <View key={label} style={styles.gridItem}>
                  <MaterialCommunityIcons name={icon} size={24} color={colors.gold} />
                  <Text style={styles.gridLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </SafeAreaView>
        </LinearGradient>
      );
    }
    return (
      <LinearGradient colors={[colors.deepOcean, colors.forest]} style={styles.slide}>
        <SafeAreaView style={styles.interestsFill}>
          <Text style={styles.title}>Make your stay yours.</Text>
          <Text style={styles.subtitle}>Select a few interests so we can personalize your recommendations.</Text>
          <View style={styles.pillWrap}>
            {INTERESTS.map((i) => (
              <Pill
                key={i.id}
                label={i.label}
                selected={selectedInterests.includes(i.id)}
                onPress={() => toggleInterest(i.id)}
              />
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.deepOcean }}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(i) => i.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      />

      <SafeAreaView style={styles.footer} edges={['bottom']}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.footerButtons}>
          {index < SLIDES.length - 1 ? (
            <>
              <TouchableOpacity onPress={finish}>
                <Text style={styles.skip}>Skip</Text>
              </TouchableOpacity>
              <Button label="Continue" onPress={() => goTo(index + 1)} fullWidth={false} style={{ paddingHorizontal: 32 }} />
            </>
          ) : (
            <Button label="Continue" onPress={finish} style={{ flex: 1 }} />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { width, flex: 1 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  interestsFill: { flex: 1, alignItems: 'center', paddingTop: 90, paddingHorizontal: spacing.xl },
  welcomeTitle: {
    fontFamily: font.display, fontSize: 28, fontWeight: '700', color: colors.white,
    marginTop: spacing.xl, textAlign: 'center',
  },
  welcomeSubtitle: { fontSize: 15, color: colors.sandLight, marginTop: 10, textAlign: 'center' },
  iconRow: { flexDirection: 'row', gap: 24, marginBottom: spacing.lg },
  title: {
    fontFamily: font.display, fontSize: 26, fontWeight: '700', color: colors.white,
    textAlign: 'center', marginBottom: spacing.sm,
  },
  subtitle: { fontSize: 14.5, color: colors.sandLight, textAlign: 'center', lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.xl, gap: 18 },
  gridItem: { width: 92, alignItems: 'center', gap: 8 },
  gridLabel: { color: colors.white, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: spacing.lg, gap: 4 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: spacing.md },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: colors.white, width: 20 },
  footerButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skip: { color: colors.sandLight, fontSize: 15, fontWeight: '600' },
});
