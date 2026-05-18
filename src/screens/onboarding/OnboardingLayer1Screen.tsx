// Layer 1 — chat interview. The user talks to "Layla" (the onboarding agent)
// until the backend reports next_topic='done'. We POST each user message via
// /onboarding/layer1; the first call mints sessionId, subsequent calls
// round-trip it. If the model returns chip_options (low-confidence fallback),
// we render them as tap-to-send chips.
//
// Text input only for MVP — voice/audioBase64 is deferred to a later session.

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import type { Layer1Response } from '../../api/types';
import { useAppStore } from '../../store/useAppStore';
import { saveOnboardingState } from '../../api/onboardingState';
import {
  DevSkipLink,
  StepHeader,
  devSkipOnboarding,
  handleExpiredSession,
  useOnboardingNav,
} from './_shared';

type ChatTurn = {
  role: 'agent' | 'user';
  text: string;
  chips?: string[];
};

const OPENING_PROMPT =
  "Assalam-o-alaikum. I'm Layla — your AI onboarder. Tell me your name and city to get started, and we'll build your Twin from there.";

export const OnboardingLayer1Screen = () => {
  const navigation = useOnboardingNav();
  const existingSessionId = useAppStore((s) => s.onboardingSessionId);

  const [history, setHistory] = useState<ChatTurn[]>([
    { role: 'agent', text: OPENING_PROMPT },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId);
  const scrollRef = useRef<ScrollView | null>(null);

  // Auto-scroll on new turns.
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [history.length, sending]);

  const lastAgentChips = useMemo(() => {
    for (let i = history.length - 1; i >= 0; i--) {
      const h = history[i];
      if (h.role === 'agent' && h.chips && h.chips.length > 0) return h.chips;
      if (h.role === 'user') return undefined;
    }
    return undefined;
  }, [history]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setHistory((h) => [...h, { role: 'user', text: trimmed }]);
    setDraft('');
    setSending(true);

    try {
      const res: Layer1Response = await api.onboarding.layer1({
        ...(sessionId ? { sessionId } : {}),
        text: trimmed,
      });

      const newSessionId = res.sessionId;
      setSessionId(newSessionId);
      await saveOnboardingState({
        sessionId: newSessionId,
        lastLayer: res.turn.next_topic === 'done' ? 1 : 0,
        answeredCardIds: [],
      });

      setHistory((h) => [
        ...h,
        {
          role: 'agent',
          text: res.turn.reply,
          ...(res.turn.chip_options && res.turn.chip_options.length > 0
            ? { chips: res.turn.chip_options }
            : {}),
        },
      ]);

      if (res.turn.next_topic === 'done') {
        // Brief pause so the user sees the agent's closing reply, then advance.
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: 'OnboardingLayer2' }] });
        }, 800);
      }
    } catch (err) {
      if (await handleExpiredSession(err, navigation)) return;
      const msg = err instanceof ApiError ? err.message : 'Could not send message. Try again.';
      Alert.alert('Send failed', msg);
      // Roll back the optimistic user bubble so they can retry.
      setHistory((h) => h.slice(0, -1));
      setDraft(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeScreen className="bg-primary-dark">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <View className="px-6 pt-2">
          <StepHeader
            step={1}
            label="Chat with Layla"
            rightSlot={
              <DevSkipLink onSkip={() => devSkipOnboarding(navigation)} />
            }
          />
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
        >
          {history.map((turn, i) => (
            <View
              key={`${i}-${turn.role}`}
              className={`mb-3 ${turn.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <View
                className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                  turn.role === 'user'
                    ? 'bg-secondary'
                    : 'bg-primary border border-primary-light/20'
                }`}
              >
                <Text
                  className={`${
                    turn.role === 'user'
                      ? 'text-primary-dark font-semibold'
                      : 'text-surface'
                  } text-[15px] leading-snug`}
                >
                  {turn.text}
                </Text>
              </View>
            </View>
          ))}

          {sending && (
            <View className="mb-3 items-start">
              <View className="bg-primary border border-primary-light/20 rounded-2xl px-4 py-3 flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#fcd34d" />
                <Text className="text-primary-light text-xs uppercase tracking-widest font-bold">
                  Layla is typing
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {lastAgentChips && lastAgentChips.length > 0 && !sending && (
          <View className="px-5 pb-2">
            <Text className="text-primary-light/70 text-[10px] uppercase tracking-widest mb-2 ml-1">
              Quick reply
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {lastAgentChips.map((chip) => (
                <TouchableOpacity
                  key={chip}
                  onPress={() => sendMessage(chip)}
                  className="bg-primary border border-secondary/40 rounded-full px-4 py-2"
                  disabled={sending}
                >
                  <Text className="text-secondary text-xs font-bold">{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View
          className="border-t border-white/5 bg-primary-dark px-4 pt-3 pb-5"
          style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type your reply…"
            placeholderTextColor="#059669"
            multiline
            editable={!sending}
            className="flex-1 bg-primary border border-primary-light/20 rounded-2xl px-4 py-3 text-surface text-[15px]"
            style={{ maxHeight: 110, minHeight: 46 }}
          />
          <TouchableOpacity
            onPress={() => sendMessage(draft)}
            disabled={sending || draft.trim().length === 0}
            className="bg-secondary rounded-2xl px-5 py-3 items-center justify-center"
            style={{
              opacity: sending || draft.trim().length === 0 ? 0.5 : 1,
              minHeight: 46,
            }}
          >
            {sending ? (
              <ActivityIndicator color="#064e3b" />
            ) : (
              <Text className="text-primary-dark font-bold text-xs tracking-widest uppercase">
                Send
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};
