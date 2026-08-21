import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme/theme';

export default function WelcomeAuthScreen({ navigation }) {
  return (
    <LinearGradient colors={[colors.deepOcean2, colors.deepOcean]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ alignItems: 'center', marginTop: spacing.xxl }}>
          <Logo size="lg" light />
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.card}>
          <Text style={styles.title}>Sign in to Ocean Oasis</Text>
          <Text style={styles.subtitle}>Access your reservation, requests, and personalized recommendations.</Text>

          <Button label="Sign In" onPress={() => navigation.navigate('SignIn')} style={{ marginTop: spacing.lg }} />
          <Button
            label="Create Account"
            variant="outline"
            onPress={() => navigation.navigate('CreateAccount')}
            style={{ marginTop: spacing.sm }}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          <Text style={styles.reservationTitle}>Already staying with us?</Text>
          <Text style={styles.reservationSubtitle}>Enter your reservation number to access your stay.</Text>
          <Button
            label="Use Reservation Number"
            variant="secondary"
            onPress={() => navigation.navigate('ReservationAccess')}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: 26, padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 21, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
  subtitle: { fontSize: 13.5, color: colors.slate, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 10, color: colors.slate, fontSize: 12 },
  reservationTitle: { fontSize: 15, fontWeight: '700', color: colors.charcoal, textAlign: 'center' },
  reservationSubtitle: { fontSize: 13, color: colors.slate, textAlign: 'center', marginTop: 4 },
});
