import { create } from 'zustand';

interface Match {
  id: string;
  name: string;
  blurAvatar: string;
  compatibility: number;
  tags: string[];
  status: 'new' | 'negotiating' | 'revealed';
}

interface AppState {
  user: { name: string; isWaliMode: boolean } | null;
  matches: Match[];
  isPremium: boolean;
  debateLog: { speaker: 'userTwin' | 'candidateTwin' | 'moderator', text: string }[];
  toggleWaliMode: () => void;
  setPremium: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: { name: 'User', isWaliMode: false },
  isPremium: false,
  matches: [
    { id: '1', name: 'Ayesha K.', blurAvatar: 'https://i.pravatar.cc/150?u=1', compatibility: 94, tags: ['Deen Aligned', 'Career Focused'], status: 'new' },
    { id: '2', name: 'Fatima Z.', blurAvatar: 'https://i.pravatar.cc/150?u=2', compatibility: 88, tags: ['Family Oriented', 'Same Sect'], status: 'new' },
  ],
  debateLog: [
    { speaker: 'userTwin', text: 'Career growth is essential. Relocation is acceptable if parity remains.' },
    { speaker: 'candidateTwin', text: 'We prioritize family proximity, but are open to 1-2 years abroad.' },
    { speaker: 'moderator', text: 'Friction point identified: Geography. Potential compromise mapped.' },
  ],
  toggleWaliMode: () => set((state) => ({ user: state.user ? { ...state.user, isWaliMode: !state.user.isWaliMode } : null })),
  setPremium: (isPremium) => set({ isPremium }),
}));
