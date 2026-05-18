// Onboarding session persistence.
//
// Backend's onboarding session is in-memory with a 15-min TTL. We mirror just
// enough on the device so a relaunch mid-flow can route the user back to the
// layer they were on. Stored under one SecureStore key as JSON:
//
//   { sessionId, lastLayer, answeredCardIds }
//
//   - sessionId        backend session handle, also doubles as flowId for SSE
//   - lastLayer        0=fresh, 1=L1 done, 2=L2 done, 3=L3 done, 4=wali done
//   - answeredCardIds  IDs of scenario cards already answered (Layer 2 resume)
//
// On finalize or logout the record is cleared.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';

const KEY = 'rishtaai.onboarding_state';

export type OnboardingPersistedLayer = 0 | 1 | 2 | 3 | 4;

export type OnboardingPersistedState = {
  sessionId: string;
  lastLayer: OnboardingPersistedLayer;
  answeredCardIds: string[];
};

const isWeb = Platform.OS === 'web';
let webMemory: string | null = null;

async function setItem(value: string): Promise<void> {
  if (isWeb) {
    webMemory = value;
    return;
  }
  await SecureStore.setItemAsync(KEY, value);
}

async function getItem(): Promise<string | null> {
  if (isWeb) return webMemory;
  return SecureStore.getItemAsync(KEY);
}

async function deleteItem(): Promise<void> {
  if (isWeb) {
    webMemory = null;
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}

export async function saveOnboardingState(state: OnboardingPersistedState): Promise<void> {
  await setItem(JSON.stringify(state));
  useAppStore.getState().setOnboardingState(state);
}

export async function loadOnboardingState(): Promise<OnboardingPersistedState | null> {
  const raw = await getItem();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OnboardingPersistedState;
    if (!parsed.sessionId || typeof parsed.lastLayer !== 'number') return null;
    useAppStore.getState().setOnboardingState(parsed);
    return parsed;
  } catch {
    return null;
  }
}

export async function clearOnboardingState(): Promise<void> {
  await deleteItem();
  useAppStore.getState().clearOnboardingState();
}
