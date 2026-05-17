import { NavigatorScreenParams } from '@react-navigation/native';

export type DiscoverStackParamList = {
  MatchPool: undefined;
  TwinDebate: undefined;
  CompatibilityReport: undefined;
  Paywall: undefined;
};

export type MeetingStackParamList = {
  Booking: undefined;
  VideoMeeting: undefined;
  FeedbackSurvey: undefined;
  DisputeForm: undefined;
};

export type ProfileStackParamList = {
  Settings: undefined;
  HelpDesk: undefined;
  BlockModal: undefined;
  BasicProfileSetup: undefined;
};

export type MainTabsParamList = {
  DiscoverTab: NavigatorScreenParams<DiscoverStackParamList>;
  MeetingsTab: NavigatorScreenParams<MeetingStackParamList>;
  WaliTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Signup: undefined;
  ProfileSetup: undefined;
  TwinOnboarding: undefined;
  Main: NavigatorScreenParams<MainTabsParamList>;
};
