// Layer 4 — Wali. Per MASTERPLAN non-negotiable: the user is NEVER blocked by
// a wali. The "Skip" CTA is visually prominent. If the user fills the form we
// POST /onboarding/wali; otherwise we go straight to finalize.
//
// Backend wali_phone schema is E.164 (regex /^\+\d{7,15}$/). `override` is a
// required object but all inner fields are optional, so {} is valid.

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeScreen } from '../../components/SafeScreen';
import { api } from '../../api/client';
import { ApiError } from '../../api/types';
import type { DeenLevel, FamilySetup, KidsTimeline, WaliOverride } from '../../api/types';
import { useAppStore } from '../../store/useAppStore';
import { saveOnboardingState } from '../../api/onboardingState';
import { StepHeader, handleExpiredSession, useOnboardingNav } from './_shared';

const DEEN_OPTIONS: DeenLevel[] = ['strict', 'practicing', 'moderate', 'cultural', 'secular'];
const FAMILY_OPTIONS: FamilySetup[] = ['joint', 'nuclear', 'single_parent'];
const KIDS_OPTIONS: KidsTimeline[] = ['asap', '2-3_yrs', '5_plus', 'none'];

const titleCase = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const ChipRow = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: T[];
  onChange: (v: T | undefined) => void;
}) => (
  <View className="flex-row flex-wrap gap-2">
    {options.map((opt) => {
      const active = value === opt;
      return (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(active ? undefined : opt)}
          className={`px-3.5 py-2 rounded-full border ${
            active
              ? 'bg-secondary border-secondary'
              : 'bg-primary/40 border-primary-light/20'
          }`}
        >
          <Text
            className={`text-[11px] font-bold tracking-wider uppercase ${
              active ? 'text-primary-dark' : 'text-surface'
            }`}
          >
            {titleCase(opt)}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export const OnboardingWaliScreen = () => {
  const navigation = useOnboardingNav();
  const sessionId = useAppStore((s) => s.onboardingSessionId);
  const answeredCardIds = useAppStore((s) => s.onboardingAnsweredCardIds);

  const [waliPhone, setWaliPhone] = useState('+92');
  const [deen, setDeen] = useState<DeenLevel | undefined>(undefined);
  const [family, setFamily] = useState<FamilySetup | undefined>(undefined);
  const [kids, setKids] = useState<KidsTimeline | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const goToFinalize = async () => {
    if (sessionId) {
      await saveOnboardingState({
        sessionId,
        lastLayer: 4,
        answeredCardIds,
      });
    }
    navigation.reset({ index: 0, routes: [{ name: 'OnboardingFinalize' }] });
  };

  const skip = async () => {
    await goToFinalize();
  };

  const submit = async () => {
    if (!sessionId || submitting) return;
    if (!/^\+\d{7,15}$/.test(waliPhone)) {
      Alert.alert(
        'Phone format',
        'Wali phone must be in E.164 format, e.g. +923001234567. Or tap "Skip" to add later.'
      );
      return;
    }
    setSubmitting(true);
    try {
      const override: WaliOverride = {
        ...(deen ? { deen_level: deen } : {}),
        ...(family ? { family_setup: family } : {}),
        ...(kids ? { kids_timeline: kids } : {}),
      };
      await api.onboarding.wali({
        sessionId,
        wali_phone: waliPhone.trim(),
        override,
        ...(notes.trim().length > 0 ? { notes: notes.trim().slice(0, 1000) } : {}),
      });
      await goToFinalize();
    } catch (err) {
      if (await handleExpiredSession(err, navigation)) return;
      const msg =
        err instanceof ApiError ? err.message : 'Could not save wali details. Try again.';
      Alert.alert('Save failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen className="bg-primary-dark">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
        >
          <StepHeader
            step={4}
            label="Wali (optional)"
            rightSlot={
              <TouchableOpacity
                onPress={skip}
                className="bg-primary/40 border border-secondary/30 rounded-full px-3 py-1.5"
              >
                <Text className="text-secondary font-bold text-[10px] tracking-widest uppercase">
                  Skip ➔
                </Text>
              </TouchableOpacity>
            }
          />

          <Text className="text-surface font-serif text-3xl leading-tight mb-2">
            Want to loop in your wali?
          </Text>
          <Text className="text-primary-light text-[13px] leading-snug mb-6">
            Totally optional. We'll generate a brief for them when you book a meeting — they
            never need to approve a match for you to proceed. You can add this later from
            Settings.
          </Text>

          <View className="bg-primary/40 border border-primary-light/20 rounded-3xl p-5 mb-4">
            <Text className="text-secondary text-[10px] uppercase tracking-widest font-bold mb-2">
              Wali phone (E.164)
            </Text>
            <TextInput
              value={waliPhone}
              onChangeText={setWaliPhone}
              placeholder="+923001234567"
              placeholderTextColor="#059669"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-primary-dark border border-primary-light/30 rounded-xl px-4 py-3 text-surface text-base"
            />
          </View>

          <View className="bg-primary/40 border border-primary-light/20 rounded-3xl p-5 mb-4">
            <Text className="text-secondary text-[10px] uppercase tracking-widest font-bold mb-3">
              Wali overrides (optional)
            </Text>

            <Text className="text-surface/70 text-[11px] uppercase tracking-widest mb-2">
              Deen level
            </Text>
            <ChipRow value={deen} options={DEEN_OPTIONS} onChange={setDeen} />

            <Text className="text-surface/70 text-[11px] uppercase tracking-widest mt-4 mb-2">
              Family setup
            </Text>
            <ChipRow value={family} options={FAMILY_OPTIONS} onChange={setFamily} />

            <Text className="text-surface/70 text-[11px] uppercase tracking-widest mt-4 mb-2">
              Kids timeline
            </Text>
            <ChipRow value={kids} options={KIDS_OPTIONS} onChange={setKids} />
          </View>

          <View className="bg-primary/40 border border-primary-light/20 rounded-3xl p-5 mb-4">
            <Text className="text-secondary text-[10px] uppercase tracking-widest font-bold mb-2">
              Notes for your wali (optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything they should know upfront?"
              placeholderTextColor="#64748b"
              multiline
              maxLength={1000}
              textAlignVertical="top"
              className="bg-surface/10 border border-surface/20 rounded-xl px-3 py-3 text-surface text-sm"
              style={{ minHeight: 90 }}
            />
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-primary-dark border-t border-white/5">
          <TouchableOpacity
            onPress={submit}
            disabled={submitting}
            className="bg-secondary rounded-full py-4 items-center shadow-lg shadow-secondary/30 mb-3"
            style={{ opacity: submitting ? 0.5 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color="#064e3b" />
            ) : (
              <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">
                Save wali details
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={skip} disabled={submitting} className="items-center">
            <Text className="text-primary-light text-xs font-bold tracking-widest uppercase underline">
              Skip — I'll add later
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};
