// Layer 3 — Twin statements + corrections.
//
// On mount we POST /onboarding/layer3 with NO corrections — backend generates
// a small set of self-portrait statements (one per dimension it has signal on).
// User reads each, agrees / disagrees, optionally writes a correction. We POST
// again with `corrections: [...]` (1..3 items per backend schema) to commit.
//
// Backend dispatches by presence of `corrections`, not a `mode` field.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeScreen } from '../../components/SafeScreen';
import { api } from '../../api/client';
import { ApiError } from '../../api/types';
import type { Layer3Correction, TwinStatement } from '../../api/types';
import { DIMENSION_LABELS } from '../../api/types';
import { useAppStore } from '../../store/useAppStore';
import { saveOnboardingState } from '../../api/onboardingState';
import { StepHeader, handleExpiredSession, useOnboardingNav } from './_shared';

type Draft = {
  dimension: TwinStatement['dimension'];
  statement: string;
  agree: boolean | null;
  correction: string;
};

export const OnboardingLayer3Screen = () => {
  const navigation = useOnboardingNav();
  const sessionId = useAppStore((s) => s.onboardingSessionId);
  const answeredCardIds = useAppStore((s) => s.onboardingAnsweredCardIds);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  // React 19 StrictMode double-invokes effects in dev. The Gemini call is
  // expensive (a Layer-3 generate burns Pro budget + falls back to Flash on
  // timeout), so we gate with a ref to ensure exactly-once per sessionId.
  const generateFiredFor = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    if (generateFiredFor.current === sessionId) return;
    generateFiredFor.current = sessionId;

    let cancelled = false;
    (async () => {
      try {
        const res = await api.onboarding.layer3({ sessionId });
        if (cancelled) return;
        setDrafts(
          res.statements.map((s) => ({
            dimension: s.dimension,
            statement: s.statement,
            agree: s.agree,
            correction: s.correction ?? '',
          }))
        );
      } catch (err) {
        if (await handleExpiredSession(err, navigation)) return;
        const msg =
          err instanceof ApiError ? err.message : 'Could not load your Twin statements.';
        Alert.alert('Load failed', msg);
        // Reset the gate so a manual retry can fire again.
        generateFiredFor.current = null;
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally NOT including `navigation` — it's not stable across
    // renders and would cause the expensive layer3 call to fire repeatedly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const setAgree = (i: number, agree: boolean) =>
    setDrafts((ds) => ds.map((d, idx) => (idx === i ? { ...d, agree } : d)));

  const setCorrection = (i: number, correction: string) =>
    setDrafts((ds) => ds.map((d, idx) => (idx === i ? { ...d, correction } : d)));

  const completeCount = useMemo(() => drafts.filter((d) => d.agree !== null).length, [drafts]);
  const canSubmit = completeCount > 0 && completeCount <= 3;

  const submit = async () => {
    if (!sessionId || !canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const corrections: Layer3Correction[] = drafts
        .filter((d) => d.agree !== null)
        .slice(0, 3) // backend allows 1..3
        .map((d) => ({
          dimension: d.dimension,
          agree: d.agree as boolean,
          ...(d.correction.trim().length > 0
            ? { correction: d.correction.trim().slice(0, 500) }
            : {}),
        }));

      await api.onboarding.layer3({ sessionId, corrections });
      await saveOnboardingState({
        sessionId,
        lastLayer: 3,
        answeredCardIds,
      });
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingWali' }] });
    } catch (err) {
      if (await handleExpiredSession(err, navigation)) return;
      const msg =
        err instanceof ApiError ? err.message : 'Could not save your corrections. Try again.';
      Alert.alert('Save failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionId) {
    return (
      <SafeScreen className="bg-primary-dark">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-surface font-serif text-2xl mb-4 text-center">
            Your session is missing
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

  if (loading) {
    return (
      <SafeScreen className="bg-primary-dark">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fcd34d" />
          <Text className="text-primary-light mt-4 text-xs uppercase tracking-widest font-bold">
            Forging your Twin draft…
          </Text>
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
        <StepHeader step={3} label="Review your Twin" />

        <Text className="text-surface font-serif text-3xl leading-tight mb-2">
          Is this really you?
        </Text>
        <Text className="text-primary-light text-[13px] leading-snug mb-6">
          Layla drafted these from our chat and your scenario answers. Mark each as right or
          off — add a quick correction if it's close-but-not-quite.
        </Text>

        {drafts.map((d, i) => {
          const isAgree = d.agree === true;
          const isDisagree = d.agree === false;
          return (
            <View
              key={d.dimension}
              className="bg-primary/40 border border-primary-light/20 rounded-3xl p-5 mb-4"
            >
              <Text className="text-secondary text-[10px] uppercase tracking-widest font-bold mb-2">
                {DIMENSION_LABELS[d.dimension]}
              </Text>
              <Text className="text-surface font-serif text-base leading-relaxed mb-4">
                “{d.statement}”
              </Text>
              <View className="flex-row gap-3 mb-3">
                <TouchableOpacity
                  onPress={() => setAgree(i, true)}
                  className={`flex-1 py-3 rounded-xl items-center border ${
                    isAgree
                      ? 'bg-secondary border-secondary'
                      : 'bg-transparent border-primary-light/30'
                  }`}
                >
                  <Text
                    className={`font-bold text-xs tracking-widest ${
                      isAgree ? 'text-primary-dark' : 'text-surface'
                    }`}
                  >
                    ✓ Yes, that's me
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAgree(i, false)}
                  className={`flex-1 py-3 rounded-xl items-center border ${
                    isDisagree
                      ? 'bg-amber-500 border-amber-500'
                      : 'bg-transparent border-primary-light/30'
                  }`}
                >
                  <Text
                    className={`font-bold text-xs tracking-widest ${
                      isDisagree ? 'text-primary-dark' : 'text-surface'
                    }`}
                  >
                    ✎ Not quite
                  </Text>
                </TouchableOpacity>
              </View>
              {isDisagree && (
                <TextInput
                  value={d.correction}
                  onChangeText={(t) => setCorrection(i, t)}
                  placeholder="What would you say instead? (optional, max 500 chars)"
                  placeholderTextColor="#64748b"
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                  className="bg-surface/10 border border-surface/20 rounded-xl px-3 py-3 text-surface text-sm"
                  style={{ minHeight: 70 }}
                />
              )}
            </View>
          );
        })}

        <Text className="text-primary-light/70 text-[11px] text-center mt-2">
          {completeCount === 0
            ? 'Tap "Yes" or "Not quite" on at least one statement to continue.'
            : completeCount > 3
            ? 'Only your first 3 reactions will be sent (backend limit).'
            : `${completeCount} of ${drafts.length} reviewed.`}
        </Text>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-primary-dark border-t border-white/5">
        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit || submitting}
          className="bg-secondary rounded-full py-4 items-center shadow-lg shadow-secondary/30"
          style={{ opacity: !canSubmit || submitting ? 0.5 : 1 }}
        >
          {submitting ? (
            <ActivityIndicator color="#064e3b" />
          ) : (
            <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">
              Continue
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
};
