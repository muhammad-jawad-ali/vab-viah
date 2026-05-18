import { create } from 'zustand';

export interface UserProfile {
  name: string;
  gender: string;
  age: string;
  height: string;
  city: string;
  profession: string;
  education: string;
  isWaliMode: boolean;
  waliPhone?: string;
  sect?: string;
  deenLevel?: string;
}

export interface Match {
  id: string;
  name: string;
  blurAvatar: string;
  compatibility: number;
  tags: string[];
  status: 'new' | 'negotiating' | 'revealed';
  age: number;
  city: string;
  profession: string;
}

export interface DebateMessage {
  speaker: 'userTwin' | 'candidateTwin' | 'moderator';
  text: string;
}

interface AppState {
  user: UserProfile | null;
  matches: Match[];
  isPremium: boolean;
  debateLog: DebateMessage[];
  currentMatchId: string | null;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  toggleWaliMode: () => void;
  setPremium: (val: boolean) => void;
  updateMatchStatus: (matchId: string, status: Match['status']) => void;
  setCurrentMatchId: (matchId: string | null) => void;
  clearDebateLog: () => void;
  addDebateMessage: (msg: DebateMessage) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    name: 'Ayesha Khan',
    gender: 'Female',
    age: '24',
    height: "5'4\"",
    city: 'Lahore',
    profession: 'Clinical Psychologist',
    education: 'MSc Clinical Psychology',
    isWaliMode: false,
    waliPhone: '',
    sect: 'Sunni',
    deenLevel: 'Practicing',
  },
  isPremium: false,
  currentMatchId: null,
  matches: [
    {
      id: '1',
      name: 'Bilal Siddiqui',
      blurAvatar: 'https://i.pravatar.cc/150?u=11',
      compatibility: 94,
      tags: ['Deen Aligned', 'Career Focused', 'Same Sect'],
      status: 'new',
      age: 27,
      city: 'Karachi',
      profession: 'Software Engineer'
    },
    {
      id: '2',
      name: 'Zainab Bibi',
      blurAvatar: 'https://i.pravatar.cc/150?u=22',
      compatibility: 88,
      tags: ['Family Oriented', 'Joint Family Setup'],
      status: 'new',
      age: 24,
      city: 'Lahore',
      profession: 'Educator'
    },
    {
      id: '3',
      name: 'Hamza Malik',
      blurAvatar: 'https://i.pravatar.cc/150?u=33',
      compatibility: 82,
      tags: ['Flexible Lifestyle', 'Sect Compatible'],
      status: 'new',
      age: 29,
      city: 'Islamabad',
      profession: 'Chartered Accountant'
    },
    { id: '4', name: 'Zainab F.', blurAvatar: 'https://i.pravatar.cc/150?u=44', compatibility: 78, tags: ['Teacher', 'Family-oriented'], status: 'new', age: 26, city: 'Lahore', profession: 'Teacher' },
    { id: '5', name: 'Hassan K.', blurAvatar: 'https://i.pravatar.cc/150?u=55', compatibility: 60, tags: ['Banker', 'Extrovert'], status: 'new', age: 31, city: 'Karachi', profession: 'Banker' },
    { id: '6', name: 'Fatima A.', blurAvatar: 'https://i.pravatar.cc/150?u=66', compatibility: 71, tags: ['Architect', 'Creative'], status: 'new', age: 28, city: 'Islamabad', profession: 'Architect' },
    { id: '7', name: 'Usman R.', blurAvatar: 'https://i.pravatar.cc/150?u=77', compatibility: 85, tags: ['Engineer', 'Introvert'], status: 'new', age: 33, city: 'Lahore', profession: 'Engineer' },
    { id: '8', name: 'Ayesha S.', blurAvatar: 'https://i.pravatar.cc/150?u=88', compatibility: 68, tags: ['Doctor', 'Ambitious'], status: 'new', age: 27, city: 'Karachi', profession: 'Doctor' },
    { id: '9', name: 'Tariq M.', blurAvatar: 'https://i.pravatar.cc/150?u=99', compatibility: 55, tags: ['Sales', 'Frequent Traveler'], status: 'new', age: 34, city: 'Dubai', profession: 'Sales Manager' },
    { id: '10', name: 'Zahra B.', blurAvatar: 'https://i.pravatar.cc/150?u=101', compatibility: 92, tags: ['Writer', 'Homebody'], status: 'new', age: 25, city: 'Islamabad', profession: 'Writer' },
    { id: '11', name: 'Ali W.', blurAvatar: 'https://i.pravatar.cc/150?u=111', compatibility: 75, tags: ['Chef', 'Foodie'], status: 'new', age: 30, city: 'Lahore', profession: 'Chef' },
    { id: '12', name: 'Sana H.', blurAvatar: 'https://i.pravatar.cc/150?u=121', compatibility: 81, tags: ['Lawyer', 'Activist'], status: 'new', age: 29, city: 'Karachi', profession: 'Lawyer' }
  ],
  debateLog: [
    { speaker: 'userTwin', text: 'Assalam o Alaikum. Career growth is extremely essential to me, and I wish to continue practice post-marriage.' },
    { speaker: 'candidateTwin', text: 'Walaikum Assalam. I fully support professional career growth. Family balance is also crucial for me.' },
    { speaker: 'moderator', text: 'Round 1: Career & Ambition. Strong alignment detected: Both value professional work with mutual support.' }
  ],
  setUserProfile: (profile) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...profile } : {
        name: '',
        gender: 'Female',
        age: '',
        height: '',
        city: '',
        profession: '',
        education: '',
        isWaliMode: false,
        ...profile
      } as UserProfile
    })),
  toggleWaliMode: () =>
    set((state) => ({
      user: state.user ? { ...state.user, isWaliMode: !state.user.isWaliMode } : null
    })),
  setPremium: (isPremium) => set({ isPremium }),
  updateMatchStatus: (matchId, status) =>
    set((state) => ({
      matches: state.matches.map((m) => (m.id === matchId ? { ...m, status } : m))
    })),
  setCurrentMatchId: (currentMatchId) => set({ currentMatchId }),
  clearDebateLog: () => set({ debateLog: [] }),
  addDebateMessage: (msg) =>
    set((state) => ({
      debateLog: [...state.debateLog, msg]
    }))
}));
