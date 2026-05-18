// Shared bits for the 5 onboarding screens.
//
// Keeps the screens DRY without dragging in a hook library:
//   - ProgressDots: 5-step header indicator
//   - useExpiredSessionHandler: detects the backend's "session expired" signal
//     (NOT_FOUND on a resume call) and resets the user back to Layer 1.
//
// Backend's onboarding session lives in an in-memory map with a 15-min TTL.
// Layers 2..finalize all call resumeOnboarding(sessionId) which throws
// NOT_FOUND if the entry was reaped. We catch that here and surface a clear
// recovery path instead of a generic error.

import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ApiError, type TwinSpec } from '../../api/types';
import { clearOnboardingState } from '../../api/onboardingState';
import { useAppStore } from '../../store/useAppStore';
import type { OnboardingStackParamList } from '../../navigation/types';

export const TOTAL_STEPS = 5;

export function ProgressDots({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <View className="flex-row items-center gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <View
          key={s}
          className={`h-1.5 w-7 rounded-full ${
            s < step
              ? 'bg-secondary'
              : s === step
              ? 'bg-secondary'
              : 'bg-primary-light/20'
          }`}
        />
      ))}
    </View>
  );
}

export function StepHeader({
  step,
  label,
  rightSlot,
}: {
  step: 1 | 2 | 3 | 4 | 5;
  label: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <View className="flex-row justify-between items-center mt-2 mb-6">
      <View>
        <Text className="text-secondary font-bold text-[10px] tracking-[0.2em] uppercase font-mono">
          Step {step} of {TOTAL_STEPS}
        </Text>
        <Text className="text-primary-light text-[11px] mt-0.5 font-bold tracking-wider uppercase">
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        {rightSlot}
        <ProgressDots step={step} />
      </View>
    </View>
  );
}

type OnboardingNav = NativeStackNavigationProp<OnboardingStackParamList>;

/**
 * If the error indicates the backend session was reaped (15-min TTL),
 * clear local state and route the user back to Layer 1. Returns true if it
 * handled the error (caller should bail), false otherwise.
 */
export async function handleExpiredSession(
  err: unknown,
  navigation: OnboardingNav
): Promise<boolean> {
  if (
    err instanceof ApiError &&
    (err.code === 'NOT_FOUND' || err.code === 'CONFLICT')
  ) {
    await clearOnboardingState();
    Alert.alert(
      'Session expired',
      'Your onboarding session timed out (15 min). Let\'s pick up from the start of the chat — your progress is reset.',
      [
        {
          text: 'Restart',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'OnboardingLayer1' }],
            }),
        },
      ]
    );
    return true;
  }
  return false;
}

export function useOnboardingNav(): OnboardingNav {
  return useNavigation<OnboardingNav>();
}

// ---------------------------------------------------------------------------
// Dev-only skip onboarding. Bypasses the 4-layer flow by stuffing a placeholder
// TwinSpec into the store + clearing the resume pointer + routing into Main.
//
// Caveat: the backend has NO real Twin row for the dev user_id after this
// runs, so MatchPool's POST /match/request will surface 'NOT_FOUND: No Twin v1
// found for user X'. That's fine for visual / nav-flow testing — match flow
// requires actually completing onboarding once.
// ---------------------------------------------------------------------------

const DEV_PLACEHOLDER_SPEC: TwinSpec = {
  identity: { name: 'Dev User', age: 28, gender: 'male', city: 'Lahore' },
  deen_level: 'practicing',
  family_setup: 'nuclear',
  family_loyalty_score: 0.6,
  career: { current: 'engineer', five_yr_goal: 'tech lead', ambition: 0.7 },
  finances: { current_status: 'stable', lifestyle_pref: 'comfortable' },
  kids_timeline: '2-3_yrs',
  conflict_style: 'direct',
  geography: { current_city: 'Lahore', ten_yr_pref: 'Lahore', flexible: true },
  dealbreakers: [],
  dimension_weights: {
    deen: 0.15,
    family: 0.15,
    career: 0.1,
    finances: 0.1,
    kids: 0.15,
    conflict: 0.1,
    geography: 0.1,
    dealbreakers: 0.15,
  },
  system_prompt: '[dev-skip placeholder — no backend Twin exists for this user]',
  language_pref: 'en',
  version: 1,
};

export async function devSkipOnboarding(navigation: OnboardingNav): Promise<void> {
  await clearOnboardingState();
  useAppStore.getState().setTwinSpec(DEV_PLACEHOLDER_SPEC);
  navigation.getParent()?.dispatch(
    CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] })
  );
}

/**
 * Small text link shown only in __DEV__ — used in OnboardingLayer1's header to
 * let developers bypass the 4-layer flow for UI testing. Not visible in
 * production builds.
 */
export function DevSkipLink({ onSkip }: { onSkip: () => void }) {
  if (!__DEV__) return null;
  return (
    <TouchableOpacity onPress={onSkip} hitSlop={10}>
      <Text className="text-secondary/70 text-[10px] font-bold uppercase tracking-widest">
        [dev] skip →
      </Text>
    </TouchableOpacity>
  );
}
