import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import ManagementOverviewScreen from '../screens/management/ManagementOverviewScreen';
import ManagementGuestExperienceScreen from '../screens/management/ManagementGuestExperienceScreen';
import ManagementOperationsScreen from '../screens/management/ManagementOperationsScreen';
import ManagementPromotionsScreen from '../screens/management/ManagementPromotionsScreen';
import ManagementMoreScreen from '../screens/management/ManagementMoreScreen';
import ManagementRevenueScreen from '../screens/management/ManagementRevenueScreen';
import ManagementActivityAnalyticsScreen from '../screens/management/ManagementActivityAnalyticsScreen';
import ManagementContentScreen from '../screens/management/ManagementContentScreen';
import ManagementStaffPerformanceScreen from '../screens/management/ManagementStaffPerformanceScreen';
import ManagementAuditLogScreen from '../screens/management/ManagementAuditLogScreen';
import ManagementSettingsScreen from '../screens/management/ManagementSettingsScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const screenOptions = { headerShown: false, contentStyle: { backgroundColor: colors.ivory } };

function MoreStackNav() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ManagementMoreMain" component={ManagementMoreScreen} />
      <Stack.Screen name="ManagementRevenue" component={ManagementRevenueScreen} />
      <Stack.Screen name="ManagementActivities" component={ManagementActivityAnalyticsScreen} />
      <Stack.Screen name="ManagementContent" component={ManagementContentScreen} />
      <Stack.Screen name="ManagementStaffPerformance" component={ManagementStaffPerformanceScreen} />
      <Stack.Screen name="ManagementAuditLog" component={ManagementAuditLogScreen} />
      <Stack.Screen name="ManagementSettings" component={ManagementSettingsScreen} />
    </Stack.Navigator>
  );
}

function TabIcon({ name, focused }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={22} color={focused ? colors.deepOcean : colors.slate} />
    </View>
  );
}

export default function ManagementTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.deepOcean,
        tabBarInactiveTintColor: colors.slate,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const map = {
            Overview: focused ? 'stats-chart' : 'stats-chart-outline',
            Experience: focused ? 'star' : 'star-outline',
            Operations: focused ? 'speedometer' : 'speedometer-outline',
            Promotions: focused ? 'pricetag' : 'pricetag-outline',
            More: focused ? 'menu' : 'menu-outline',
          };
          return <TabIcon name={map[route.name]} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Overview" component={ManagementOverviewScreen} />
      <Tab.Screen name="Experience" component={ManagementGuestExperienceScreen} />
      <Tab.Screen name="Operations" component={ManagementOperationsScreen} />
      <Tab.Screen name="Promotions" component={ManagementPromotionsScreen} />
      <Tab.Screen name="More" component={MoreStackNav} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white, borderTopWidth: 0, height: 84, paddingTop: 8, paddingBottom: 24,
    shadowColor: '#0B3B45', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
