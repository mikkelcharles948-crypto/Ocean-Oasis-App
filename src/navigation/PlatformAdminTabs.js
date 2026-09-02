import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components/AppText';

import PlatformHotelsScreen from '../screens/platform/PlatformHotelsScreen';
import PlatformStaffScreen from '../screens/platform/PlatformStaffScreen';
import { colors } from '../theme/theme';
import GlassSurface from '../components/GlassSurface';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={22} color={focused ? colors.deepOcean : colors.slate} />
    </View>
  );
}

// MCX Technologies' own layer above every hotel. Two screens for this
// phase (Hotels, Staff assignment) — analytics/subscriptions land here in
// a later phase.
export default function PlatformAdminTabs() {
  const labelMap = { Hotels: 'Hotels', Staff: 'Staff' };
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.deepOcean,
        tabBarInactiveTintColor: colors.slate,
        tabBarStyle: styles.tabBar,
        tabBarLabel: ({ color }) => <Text style={[styles.tabLabel, { color }]}>{labelMap[route.name]}</Text>,
        tabBarBackground: () => <GlassSurface style={styles.tabBarGlass} borderRadius={0} intensity={46} tint="light" />,
        tabBarIcon: ({ focused }) => {
          const map = { Hotels: focused ? 'business' : 'business-outline', Staff: focused ? 'people' : 'people-outline' };
          return <TabIcon name={map[route.name]} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Hotels" component={PlatformHotelsScreen} />
      <Tab.Screen name="Staff" component={PlatformStaffScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: 'transparent', borderTopWidth: 0, height: 78, paddingTop: 8, paddingBottom: 20, elevation: 0 },
  tabBarGlass: { flex: 1, borderWidth: 0, borderTopWidth: 1 },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
