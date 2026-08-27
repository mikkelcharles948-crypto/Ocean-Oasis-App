import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components/AppText';
import { useTranslation } from 'react-i18next';

import StaffHomeScreen from '../screens/staff/StaffHomeScreen';
import StaffRequestsScreen from '../screens/staff/StaffRequestsScreen';
import StaffRoomsScreen from '../screens/staff/StaffRoomsScreen';
import StaffNewBookingScreen from '../screens/staff/StaffNewBookingScreen';
import StaffActivitiesScreen from '../screens/staff/StaffActivitiesScreen';
import StaffMoreScreen from '../screens/staff/StaffMoreScreen';
import StaffGuestsScreen from '../screens/staff/StaffGuestsScreen';
import StaffMaintenanceScreen from '../screens/staff/StaffMaintenanceScreen';
import StaffEventsScreen from '../screens/staff/StaffEventsScreen';
import StaffFeedbackScreen from '../screens/staff/StaffFeedbackScreen';
import StaffNotificationsScreen from '../screens/staff/StaffNotificationsScreen';
import StaffProfileScreen from '../screens/staff/StaffProfileScreen';
import { colors } from '../theme/theme';
import { useApp } from '../context/AppContext';
import GlassSurface from '../components/GlassSurface';
import Logo from '../components/Logo';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const screenOptions = { headerShown: false, contentStyle: { backgroundColor: colors.ivory } };

function MoreStackNav() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StaffMoreMain" component={StaffMoreScreen} />
      <Stack.Screen name="StaffGuests" component={StaffGuestsScreen} />
      <Stack.Screen name="StaffMaintenance" component={StaffMaintenanceScreen} />
      <Stack.Screen name="StaffEvents" component={StaffEventsScreen} />
      <Stack.Screen name="StaffFeedback" component={StaffFeedbackScreen} />
      <Stack.Screen name="StaffNotifications" component={StaffNotificationsScreen} />
      <Stack.Screen name="StaffProfile" component={StaffProfileScreen} />
    </Stack.Navigator>
  );
}

function RoomsStackNav() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StaffRoomsMain" component={StaffRoomsScreen} />
      <Stack.Screen name="StaffNewBooking" component={StaffNewBookingScreen} />
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

export default function StaffTabs() {
  const { t } = useTranslation();
  const { unreadStaffNotificationCount } = useApp();
  const labelMap = {
    Dashboard: t('staff.tabs.dashboard'),
    Requests: t('nav.requests'),
    Rooms: t('staff.tabs.rooms'),
    Activities: t('staff.activities.title'),
    More: t('staff.moreScreen.title'),
  };
  // adjustsFontSizeToFit lets a longer translation (e.g. "Tableau de bord")
  // shrink slightly to fit the narrow per-tab width rather than truncate
  // with an ellipsis.
  const renderTabLabel = (routeName) => ({ color }) => (
    <Text style={[styles.tabLabel, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
      {labelMap[routeName]}
    </Text>
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.deepOcean,
        tabBarInactiveTintColor: colors.slate,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarLabel: renderTabLabel(route.name),
        tabBarBackground: () => (
          <GlassSurface style={styles.tabBarGlass} borderRadius={0} intensity={46} tint="light">
            <View style={styles.tabBarLogoWrap} pointerEvents="none">
              <Logo size={66} variant="mark" />
            </View>
          </GlassSurface>
        ),
        tabBarIcon: ({ focused }) => {
          const map = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Requests: focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline',
            Rooms: focused ? 'bed' : 'bed-outline',
            Activities: focused ? 'flag' : 'flag-outline',
            More: focused ? 'menu' : 'menu-outline',
          };
          return <TabIcon name={map[route.name]} focused={focused} />;
        },
        tabBarBadge: route.name === 'More' && unreadStaffNotificationCount > 0 ? unreadStaffNotificationCount : undefined,
      })}
    >
      <Tab.Screen name="Dashboard" component={StaffHomeScreen} />
      <Tab.Screen name="Requests" component={StaffRequestsScreen} />
      <Tab.Screen name="Rooms" component={RoomsStackNav} />
      <Tab.Screen name="Activities" component={StaffActivitiesScreen} />
      <Tab.Screen name="More" component={MoreStackNav} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent', borderTopWidth: 0, height: 144, paddingTop: 72, paddingBottom: 24,
    elevation: 0,
  },
  tabBarGlass: { flex: 1, borderWidth: 0, borderTopWidth: 1 },
  tabBarLogoWrap: {
    position: 'absolute', top: 4, left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
