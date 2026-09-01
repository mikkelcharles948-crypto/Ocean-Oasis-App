import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PlatformHotelsScreen from '../screens/platform/PlatformHotelsScreen';

const Stack = createNativeStackNavigator();

// MCX Technologies' own layer above every hotel. Just one screen in Phase 1
// (Hotels) — analytics/subscriptions land here in a later phase, at which
// point this becomes a real tab bar like Staff/ManagementTabs.
export default function PlatformAdminTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlatformHotels" component={PlatformHotelsScreen} />
    </Stack.Navigator>
  );
}
