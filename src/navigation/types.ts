import { NavigatorScreenParams } from '@react-navigation/native';

export type DiscoverStackParamList = {
  MatchPool: undefined;
  // flowId is the match_<uuid> returned by POST /match/request. The candidate
  // twinId + display name carry through so the screens can fetch the right
  // row from /match/results without an extra lookup.
  TwinDebate: { flowId: string; candidateTwinId: string; displayName: string };
  CompatibilityReport: { flowId: string; candidateTwinId: string; displayName: string };
  ReplayDebate: { flowId: string; candidateTwinId: string; displayName: string };
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
};

export type MainTabsParamList = {
  DiscoverTab: NavigatorScreenParams<DiscoverStackParamList>;
  MeetingsTab: NavigatorScreenParams<MeetingStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Onboarding flow — 4 layers + finalize. Each screen owns a slice of the
// backend onboarding session (sessionId is persisted in Zustand, not routed).
export type OnboardingStackParamList = {
  OnboardingLayer1: undefined;
  OnboardingLayer2: undefined;
  OnboardingLayer3: undefined;
  OnboardingWali: undefined;
  OnboardingFinalize: undefined;
};

export type RootStackParamList = {
  Signup: undefined;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabsParamList>;
};
