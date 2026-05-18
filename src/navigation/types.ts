import { NavigatorScreenParams } from '@react-navigation/native';

export type DiscoverStackParamList = {
  MatchPool: undefined;
  TwinDebate: { matchId: string; matchName: string };
  CompatibilityReport: { matchId: string; matchName: string; overallScore: number };
  Paywall: undefined;
};

export type MeetingStackParamList = {
  Booking: { matchId: string; matchName: string };
  VideoMeeting: { meetingId: string; meetingUrl: string; matchName: string };
  FeedbackSurvey: { meetingId: string };
  DisputeForm: { matchId: string; matchName: string };
};

export type ProfileStackParamList = {
  Settings: undefined;
  HelpDesk: undefined;
  BlockModal: { matchId: string; matchName: string };
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
