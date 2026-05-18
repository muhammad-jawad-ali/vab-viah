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
import { Alert, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ApiError } from '../../api/types';
import { clearOnboardingState } from '../../api/onboardingState';
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
