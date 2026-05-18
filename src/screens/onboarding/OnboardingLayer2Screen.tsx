// Layer 2 — 12 scenario cards walked one at a time.
//
// On mount: read answeredCardIds from Zustand (Session 1's progress survives
// app kill), show the next unanswered card. On option tap: POST
// /onboarding/layer2 with {sessionId, cardId, optionId}. Backend returns
// {radar.vector, cardsAnswered, cardsRemaining} — we trust the local mirror
// for "what to show next" but use cardsRemaining to know when to advance.
//
// Live radar mirrors the backend's running personalityVector so the user can
// watch their Twin take shape.

import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeScreen } from '../../components/SafeScreen';
import { api } from '../../api/client';
import { ApiError } from '../../api/types';
import type { Layer2Response, RadarVector } from '../../api/types';
import { DIMENSIONS, DIMENSION_LABELS } from '../../api/types';
import { useAppStore } from '../../store/useAppStore';
import { saveOnboardingState } from '../../api/onboardingState';
import {
  SCENARIO_CARDS,
  TOTAL_CARDS,
  nextUnansweredCard,
} from '../../data/scenarioCards';
import { StepHeader, handleExpiredSession, useOnboardingNav } from './_shared';

const RadarRow = ({ value }: { value: number }) => {
  // value is signed (-1..1). Render as a centered bar from the midpoint.
  const clamped = Math.max(-1, Math.min(1, value));
  const widthPct = Math.abs(clamped) * 50;
  const positive = clamped >= 0;
  return (
    <View className="h-2 bg-primary/60 rounded-full overflow-hidden border border-primary-light/10 flex-row">
      <View className="w-1/2 flex-row justify-end">
        {!positive && (
          <View
            className="h-full bg-amber-400/80 rounded-l-full"
            style={{ width: `${widthPct}%` }}
          />
        )}
      </View>
      <View className="w-1/2 flex-row">
        {positive && (
          <View
            className="h-full bg-secondary rounded-r-full"
            style={{ width: `${widthPct}%` }}
          />
        )}
      </View>
    </View>
  );
};

const LiveRadar = ({ vector }: { vector: RadarVector }) => (
  <View className="bg-primary/40 border border-primary-light/20 rounded-3xl p-4 mb-5">
    <View className="flex-row items-center mb-3">
      <Text className="text-[10px] uppercase font-bold text-primary-light tracking-widest flex-1">
        Live Personality Radar
      </Text>
      <View className="bg-secondary/15 px-2 py-0.5 rounded-md">
        <Text className="text-[9px] text-secondary font-mono font-bold uppercase">
          Updating
        </Text>
      </View>
    </View>
    <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
      {DIMENSIONS.map((dim) => (
        <View key={dim} className="w-1/2 mb-2.5" style={{ paddingHorizontal: 6 }}>
          <Text className="text-[10px] uppercase font-extrabold text-surface tracking-wider mb-1">
            {DIMENSION_LABELS[dim]}
          </Text>
          <RadarRow value={vector[dim] ?? 0} />
        </View>
      ))}
    </View>
  </View>
);

export const OnboardingLayer2Screen = () => {
  const navigation = useOnboardingNav();
  const sessionId = useAppStore((s) => s.onboardingSessionId);
  const answeredIds = useAppStore((s) => s.onboardingAnsweredCardIds);

  const [vector, setVector] = useState<RadarVector>({});
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentCard = useMemo(() => nextUnansweredCard(answeredIds), [answeredIds]);
  const cardsAnsweredCount = answeredIds.length;

  // Side-effect navigation must run AFTER render, not during. Calling
  // navigation.reset() inside a render branch triggers React 19's
  // "Cannot update a component while rendering" guard.
  useEffect(() => {
    if (sessionId && !currentCard) {
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingLayer3' }] });
    }
  }, [sessionId, currentCard, navigation]);

  // If somehow we landed here with no sessionId, kick back to Layer 1.
  if (!sessionId) {
    return (
      <SafeScreen className="bg-primary-dark">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-surface font-serif text-2xl mb-4 text-center">
            Let's start the chat first
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: 'OnboardingLayer1' }] })
            }
            className="bg-secondary rounded-2xl px-6 py-4"
          >
            <Text className="text-primary-dark font-bold tracking-widest uppercase text-xs">
              Go to Layer 1
            </Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  if (!currentCard) {
    // All 12 answered — the useEffect above will navigate. Render a spinner
    // until the navigator unmounts this screen.
    return (
      <SafeScreen className="bg-primary-dark">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#fcd34d" />
        </View>
      </SafeScreen>
    );
  }

  const submitOption = async () => {
    if (!selectedOptionId || submitting) return;
    setSubmitting(true);
    try {
      const res: Layer2Response = await api.onboarding.layer2({
        sessionId,
        cardId: currentCard.id,
        optionId: selectedOptionId,
      });
      setVector(res.radar.vector);

      const newAnswered = [...answeredIds, currentCard.id];
      const allDone = res.radar.cardsRemaining.length === 0;
      await saveOnboardingState({
        sessionId,
        lastLayer: allDone ? 2 : 1,
        answeredCardIds: newAnswered,
      });

      setSelectedOptionId(null);

      if (allDone) {
        navigation.reset({ index: 0, routes: [{ name: 'OnboardingLayer3' }] });
      }
    } catch (err) {
      if (await handleExpiredSession(err, navigation)) return;
      const msg = err instanceof ApiError ? err.message : 'Could not save answer. Try again.';
      Alert.alert('Save failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen className="bg-primary-dark">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <StepHeader
          step={2}
          label={`Card ${cardsAnsweredCount + 1} of ${TOTAL_CARDS}`}
        />

        <LiveRadar vector={vector} />

        <View className="bg-surface rounded-[32px] p-7 shadow-2xl mb-5">
          <Text className="text-secondary font-bold text-[10px] tracking-[0.25em] uppercase mb-2">
            {currentCard.title}
          </Text>
          <Text className="text-primary-dark font-serif text-lg leading-relaxed mb-6">
            {currentCard.prompt}
          </Text>
          <View>
            {currentCard.options.map((opt) => {
              const active = selectedOptionId === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setSelectedOptionId(opt.id)}
                  disabled={submitting}
                  className={`mb-2.5 px-5 py-4 rounded-2xl border ${
                    active
                      ? 'bg-primary border-primary'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <Text
                    className={`text-[13px] leading-snug ${
                      active ? 'text-surface font-semibold' : 'text-slate-800'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="flex-row justify-center gap-1.5 mb-4">
          {SCENARIO_CARDS.map((c, i) => {
            const done = answeredIds.includes(c.id);
            const isCurrent = c.id === currentCard.id;
            return (
              <View
                key={c.id}
                className={`h-1.5 rounded-full ${
                  done
                    ? 'bg-secondary w-4'
                    : isCurrent
                    ? 'bg-secondary/70 w-6'
                    : 'bg-primary-light/20 w-3'
                }`}
              />
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-primary-dark border-t border-white/5">
        <TouchableOpacity
          onPress={submitOption}
          disabled={submitting || !selectedOptionId}
          className="bg-secondary rounded-full py-4 items-center shadow-lg shadow-secondary/30"
          style={{ opacity: submitting || !selectedOptionId ? 0.5 : 1 }}
        >
          {submitting ? (
            <ActivityIndicator color="#064e3b" />
          ) : (
            <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">
              {cardsAnsweredCount === TOTAL_CARDS - 1 ? 'Build My Twin' : 'Next Card'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
};
