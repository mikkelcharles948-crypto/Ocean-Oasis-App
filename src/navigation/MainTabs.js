import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components/AppText';
import { useTranslation } from 'react-i18next';

import HomeScreen from '../screens/home/HomeScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import MyStayScreen from '../screens/mystay/MyStayScreen';
import RequestsScreen from '../screens/requests/RequestsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProfileDetailsScreen from '../screens/profile/ProfileDetailsScreen';
import PreferencesScreen from '../screens/profile/PreferencesScreen';
import { addSharedScreens } from './sharedScreens';
import { colors } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import GlassSurface from '../components/GlassSurface';
import Logo from '../components/Logo';

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

function TabIcon({ name, focused, colors }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={22} color={focused ? colors.deepOcean : colors.slate} />
    </View>
  );
}

export default function MainTabs() {
  const { unreadNotificationCount } = useApp();
  const { colors: themeColors } = useTheme();
  const { t } = useTranslation();
  // Translated tab labels (previously hardcoded to the English route name,
  // which meant this tab bar silently stayed in English no matter which
  // language was selected). adjustsFontSizeToFit lets a longer translation
  // (e.g. "Mon séjour", "我的住宿") shrink slightly rather than truncate
  // with an ellipsis on the narrow per-tab width.
  const labelMap = {
    Home: t('nav.home'),
    Explore: t('nav.explore'),
    'My Stay': t('nav.myStay'),
    Requests: t('nav.requests'),
    Profile: t('nav.profile'),
  };
  const renderTabLabel = (routeName) => ({ color }) => (
    <Text style={[styles.tabLabel, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
      {labelMap[routeName]}
    </Text>
  );
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: themeColors.deepOcean,
        tabBarInactiveTintColor: themeColors.slate,
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
            Home: focused ? 'home' : 'home-outline',
            Explore: focused ? 'compass' : 'compass-outline',
            'My Stay': focused ? 'bed' : 'bed-outline',
            Requests: focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline',
            Profile: focused ? 'person-circle' : 'person-circle-outline',
          };
          return <TabIcon name={map[route.name]} focused={focused} colors={themeColors} />;
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
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    height: 144,
    paddingTop: 72,
    paddingBottom: 24,
    elevation: 0,
  },
  tabBarGlass: {
    flex: 1,
    borderWidth: 0,
    borderTopWidth: 1,
  },
  tabBarLogoWrap: {
    position: 'absolute', top: 4, left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
