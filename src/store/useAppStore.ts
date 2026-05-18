import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Match {
  id: string;
  name: string;
  blurAvatar: string;
  compatibility: number;
  tags: string[];
  status: 'new' | 'negotiating' | 'revealed';
}

interface DebateMessage {
  speaker: 'userTwin' | 'candidateTwin' | 'moderator';
  text: string;
}

interface TwinSpec {
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

  // User
  user: { name: string; isWaliMode: boolean } | null;

  // Twin onboarding
  twin: TwinSpec | null;
  voiceTranscript: string;
  scenarioAnswers: { scenarioId: string; choice: string }[];
  isWaliModeEnabled: boolean;

  // Matches & debate
  matches: Match[];
  isPremium: boolean;
  activeMatchId: string | null;
  debateLog: DebateMessage[];

  // Meeting
  activeMeetingId: string | null;
  activeMeetingUrl: string | null;

  // ─── Actions ───────────────────────────────────────────────────────────────
  setAuth: (token: string, userId: string, meta: { isProfileComplete: boolean; hasTwin: boolean }) => void;
  setPhoneNumber: (phone: string) => void;
  setTwin: (twin: TwinSpec) => void;
  setVoiceTranscript: (text: string) => void;
  addScenarioAnswer: (answer: { scenarioId: string; choice: string }) => void;
  setWaliModeEnabled: (enabled: boolean) => void;
  toggleWaliMode: () => void;
  setActiveMatch: (matchId: string) => void;
  setMeeting: (meetingId: string, meetingUrl: string) => void;
  setPremium: (val: boolean) => void;
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

  // User
  user: { name: 'User', isWaliMode: false },

  // Twin
  twin: null,
  voiceTranscript: '',
  scenarioAnswers: [],
  isWaliModeEnabled: false,

  // Matches
  matches: [
    { id: '1', name: 'Ayesha K.', blurAvatar: 'https://i.pravatar.cc/150?u=1', compatibility: 94, tags: ['Deen Aligned', 'Career Focused'], status: 'new' },
    { id: '2', name: 'Fatima Z.', blurAvatar: 'https://i.pravatar.cc/150?u=2', compatibility: 88, tags: ['Family Oriented', 'Same Sect'], status: 'new' },
  ],
  isPremium: false,
  activeMatchId: null,

  // Debate log (default seed for screens that don't use route params)
  debateLog: [
    { speaker: 'userTwin', text: 'Career growth is essential. Relocation is acceptable if parity remains.' },
    { speaker: 'candidateTwin', text: 'We prioritize family proximity, but are open to 1-2 years abroad.' },
    { speaker: 'moderator', text: 'Friction point identified: Geography. Potential compromise mapped.' },
  ],

  // Meeting
  activeMeetingId: null,
  activeMeetingUrl: null,

  // ─── Action implementations ───────────────────────────────────────────────

  setAuth: (token, userId, { isProfileComplete, hasTwin }) =>
    set({ token, userId, isProfileComplete, hasTwin }),

  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

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

  setActiveMatch: (activeMatchId) => set({ activeMatchId }),

  setMeeting: (activeMeetingId, activeMeetingUrl) =>
    set({ activeMeetingId, activeMeetingUrl }),

  setPremium: (isPremium) => set({ isPremium }),

  logout: () =>
    set({
      token: null,
      userId: null,
      phoneNumber: null,
      isProfileComplete: false,
      hasTwin: false,
      twin: null,
      voiceTranscript: '',
      scenarioAnswers: [],
      isWaliModeEnabled: false,
      activeMatchId: null,
      activeMeetingId: null,
      activeMeetingUrl: null,
      user: { name: 'User', isWaliMode: false },
    }),
}));
