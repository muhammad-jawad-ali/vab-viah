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

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#f1f5f9', height: 60, paddingBottom: 8 },
      tabBarActiveTintColor: '#064e3b',
      tabBarInactiveTintColor: '#94a3b8',
    }}
  >
    <Tab.Screen name="DiscoverTab" component={DiscoverStack} options={{ title: 'Matches' }} />
    <Tab.Screen name="MeetingsTab" component={MeetingStack} options={{ title: 'Meetings' }} />
    <Tab.Screen name="WaliTab" component={WaliDashboardScreen} options={{ title: 'Wali' }} />
    <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
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
