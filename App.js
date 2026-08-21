import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

// NOTE: RootNavigator already renders its own <NavigationContainer> (it needs
// the custom theme + conditional onboarding/auth/main stacks), so App.js must
// NOT wrap it in a second NavigationContainer — nesting them breaks navigation.
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
