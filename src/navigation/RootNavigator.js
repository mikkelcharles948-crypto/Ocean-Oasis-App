import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ExperienceSelectScreen from '../screens/experience/ExperienceSelectScreen';
import OpsLoginScreen from '../screens/experience/OpsLoginScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import WelcomeAuthScreen from '../screens/auth/WelcomeAuthScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import MagicLinkScreen from '../screens/auth/MagicLinkScreen';
import ReservationAccessScreen from '../screens/auth/ReservationAccessScreen';
import BiometricLockScreen from '../screens/auth/BiometricLockScreen';
import MainTabs from './MainTabs';
import StaffTabs from './StaffTabs';
import ManagementTabs from './ManagementTabs';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  dark: false,
  colors: {
    primary: colors.deepOcean,
    background: colors.ivory,
    card: colors.white,
    text: colors.charcoal,
    border: colors.border,
    notification: colors.gold,
  },
};

// -----------------------------------------------------------------------
// Top-level routing for the whole platform. This is where the three
// experiences branch: once onboarding is done, the person picks Guest,
// Staff, or Management on ExperienceSelectScreen. Each branch has its own
// auth gate, but all three read from and write to the exact same
// AppContext — so this is genuinely one app with three doors in, not three
// separate apps bolted together.
// -----------------------------------------------------------------------
export default function RootNavigator() {
  const { hasOnboarded, experience, isAuthenticated, opsSession, biometricLockActive, passwordRecoveryActive } = useApp();

  const staffReady = experience === 'staff' && !!opsSession;
  const managementReady = experience === 'management' && !!opsSession;
  const guestReady = experience === 'guest' && isAuthenticated;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : passwordRecoveryActive ? (
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        ) : biometricLockActive ? (
          <Stack.Screen name="BiometricLock" component={BiometricLockScreen} />
        ) : staffReady ? (
          <Stack.Screen name="StaffMain" component={StaffTabs} />
        ) : managementReady ? (
          <Stack.Screen name="ManagementMain" component={ManagementTabs} />
        ) : guestReady ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="ExperienceSelect" component={ExperienceSelectScreen} />
            <Stack.Screen name="OpsLogin" component={OpsLoginScreen} />
            <Stack.Screen name="WelcomeAuth" component={WelcomeAuthScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="MagicLink" component={MagicLinkScreen} />
            <Stack.Screen name="ReservationAccess" component={ReservationAccessScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
