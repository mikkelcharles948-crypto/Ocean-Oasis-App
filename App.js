import './src/i18n';

import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Sentry from '@sentry/react-native';

import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

// Crash/error reporting — no-ops safely if EXPO_PUBLIC_SENTRY_DSN isn't
// set (e.g. local development without a Sentry project configured yet).
// Create a free project at sentry.io, add its DSN to .env.local, and
// crashes/errors start reporting with no other code changes needed.
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0.2,
    environment: __DEV__ ? 'development' : 'production',
  });
}

// Show alerts/sound even while the app is in the foreground — emergency
// broadcasts should interrupt whatever the guest is looking at, not sit
// silently in the notification tray.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// NOTE: RootNavigator already renders its own <NavigationContainer> (it needs
// the custom theme + conditional onboarding/auth/main stacks), so App.js must
// NOT wrap it in a second NavigationContainer — nesting them breaks navigation.
//
// The KeyboardAvoidingView here is app-wide on purpose: no individual screen
// has to handle keyboard avoidance itself — focusing any TextInput anywhere
// in the app automatically shifts the visible area up so the field being
// typed into is never hidden behind the keyboard.
function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <RootNavigator />
        </KeyboardAvoidingView>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default sentryDsn ? Sentry.wrap(App) : App;
