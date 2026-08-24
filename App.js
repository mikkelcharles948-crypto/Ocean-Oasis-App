import './src/i18n';

import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

// NOTE: RootNavigator already renders its own <NavigationContainer> (it needs
// the custom theme + conditional onboarding/auth/main stacks), so App.js must
// NOT wrap it in a second NavigationContainer — nesting them breaks navigation.
//
// The KeyboardAvoidingView here is app-wide on purpose: no individual screen
// has to handle keyboard avoidance itself — focusing any TextInput anywhere
// in the app automatically shifts the visible area up so the field being
// typed into is never hidden behind the keyboard.
export default function App() {
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
