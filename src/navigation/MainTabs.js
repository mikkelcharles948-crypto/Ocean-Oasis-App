import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import HomeScreen from '../screens/home/HomeScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import MyStayScreen from '../screens/mystay/MyStayScreen';
import RequestsScreen from '../screens/requests/RequestsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProfileDetailsScreen from '../screens/profile/ProfileDetailsScreen';
import PreferencesScreen from '../screens/profile/PreferencesScreen';
import { addSharedScreens } from './sharedScreens';
import { colors } from '../theme/theme';
import { useApp } from '../context/AppContext';

const Tab = createBottomTabNavigator();
const screenOptions = { headerShown: false, contentStyle: { backgroundColor: colors.ivory } };

function HomeStackNav() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function ExploreStackNav() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function MyStayStackNav() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MyStayMain" component={MyStayScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function RequestsStackNav() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="RequestsMain" component={RequestsScreen} />
      {addSharedScreens(Stack)}
    </Stack.Navigator>
  );
}

function ProfileStackNav() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      {addSharedScreens(Stack)}
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

export default function MainTabs() {
  const { unreadNotificationCount } = useApp();
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
            Home: focused ? 'home' : 'home-outline',
            Explore: focused ? 'compass' : 'compass-outline',
            'My Stay': focused ? 'bed' : 'bed-outline',
            Requests: focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline',
            Profile: focused ? 'person-circle' : 'person-circle-outline',
          };
          return <TabIcon name={map[route.name]} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNav} />
      <Tab.Screen name="Explore" component={ExploreStackNav} />
      <Tab.Screen name="My Stay" component={MyStayStackNav} />
      <Tab.Screen name="Requests" component={RequestsStackNav} />
      <Tab.Screen name="Profile" component={ProfileStackNav} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    height: 84,
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: '#0B3B45',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
