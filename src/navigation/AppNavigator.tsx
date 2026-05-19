import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';

// Types
import {
  RootStackParamList,
  MainTabsParamList,
  DiscoverStackParamList,
  MeetingStackParamList,
  ProfileStackParamList,
  OnboardingStackParamList,
} from './types';

// Auth & Onboarding
import { SignupScreen } from '../screens/SignupScreen';
import { OnboardingLayer1Screen } from '../screens/onboarding/OnboardingLayer1Screen';
import { OnboardingLayer2Screen } from '../screens/onboarding/OnboardingLayer2Screen';
import { OnboardingLayer3Screen } from '../screens/onboarding/OnboardingLayer3Screen';
import { OnboardingWaliScreen } from '../screens/onboarding/OnboardingWaliScreen';
import { OnboardingFinalizeScreen } from '../screens/onboarding/OnboardingFinalizeScreen';

// Discovery & Gating
import { PaywallScreen } from '../screens/PaywallScreen';
import { MatchPoolScreen } from '../screens/MatchPoolScreen';
import { TwinDebateScreen } from '../screens/TwinDebateScreen';
import { CompatibilityReportScreen } from '../screens/CompatibilityReportScreen';
import { ReplayDebateScreen } from '../screens/ReplayDebateScreen';

// Engagement & Safety
import { BookingScreen } from '../screens/BookingScreen';
import { VideoMeetingScreen } from '../screens/VideoMeetingScreen';
import { FeedbackSurveyScreen } from '../screens/FeedbackSurveyScreen';
import { DisputeFormScreen } from '../screens/DisputeFormScreen';
import { BlockModalScreen } from '../screens/BlockModalScreen';
import { HelpDeskScreen } from '../screens/HelpDeskScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();
const Discover = createNativeStackNavigator<DiscoverStackParamList>();
const Meeting = createNativeStackNavigator<MeetingStackParamList>();
const Profile = createNativeStackNavigator<ProfileStackParamList>();
const Onboarding = createNativeStackNavigator<OnboardingStackParamList>();

const DiscoverStack = () => (
  <Discover.Navigator screenOptions={{ headerShown: false }}>
    <Discover.Screen name="MatchPool" component={MatchPoolScreen} />
    <Discover.Screen name="TwinDebate" component={TwinDebateScreen} />
    <Discover.Screen name="CompatibilityReport" component={CompatibilityReportScreen} />
    <Discover.Screen name="ReplayDebate" component={ReplayDebateScreen} />
    <Discover.Screen name="Paywall" component={PaywallScreen} />
  </Discover.Navigator>
);

const MeetingStack = () => (
  <Meeting.Navigator screenOptions={{ headerShown: false }}>
    <Meeting.Screen name="Booking" component={BookingScreen} />
    <Meeting.Screen name="VideoMeeting" component={VideoMeetingScreen} />
    <Meeting.Screen name="FeedbackSurvey" component={FeedbackSurveyScreen} />
    <Meeting.Screen name="DisputeForm" component={DisputeFormScreen} />
  </Meeting.Navigator>
);

const ProfileStack = () => (
  <Profile.Navigator screenOptions={{ headerShown: false }}>
    <Profile.Screen name="Settings" component={SettingsScreen} />
    <Profile.Screen name="HelpDesk" component={HelpDeskScreen} />
    <Profile.Screen name="BlockModal" component={BlockModalScreen} />
  </Profile.Navigator>
);

// Onboarding sub-stack — back gestures disabled so the user can't accidentally
// step out of the flow mid-Layer.
const OnboardingStack = () => {
  const lastLayer = useAppStore((s) => s.onboardingLastLayer);
  const initial: keyof OnboardingStackParamList =
    lastLayer >= 4
      ? 'OnboardingFinalize'
      : lastLayer === 3
      ? 'OnboardingWali'
      : lastLayer === 2
      ? 'OnboardingLayer3'
      : lastLayer === 1
      ? 'OnboardingLayer2'
      : 'OnboardingLayer1';

  return (
    <Onboarding.Navigator
      initialRouteName={initial}
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Onboarding.Screen name="OnboardingLayer1" component={OnboardingLayer1Screen} />
      <Onboarding.Screen name="OnboardingLayer2" component={OnboardingLayer2Screen} />
      <Onboarding.Screen name="OnboardingLayer3" component={OnboardingLayer3Screen} />
      <Onboarding.Screen name="OnboardingWali" component={OnboardingWaliScreen} />
      <Onboarding.Screen name="OnboardingFinalize" component={OnboardingFinalizeScreen} />
    </Onboarding.Navigator>
  );
};

// Custom Minimal Pure-View Icons
const MatchesIcon = ({ focused }: { focused: boolean }) => (
  <View className="w-6 h-6 justify-center items-center">
    <View
      style={{ borderColor: focused ? '#064e3b' : '#94a3b8' }}
      className="w-3.5 h-3.5 rounded-full border-[1.5px] absolute left-0.5"
    />
    <View
      style={{ borderColor: focused ? '#064e3b' : '#94a3b8' }}
      className="w-3.5 h-3.5 rounded-full border-[1.5px] absolute right-0.5"
    />
  </View>
);

const MeetingsIcon = ({ focused }: { focused: boolean }) => (
  <View className="w-6 h-6 justify-center items-center">
    {/* Calendar Body */}
    <View
      style={{ borderColor: focused ? '#064e3b' : '#94a3b8' }}
      className="w-[18px] h-[18px] rounded-md border-[1.5px] pt-1 items-center justify-center"
    >
      <View
        style={{ backgroundColor: focused ? '#064e3b' : '#94a3b8' }}
        className="w-2.5 h-[1.5px] mb-0.5"
      />
      <View
        style={{ backgroundColor: focused ? '#064e3b' : '#94a3b8' }}
        className="w-2.5 h-[1.5px]"
      />
    </View>
    {/* Binder clips */}
    <View
      style={{ backgroundColor: focused ? '#064e3b' : '#94a3b8' }}
      className="w-[2px] h-[4px] absolute top-[1px] left-1.5"
    />
    <View
      style={{ backgroundColor: focused ? '#064e3b' : '#94a3b8' }}
      className="w-[2px] h-[4px] absolute top-[1px] right-1.5"
    />
  </View>
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <View className="w-6 h-6 justify-center items-center">
    <View
      style={{ borderColor: focused ? '#064e3b' : '#94a3b8' }}
      className="w-[9px] h-[9px] rounded-full border-[1.5px] mb-0.5"
    />
    <View
      style={{ borderColor: focused ? '#064e3b' : '#94a3b8' }}
      className="w-4 h-1.5 rounded-t-[6px] border-[1.5px] border-b-0"
    />
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fdfbf7', // Warm Alabaster Background
        borderTopColor: 'rgba(6, 78, 59, 0.08)', // Subtle primary green border
        height: 64,
        paddingBottom: 10,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#064e3b', // Deep Emerald
      tabBarInactiveTintColor: '#94a3b8', // Inactive slate
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.2,
      },
    }}
  >
    <Tab.Screen
      name="DiscoverTab"
      component={DiscoverStack}
      options={{
        title: 'Matches',
        tabBarIcon: ({ focused }) => <MatchesIcon focused={focused} />,
      }}
    />
    <Tab.Screen
      name="MeetingsTab"
      component={MeetingStack}
      options={{
        title: 'Meetings',
        tabBarIcon: ({ focused }) => <MeetingsIcon focused={focused} />,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileStack}
      options={{
        title: 'Profile',
        tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  // App.tsx awaits loadAuth() + the optional /twin/me call before mounting,
  // so by the time this renders Zustand is fully hydrated. Routing decision:
  //   - no token             → Signup
  //   - token + hasTwin      → Main
  //   - token + !hasTwin     → Onboarding (sub-stack picks layer by lastLayer)
  const token = useAppStore((s) => s.token);
  const hasTwin = useAppStore((s) => s.hasTwin);

  const initialRouteName: keyof RootStackParamList = !token
    ? 'Signup'
    : hasTwin
    ? 'Main'
    : 'Onboarding';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingStack} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
};
