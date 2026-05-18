import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Types
import { RootStackParamList, MainTabsParamList, DiscoverStackParamList, MeetingStackParamList, ProfileStackParamList } from './types';

// Auth & Onboarding
import { SignupScreen } from '../screens/SignupScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { TwinOnboardingScreen } from '../screens/TwinOnboardingScreen';
import { WaliDashboardScreen } from '../screens/WaliDashboardScreen';

// Discovery & Gating
import { PaywallScreen } from '../screens/PaywallScreen';
import { MatchPoolScreen } from '../screens/MatchPoolScreen';
import { TwinDebateScreen } from '../screens/TwinDebateScreen';
import { CompatibilityReportScreen } from '../screens/CompatibilityReportScreen';

// Engagement & Safety
import { BookingScreen } from '../screens/BookingScreen';
import { VideoMeetingScreen } from '../screens/VideoMeetingScreen';
import { FeedbackSurveyScreen } from '../screens/FeedbackSurveyScreen';
import { DisputeFormScreen } from '../screens/DisputeFormScreen';
import { BlockModalScreen } from '../screens/BlockModalScreen';
import { HelpDeskScreen } from '../screens/HelpDeskScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BasicProfileSetup } from '../screens/BasicProfileSetup';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();
const Discover = createNativeStackNavigator<DiscoverStackParamList>();
const Meeting = createNativeStackNavigator<MeetingStackParamList>();
const Profile = createNativeStackNavigator<ProfileStackParamList>();

const DiscoverStack = () => (
  <Discover.Navigator screenOptions={{ headerShown: false }}>
    <Discover.Screen name="MatchPool" component={MatchPoolScreen} />
    <Discover.Screen name="TwinDebate" component={TwinDebateScreen} />
    <Discover.Screen name="CompatibilityReport" component={CompatibilityReportScreen} />
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
    <Profile.Screen name="BasicProfileSetup" component={BasicProfileSetup} />
  </Profile.Navigator>
);

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

const WaliIcon = ({ focused }: { focused: boolean }) => (
  <View className="w-6 h-6 justify-center items-center">
    <View
      style={{ borderColor: focused ? '#064e3b' : '#94a3b8' }}
      className="w-4 h-[18px] border-[1.5px] rounded-b-[7px] rounded-t-[2px] items-center justify-center"
    >
      <View
        style={{ backgroundColor: focused ? '#064e3b' : '#94a3b8' }}
        className="w-1 h-1 rounded-full mb-0.5"
      />
      <View
        style={{ backgroundColor: focused ? '#064e3b' : '#94a3b8' }}
        className="w-[1.5px] h-1"
      />
    </View>
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

import { View } from 'react-native';

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
      name="WaliTab"
      component={WaliDashboardScreen}
      options={{
        title: 'Wali',
        tabBarIcon: ({ focused }) => <WaliIcon focused={focused} />,
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
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="TwinOnboarding" component={TwinOnboardingScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
};
