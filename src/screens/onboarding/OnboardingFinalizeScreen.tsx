// Layer 5 — finalize. POSTs /onboarding/finalize, which forges the Twin spec
// and persists it to Supabase. On success we stash the spec in Zustand, clear
// the local onboarding state, and route to Main.

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { SafeScreen } from '../../components/SafeScreen';
import { api } from '../../api/client';
import { ApiError } from '../../api/types';
import { useAppStore } from '../../store/useAppStore';
import { clearOnboardingState } from '../../api/onboardingState';
import { StepHeader, handleExpiredSession, useOnboardingNav } from './_shared';

export const OnboardingFinalizeScreen = () => {
  const navigation = useOnboardingNav();
  const sessionId = useAppStore((s) => s.onboardingSessionId);
  const setTwinSpec = useAppStore((s) => s.setTwinSpec);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const finalize = async () => {
    if (!sessionId || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.onboarding.finalize({ sessionId });
      setTwinSpec(res.spec);
      await clearOnboardingState();
      setDone(true);
      // Jump to root Main tabs. Reset RootStackParamList so the user can't go
      // back into onboarding from here.
      navigation.getParent()?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      );
    } catch (err) {
      if (await handleExpiredSession(err, navigation)) return;
      const msg =
        err instanceof ApiError ? err.message : 'Could not finalize your Twin. Try again.';
      Alert.alert('Finalize failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionId) {
    return (
      <SafeScreen className="bg-primary-dark">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-surface font-serif text-2xl mb-4 text-center">
            Session missing
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: 'OnboardingLayer1' }] })
            }
            className="bg-secondary rounded-2xl px-6 py-4"
          >
            <Text className="text-primary-dark font-bold tracking-widest uppercase text-xs">
              Restart
            </Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen className="bg-primary-dark">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <StepHeader step={5} label="Final review" />

        <Text className="text-surface font-serif text-3xl leading-tight mb-3">
          Ready to lock your Twin.
        </Text>
        <Text className="text-primary-light text-[13px] leading-snug mb-6">
          Tap below to commit your Twin to the match pool. After this, our matchmaker can
          start running debates against candidates on your behalf.
        </Text>

        <View className="border border-secondary/30 bg-secondary/5 p-6 rounded-3xl mb-6">
          <Text className="text-secondary font-bold text-[10px] tracking-widest uppercase mb-3">
            Twin checklist
          </Text>
          <Row label="Chat interview" status="done" />
          <Row label="12 scenario cards" status="done" />
          <Row label="Statement corrections" status="done" />
          <Row label="Wali (optional)" status="done" />
        </View>

        {done ? (
          <View className="items-center py-4">
            <Text className="text-secondary text-xs font-bold tracking-widest uppercase mb-2">
              ✓ Twin v1 forged
            </Text>
            <ActivityIndicator color="#fcd34d" />
          </View>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-primary-dark border-t border-white/5">
        <TouchableOpacity
          onPress={finalize}
          disabled={submitting || done}
          className="bg-secondary rounded-full py-4 items-center shadow-lg shadow-secondary/30"
          style={{ opacity: submitting || done ? 0.5 : 1 }}
        >
          {submitting ? (
            <ActivityIndicator color="#064e3b" />
          ) : (
            <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">
              {done ? 'Twin Locked' : 'Forge My Twin'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
};

const Row = ({ label, status }: { label: string; status: 'done' | 'pending' }) => (
  <View className="flex-row items-center justify-between py-2.5 border-b border-secondary/10">
    <Text className="text-surface text-sm">{label}</Text>
    <Text
      className={`text-[10px] font-bold tracking-widest uppercase ${
        status === 'done' ? 'text-secondary' : 'text-primary-light'
      }`}
    >
      {status === 'done' ? '✓ Ready' : 'Pending'}
    </Text>
  </View>
);
