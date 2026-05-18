// Auth persistence layer.
//
// JWT (Supabase access_token) lives in expo-secure-store — encrypted at rest
// on iOS/Android. We mirror it into Zustand for fast synchronous reads from
// React components.
//
// Flow:
//   - On app boot:        loadAuth() rehydrates Zustand from SecureStore.
//   - On OTP verify:      saveAuth(token, userId) writes both.
//   - On 401 / logout:    clearAuth() wipes both.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';

const TOKEN_KEY = 'rishtaai.access_token';
const USER_ID_KEY = 'rishtaai.user_id';

// SecureStore is not implemented on web. Fall back to in-memory only so the
// app boots in Expo web previews — we don't ship to web, but the harness uses
// it for some checks.
const isWeb = Platform.OS === 'web';
const memory: { token: string | null; userId: string | null } = {
  token: null,
  userId: null,
};

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (key === TOKEN_KEY) memory.token = value;
    if (key === USER_ID_KEY) memory.userId = value;
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    if (key === TOKEN_KEY) return memory.token;
    if (key === USER_ID_KEY) return memory.userId;
    return null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    if (key === TOKEN_KEY) memory.token = null;
    if (key === USER_ID_KEY) memory.userId = null;
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveAuth(token: string, userId: string | null): Promise<void> {
  await setItem(TOKEN_KEY, token);
  if (userId) await setItem(USER_ID_KEY, userId);
  useAppStore.getState().setAuth(token, userId ?? '', {
    isProfileComplete: false,
    hasTwin: false,
  });
}

export async function loadAuth(): Promise<{ token: string; userId: string | null } | null> {
  const token = await getItem(TOKEN_KEY);
  if (!token) return null;
  const userId = await getItem(USER_ID_KEY);
  useAppStore.getState().setAuth(token, userId ?? '', {
    isProfileComplete: false,
    hasTwin: false,
  });
  return { token, userId };
}

export async function clearAuth(): Promise<void> {
  await deleteItem(TOKEN_KEY);
  await deleteItem(USER_ID_KEY);
  // Onboarding sessions are tied to user_id on the backend; wipe local
  // resume-state too so a new user/login doesn't get pointed at someone
  // else's stale (now-404'd) sessionId.
  try {
    const { clearOnboardingState } = await import('./onboardingState');
    await clearOnboardingState();
  } catch {
    // best-effort; logout() below still clears the Zustand mirror
  }
  useAppStore.getState().logout();
}

// Synchronous read for apiFetch — pulls from Zustand, which is hydrated by
// loadAuth() on boot. Falls back to null before hydration completes.
export function getAuthTokenSync(): string | null {
  return useAppStore.getState().token;
}
