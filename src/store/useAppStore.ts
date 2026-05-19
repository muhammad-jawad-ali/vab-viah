import { create } from 'zustand';
import type { StoredReport, TwinSpec } from '../api/types';
import type {
  OnboardingPersistedLayer,
  OnboardingPersistedState,
} from '../api/onboardingState';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BookingWaliInfo = {
  userWaliName: string;
  userWaliRelation: 'father' | 'uncle' | 'brother' | 'guardian';
  userWaliPhone: string;
  area?: string;
};

// Legacy local-only twin summary shape preserved for screens that still read it.
// The real backend Twin spec lives on `twinSpec`.
interface LocalTwinSummary {
  twinId: string;
  summary: string;
  weights: Record<string, number>;
}

interface AppState {
  // Auth
  token: string | null;
  userId: string | null;
  phoneNumber: string | null;
  isProfileComplete: boolean;
  hasTwin: boolean;

  // Persisted backend Twin spec (loaded via /twin/me after JWT rehydrate).
  twinSpec: TwinSpec | null;

  // User
  user: { name: string; isWaliMode: boolean } | null;

  // Twin onboarding (legacy local-only summary — kept for non-onboarding screens)
  twin: LocalTwinSummary | null;
  voiceTranscript: string;
  scenarioAnswers: { scenarioId: string; choice: string }[];
  isWaliModeEnabled: boolean;

  // Onboarding session (Session 2 — backend-driven flow)
  onboardingSessionId: string | null;
  onboardingLastLayer: OnboardingPersistedLayer;
  onboardingAnsweredCardIds: string[];

  // Premium gate
  isPremium: boolean;
  activeMatchId: string | null;

  // Reports cache keyed by flowId. find_matches emits one trace per flowId
  // covering all 5 debates; after workplan.finished the SSE bus is closed and
  // re-subscribing yields {type:'error', message:'Unknown flowId ...'}. When
  // the user considers a non-first card we read from this cache to render a
  // replay-unavailable variant of TwinDebate instead of hanging on Connecting.
  reportsByFlow: Record<string, StoredReport[]>;

  // Persisted wali contact info captured on the first booking; reused
  // (pre-filled) on subsequent /book/initiate calls so the user doesn't
  // re-type it. Backend requires user + candidate wali on every initiate.
  bookingWaliInfo: BookingWaliInfo | null;

  // Meeting
  activeMeetingId: string | null;
  activeMeetingUrl: string | null;
  meetingsList: {
    id: string;
    matchName: string;
    slotDay: string;
    slotTime: string;
    type: string;
    location?: string;
    status: 'scheduled' | 'pending_feedback' | 'done';
  }[];

  // ─── Actions ───────────────────────────────────────────────────────────────
  setAuth: (token: string, userId: string, meta: { isProfileComplete: boolean; hasTwin: boolean }) => void;
  setPhoneNumber: (phone: string) => void;
  setHasTwin: (hasTwin: boolean) => void;
  setTwinSpec: (spec: TwinSpec | null) => void;
  setTwin: (twin: LocalTwinSummary) => void;
  setVoiceTranscript: (text: string) => void;
  addScenarioAnswer: (answer: { scenarioId: string; choice: string }) => void;
  setWaliModeEnabled: (enabled: boolean) => void;
  toggleWaliMode: () => void;
  setOnboardingState: (state: OnboardingPersistedState) => void;
  clearOnboardingState: () => void;
  setActiveMatch: (matchId: string) => void;
  setMeeting: (meetingId: string, meetingUrl: string) => void;
  addMeeting: (meeting: {
    id: string;
    matchName: string;
    slotDay: string;
    slotTime: string;
    type: string;
    location?: string;
    status: 'scheduled' | 'pending_feedback' | 'done';
  }) => void;
  completeMeeting: (meetingId: string) => void;
  setMeetingStatus: (meetingId: string, status: 'scheduled' | 'pending_feedback' | 'done') => void;
  setPremium: (val: boolean) => void;
  setReportsForFlow: (flowId: string, reports: StoredReport[]) => void;
  setBookingWaliInfo: (info: BookingWaliInfo) => void;
  logout: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // Auth
  token: null,
  userId: null,
  phoneNumber: null,
  isProfileComplete: false,
  hasTwin: false,
  twinSpec: null,

  // User
  user: { name: 'User', isWaliMode: false },

  // Twin (legacy summary)
  twin: null,
  voiceTranscript: '',
  scenarioAnswers: [],
  isWaliModeEnabled: false,

  // Onboarding session
  onboardingSessionId: null,
  onboardingLastLayer: 0,
  onboardingAnsweredCardIds: [],

  // Premium gate
  isPremium: false,
  activeMatchId: null,
  reportsByFlow: {},
  bookingWaliInfo: null,

  // Meeting
  activeMeetingId: null,
  activeMeetingUrl: null,
  meetingsList: [],

  // ─── Action implementations ───────────────────────────────────────────────

  setAuth: (token, userId, { isProfileComplete, hasTwin }) =>
    set({ token, userId, isProfileComplete, hasTwin }),

  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

  setHasTwin: (hasTwin) => set({ hasTwin }),

  setTwinSpec: (twinSpec) => set({ twinSpec, hasTwin: twinSpec !== null }),

  setTwin: (twin) => set({ twin, hasTwin: true }),

  setVoiceTranscript: (voiceTranscript) => set({ voiceTranscript }),

  addScenarioAnswer: (answer) =>
    set((state) => ({
      scenarioAnswers: [
        ...state.scenarioAnswers.filter((a) => a.scenarioId !== answer.scenarioId),
        answer,
      ],
    })),

  setWaliModeEnabled: (isWaliModeEnabled) =>
    set({ isWaliModeEnabled }),

  toggleWaliMode: () =>
    set((state) => ({
      user: state.user ? { ...state.user, isWaliMode: !state.user.isWaliMode } : null,
      isWaliModeEnabled: !state.isWaliModeEnabled,
    })),

  setOnboardingState: ({ sessionId, lastLayer, answeredCardIds }) =>
    set({
      onboardingSessionId: sessionId,
      onboardingLastLayer: lastLayer,
      onboardingAnsweredCardIds: answeredCardIds,
    }),

  clearOnboardingState: () =>
    set({
      onboardingSessionId: null,
      onboardingLastLayer: 0,
      onboardingAnsweredCardIds: [],
    }),

  setActiveMatch: (activeMatchId) => set({ activeMatchId }),

  setMeeting: (activeMeetingId, activeMeetingUrl) =>
    set({ activeMeetingId, activeMeetingUrl }),

  addMeeting: (meeting) =>
    set((state) => ({
      meetingsList: [
        ...state.meetingsList.filter((m) => m.id !== meeting.id),
        meeting,
      ],
    })),

  completeMeeting: (meetingId) =>
    set((state) => ({
      meetingsList: state.meetingsList.map((m) =>
        m.id === meetingId ? { ...m, status: 'done' } : m
      ),
    })),

  setMeetingStatus: (meetingId, status) =>
    set((state) => ({
      meetingsList: state.meetingsList.map((m) =>
        m.id === meetingId ? { ...m, status } : m
      ),
    })),

  setPremium: (isPremium) => set({ isPremium }),

  setReportsForFlow: (flowId, reports) =>
    set((state) => ({
      reportsByFlow: { ...state.reportsByFlow, [flowId]: reports },
    })),

  setBookingWaliInfo: (bookingWaliInfo) => set({ bookingWaliInfo }),

  logout: () =>
    set({
      token: null,
      userId: null,
      phoneNumber: null,
      isProfileComplete: false,
      hasTwin: false,
      twinSpec: null,
      twin: null,
      voiceTranscript: '',
      scenarioAnswers: [],
      isWaliModeEnabled: false,
      onboardingSessionId: null,
      onboardingLastLayer: 0,
      onboardingAnsweredCardIds: [],
      activeMatchId: null,
      reportsByFlow: {},
      bookingWaliInfo: null,
      activeMeetingId: null,
      activeMeetingUrl: null,
      meetingsList: [],
      user: { name: 'User', isWaliMode: false },
    }),
}));
