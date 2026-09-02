import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, radius, font, shadow } from '../../theme/theme';
import { useApp } from '../../context/AppContext';

// The very first decision a guest makes now — before onboarding even
// finishes deciding whether to show sign-in — since which hotel they pick
// drives everything downstream: the theme (colors/logo, via ThemeBridge in
// App.js), which hotel a brand-new signup gets attached to, and which
// hotel's activities/events/dining/destinations they see once signed in.
export default function HotelSelectScreen({ navigation }) {
  const { loadActiveHotels, selectPreAuthHotel } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    let mounted = true;
    loadActiveHotels().then((result) => {
      if (!mounted) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setHotels(result.hotels);
    });
    return () => {
      mounted = false;
    };
  }, [loadActiveHotels]);

  const handleSelect = (hotel) => {
    selectPreAuthHotel({ id: hotel.id, name: hotel.name });
    navigation.navigate('WelcomeAuth');
  };

  return (
    <LinearGradient colors={[colors.deepOcean, colors.deepOcean2]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxl }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </TouchableOpacity>

          <Text style={styles.eyebrow}>WELCOME</Text>
          <Text style={styles.heading}>Which hotel are you staying at?</Text>
          <Text style={styles.sub}>Pick your hotel to get started — everything from here reflects your stay.</Text>

          {loading ? (
            <ActivityIndicator color={colors.white} style={{ marginTop: spacing.xxl }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
              {hotels.map((h) => (
                <TouchableOpacity key={h.id} style={styles.card} activeOpacity={0.9} onPress={() => handleSelect(h)}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="business" size={22} color={colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{h.name}</Text>
                    {h.address ? <Text style={styles.cardSub} numberOfLines={1}>{h.address}</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.slate} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backBtn: { marginBottom: spacing.lg, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: colors.goldSoft, fontSize: 11.5, fontWeight: '700', letterSpacing: 2 },
  heading: { color: colors.white, fontSize: 24, fontWeight: '700', fontFamily: font.display, marginTop: 8 },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 13.5, marginTop: 10, lineHeight: 20 },
  errorText: { color: colors.white, fontSize: 13.5, marginTop: spacing.xl, textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md, ...shadow.card,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.deepOcean,
  },
  cardTitle: { fontSize: 15.5, fontWeight: '700', color: colors.charcoal, fontFamily: font.display },
  cardSub: { fontSize: 12, color: colors.slate, marginTop: 3 },
});
