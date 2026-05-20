// Layer 1 — chat interview. The user talks to "Layla" (the onboarding agent)
// until the backend reports next_topic='done'. We POST each user message via
// /onboarding/layer1; the first call mints sessionId, subsequent calls
// round-trip it. If the model returns chip_options (low-confidence fallback),
// we render them as tap-to-send chips.
//
// Session 7: voice input + language toggle. Mic button beside the text input
// records at 16kHz mono (WAV LINEAR16 on iOS, AMR_WB on Android) and POSTs
// audioBase64 to /onboarding/transcribe (STT-only, no LLM turn). Transcript
// lands in the chat draft so the user can review/edit before tapping Send —
// requested in the Session-7 hotfix because auto-send was an opaque round-trip.
// Low STT confidence still surfaces an inline warning + the chip-fallback chips
// from the agent's previous reply.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect } from 'react-native-svg';
import { SafeScreen } from '../../components/SafeScreen';
import { api } from '../../api/client';
import { ApiError } from '../../api/types';
import type { Layer1Request, Layer1Response, LanguagePref } from '../../api/types';
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
  voice?: boolean;
};

const OPENING_PROMPT =
  "Assalam-o-alaikum. I'm Layla — your AI onboarder. Tell me your name and city to get started, and we'll build your Twin from there.";

// 16kHz mono — matches what the backend STT expects after detectEncoding().
// iOS produces a WAV file with RIFF header (LINEAR16); Android produces an
// AMR_WB file with "#!AMR-WB\n" header. Both autodetect server-side.
const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: false,
  android: {
    extension: '.amr',
    outputFormat: Audio.AndroidOutputFormat.AMR_WB,
    audioEncoder: Audio.AndroidAudioEncoder.AMR_WB,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 23850,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// Clean SVG glyphs — replace the cringe-y emoji 🎙 / ■ pair. Stroke-only,
// 1.75px weight, no fill. Color is driven by the `color` prop so the
// idle/recording states can swap saffron <-> dark-teal without an asset rebuild.
const MicGlyph = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x={9}
      y={3}
      width={6}
      height={11}
      rx={3}
      stroke={color}
      strokeWidth={1.75}
    />
    <Path
      d="M6 11v1a6 6 0 0 0 12 0v-1"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
    />
    <Path d="M12 18v3" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    <Path d="M9 21h6" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
  </Svg>
);

const StopGlyph = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={6.5} y={6.5} width={11} height={11} rx={2.5} fill={color} />
  </Svg>
);

const LANG_OPTIONS: { id: LanguagePref; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'ro_ur', label: 'Ro-Urdu' },
  { id: 'ur', label: 'اردو' },
];

export const OnboardingLayer1Screen = () => {
  const navigation = useOnboardingNav();
  const existingSessionId = useAppStore((s) => s.onboardingSessionId);

  const [language, setLanguage] = useState<LanguagePref>('en');
  const [history, setHistory] = useState<ChatTurn[]>([
    { role: 'agent', text: OPENING_PROMPT },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Auto-scroll on new turns.
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [history.length, sending]);

  // Pulse the mic chip while recording.
  useEffect(() => {
    if (!recording) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [recording, pulseAnim]);

  // Tear down any active recording on unmount so the mic isn't left hot.
  useEffect(() => {
    return () => {
      const rec = recordingRef.current;
      if (rec) {
        rec.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  const lastAgentChips = useMemo(() => {
    for (let i = history.length - 1; i >= 0; i--) {
      const h = history[i];
      if (h.role === 'agent' && h.chips && h.chips.length > 0) return h.chips;
      if (h.role === 'user') return undefined;
    }
    return undefined;
  }, [history]);

  const postLayer1 = async (body: Layer1Request, optimisticBubbleIndex: number) => {
    try {
      const res: Layer1Response = await api.onboarding.layer1(body);

      const newSessionId = res.sessionId;
      setSessionId(newSessionId);
      await saveOnboardingState({
        sessionId: newSessionId,
        lastLayer: res.turn.next_topic === 'done' ? 1 : 0,
        answeredCardIds: [],
      });

      setHistory((h) => {
        const next = [...h];
        // Replace the optimistic voice placeholder with the real transcript.
        if (res.turn.sttTranscript && next[optimisticBubbleIndex]?.role === 'user') {
          next[optimisticBubbleIndex] = {
            ...next[optimisticBubbleIndex]!,
            text: res.turn.sttTranscript,
          };
        }
        return [
          ...next,
          {
            role: 'agent',
            text: res.turn.reply,
            ...(res.turn.chip_options && res.turn.chip_options.length > 0
              ? { chips: res.turn.chip_options }
              : {}),
          },
        ];
      });

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
      setHistory((h) => {
        const next = [...h];
        next.splice(optimisticBubbleIndex, 1);
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending || recording) return;

    setHistory((h) => [...h, { role: 'user', text: trimmed }]);
    const optimisticIdx = history.length; // index of bubble just appended
    setDraft('');
    setSending(true);

    await postLayer1(
      {
        ...(sessionId ? { sessionId } : {}),
        language,
        text: trimmed,
      },
      optimisticIdx
    );
  };

  const startRecording = async () => {
    if (sending || recording || transcribing) return;
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          'Microphone permission needed',
          'Lab-Viah needs microphone access to record your voice answers.'
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(RECORDING_OPTIONS);
      await rec.startAsync();
      recordingRef.current = rec;
      setRecording(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not start recording.';
      Alert.alert('Recording failed', msg);
      recordingRef.current = null;
      setRecording(false);
    }
  };

  // Session-7 hotfix UX: stop recording → transcribe-only → drop the text into
  // the chat draft so the user can read it BEFORE sending. No auto-send.
  const stopRecordingAndPreview = async () => {
    const rec = recordingRef.current;
    if (!rec) {
      setRecording(false);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRecording(false);

    let uri: string | null = null;
    try {
      await rec.stopAndUnloadAsync();
      uri = rec.getURI();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not finalize recording.';
      Alert.alert('Recording failed', msg);
      recordingRef.current = null;
      return;
    } finally {
      recordingRef.current = null;
    }

    if (!uri) {
      Alert.alert('Recording empty', 'No audio was captured. Try again.');
      return;
    }

    setTranscribing(true);
    try {
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const res = await api.onboarding.transcribe({ audioBase64, language });
      if (!res.transcript || res.stub) {
        Alert.alert(
          'Could not transcribe',
          res.stub
            ? 'Speech-to-text is not configured on the server.'
            : "I couldn't catch that — try recording again in a quieter spot, or just type your reply."
        );
      } else {
        // Append/replace the draft with the transcript. If there was already
        // typed text, prepend the transcript with a space so the user can
        // continue editing without losing what they typed.
        setDraft((prev) =>
          prev.trim().length > 0 ? `${res.transcript} ${prev}` : res.transcript
        );
        if (res.lowConfidence) {
          // Low confidence — let them know but still show the draft so they
          // can fix it up rather than re-record.
          Alert.alert(
            'Low STT confidence',
            'Please double-check the transcript before sending. You can edit it inline.'
          );
        }
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not transcribe audio.';
      Alert.alert('Transcribe failed', msg);
    } finally {
      setTranscribing(false);
    }
  };

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.1] });

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

          {/* Language toggle pill */}
          <View className="flex-row items-center justify-end mb-2">
            <View className="flex-row bg-primary border border-primary-light/20 rounded-full p-1">
              {LANG_OPTIONS.map((opt) => {
                const active = language === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => {
                      if (recording || sending) return;
                      Haptics.selectionAsync().catch(() => {});
                      setLanguage(opt.id);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Language: ${opt.label}`}
                    className={`px-3 py-1 rounded-full ${active ? 'bg-secondary' : ''}`}
                    disabled={recording || sending}
                  >
                    <Text
                      className={`text-[11px] font-bold tracking-widest uppercase ${
                        active ? 'text-primary-dark' : 'text-primary-light/80'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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
                  accessibilityRole="button"
                  accessibilityLabel={`Quick reply: ${chip}`}
                >
                  <Text className="text-secondary text-xs font-bold">{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {recording && (
          <View className="px-5 pb-2 flex-row items-center justify-center gap-2">
            <View style={{ width: 10, height: 10 }}>
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e9a847',
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e9a847',
                }}
              />
            </View>
            <Text className="text-secondary text-[11px] uppercase tracking-widest font-bold">
              Listening… tap stop to preview
            </Text>
          </View>
        )}

        {transcribing && (
          <View className="px-5 pb-2 flex-row items-center justify-center gap-2">
            <ActivityIndicator size="small" color="#e9a847" />
            <Text className="text-secondary text-[11px] uppercase tracking-widest font-bold">
              Transcribing… review before sending
            </Text>
          </View>
        )}

        <View
          className="border-t border-white/5 bg-primary-dark px-4 pt-3 pb-5"
          style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={
              recording
                ? 'Listening…'
                : transcribing
                  ? 'Transcribing…'
                  : 'Type your reply…'
            }
            placeholderTextColor="#059669"
            multiline
            editable={!sending && !recording && !transcribing}
            className="flex-1 bg-primary border border-primary-light/20 rounded-2xl px-4 py-3 text-surface text-[15px]"
            style={{ maxHeight: 110, minHeight: 46 }}
          />

          {/* Mic button — always shown so the user can append a voice clip even
              with text already in the draft. Disabled while sending or
              transcribing to avoid concurrent state. */}
          <TouchableOpacity
            onPress={recording ? stopRecordingAndPreview : startRecording}
            disabled={sending || transcribing}
            accessibilityRole="button"
            accessibilityLabel={recording ? 'Stop recording and preview transcript' : 'Record voice answer'}
            accessibilityState={{ busy: recording || transcribing }}
            className={`rounded-2xl items-center justify-center ${
              recording ? 'bg-saffron' : 'bg-primary border border-secondary/40'
            }`}
            style={{
              minHeight: 46,
              minWidth: 46,
              opacity: sending || transcribing ? 0.5 : 1,
            }}
          >
            {recording ? (
              <StopGlyph color="#064e3b" size={18} />
            ) : (
              <MicGlyph color="#e9a847" size={20} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => sendMessage(draft)}
            disabled={sending || draft.trim().length === 0 || recording || transcribing}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            className="bg-secondary rounded-2xl px-5 py-3 items-center justify-center"
            style={{
              opacity:
                sending || draft.trim().length === 0 || recording || transcribing
                  ? 0.5
                  : 1,
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
